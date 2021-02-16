import * as vscode from "vscode";

type GenType = "gif" | "video";
export default class ManimTerminal {
  terminal: vscode.Terminal;
  static current: ManimTerminal;
  constructor() {
    if (ManimTerminal.current) {
      throw new Error("Too many Terminals");
    }
    this.terminal = vscode.window.createTerminal("Manim Terminal");
    ManimTerminal.current = this;
  }
  generate(filename: string, sceneName: string, type: GenType) {
    this.terminal.sendText(`manim ${filename} ${sceneName} ${type === "gif" ? "-i" : ""}`);
  }
}