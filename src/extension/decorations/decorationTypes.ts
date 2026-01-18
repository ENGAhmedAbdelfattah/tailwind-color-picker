import * as vscode from "vscode";

export function createColorDecorationType(): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    before: {
      contentText: " ",
      width: "0.9em",
      height: "0.9em",
      margin: "0 0.4em 0 0",
      border: "1px solid #00000033",
    },
  });
}

