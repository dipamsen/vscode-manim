import * as vscode from "vscode";
import { getWebviewOptions, getNonce } from "./functions";

export default class ManimOutputPanel {
  public static currentPanel: ManimOutputPanel | undefined;

  public sceneName: string;

  public static readonly viewType = 'manim-output';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, args: any) {

    // If we already have a panel, show it.
    if (ManimOutputPanel.currentPanel) {
      ManimOutputPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
      ManimOutputPanel.currentPanel.sceneName = args;
      ManimOutputPanel.currentPanel.update();
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      ManimOutputPanel.viewType,
      'Manim Output',
      vscode.ViewColumn.Beside,
      getWebviewOptions(),
    );

    ManimOutputPanel.currentPanel = new ManimOutputPanel(panel, extensionUri, args);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, args: string) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this.sceneName = args;
    this.update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this.update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public doRefactor() {
    // Send a message to the webview webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({ command: 'refactor' });
  }

  public dispose() {
    ManimOutputPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }


  update() {
    this._panel.title = "Manim output - " + this.sceneName;
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    const fileName = vscode.window.activeTextEditor!.document.fileName;

    const gif = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, 'media', 'videos', fileName.split("\\").pop()!.split(".").slice(0, -1).join("."), "1080p60", this.sceneName + ".gif");

    const gifUrl = webview.asWebviewUri(gif);

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:;">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">-->

				<title>Cat Coding</title>
			</head>
			<body>
        <h1>${this.sceneName}</h1>
        <img src="${gifUrl}"></img>
			<!--	<script nonce="${nonce}" src="${scriptUri}"></script> -->
			</body>
			</html>`;
  }
}
