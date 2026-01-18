import * as vscode from "vscode";
import { registerPickColorCommand } from "../commands/pickColorCommand";
import { registerTailwindHoverProvider } from "../hover/tailwindHoverProvider";
import { TailwindDocumentColorProvider } from "../providers/tailwindDocumentColorProvider";

export function activateExtension(
  context: vscode.ExtensionContext
): void {
  // Register Document Color Provider
  const provider = new TailwindDocumentColorProvider();
  const selector = [
    "html",
    "css",
    "scss",
    "less",
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact",
    "vue",
    "svelte",
  ];
  context.subscriptions.push(
    vscode.languages.registerColorProvider(selector, provider)
  );

  console.log("Tailwind Color Picker: Registering hover provider...");
  registerTailwindHoverProvider(context);
  
  console.log("Tailwind Color Picker: Registering pick color command...");
  registerPickColorCommand(context);
  console.log("Tailwind Color Picker: Pick color command registered.");
}

