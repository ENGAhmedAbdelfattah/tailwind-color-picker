import * as vscode from "vscode";
import { createColorDecorationType } from "../decorations/decorationTypes";
import { applyDecorations } from "../decorations/applyDecorations";
import { registerPickColorCommand } from "../commands/pickColorCommand";
import { registerTailwindHoverProvider } from "../hover/tailwindHoverProvider";

export function activateExtension(
  context: vscode.ExtensionContext
): void {
  const decoration = createColorDecorationType();
  context.subscriptions.push(decoration);

  registerTailwindHoverProvider(context);
  registerPickColorCommand(context);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        applyDecorations(editor, decoration);
      }
    })
  );

  if (vscode.window.activeTextEditor) {
    applyDecorations(vscode.window.activeTextEditor, decoration);
  }
}

