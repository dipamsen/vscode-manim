import * as vscode from 'vscode';
import { getWebviewOptions } from './functions';
import ManimOutputPanel from "./ManimOutputPanel";
import RunButtonProvider from "./RunButtonProvider";

export function activate(context: vscode.ExtensionContext) {

  const codelensProvider = new RunButtonProvider();

  vscode.languages.registerCodeLensProvider({ language: "python" }, codelensProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('manim.helloWorld', () => {
      vscode.window.showInformationMessage('Hello World from Manim Preview and Snippets!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('manim.start', () => {
      ManimOutputPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('manim.doRefactor', () => {
      if (ManimOutputPanel.currentPanel) {
        ManimOutputPanel.currentPanel.doRefactor();
      }
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(ManimOutputPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions();
        ManimOutputPanel.revive(webviewPanel, context.extensionUri);
      }
    });
  }
}

export function deactivate() { }
