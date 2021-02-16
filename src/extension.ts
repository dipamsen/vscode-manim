import * as vscode from 'vscode';
import ManimOutputPanel from "./ManimOutputPanel";
import ManimTerminal from './ManimTerminal';
import RunButtonProvider from "./RunButtonProvider";

export function activate(context: vscode.ExtensionContext) {

  const codelensProvider = new RunButtonProvider();

  const cmd = new ManimTerminal();

  context.subscriptions.push(cmd.terminal);

  vscode.languages.registerCodeLensProvider({ language: "python" }, codelensProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('manim.helloWorld', () => {
      vscode.window.showInformationMessage('Hello World from Manim Preview and Snippets!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('manim.start', () => {
      vscode.window.showInformationMessage("Tried to Start Manim");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('manim.codelensAction', (args) => {
      const fileName = vscode.window.activeTextEditor!.document.fileName;
      cmd.generate(fileName, args, "gif");
      const gif = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, 'media', 'videos', fileName.split("/").pop()!.split(".").slice(0, -1).join("."), "1080p60", args + ".gif");
      const watch = vscode.workspace.createFileSystemWatcher(gif.toString());
      watch.onDidChange(e => {
        ManimOutputPanel.currentPanel?.update();
      });
      vscode.window.showInformationMessage("Running Scene - " + args);
      ManimOutputPanel.createOrShow(context.extensionUri, args);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('manim.doRefactor', () => {
      if (ManimOutputPanel.currentPanel) {
        ManimOutputPanel.currentPanel.doRefactor();
      }
    })
  );
}

export function deactivate() { }
