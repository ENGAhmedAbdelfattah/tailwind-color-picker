import * as vscode from "vscode";
import { COLOR_REGEX } from "../regex/tailwindRegex";
import { PickArgs } from "../types/commands";

export const SUPPORTED_LANGUAGES = [
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

export function createTailwindHoverProvider(): vscode.HoverProvider {
  return {
    provideHover(document, position) {
      // Create a local non-global regex for word range detection
      const localRegex = new RegExp(COLOR_REGEX.source, "");
      const range = document.getWordRangeAtPosition(position, localRegex);
      if (!range) {
        return;
      }

      const text = document.getText(range);
      const match = localRegex.exec(text);
      if (!match) {
        return;
      }

      // Group 1: full match
      // Group 2: variants prefix (e.g., "hover:")
      // Group 3: utility (e.g., "bg")
      const variants = match[2] || "";
      const utility = match[3] || "bg";

      const args: PickArgs = { range, variants, utility };

      const md = new vscode.MarkdownString(
        `**Tailwind Color**\n\n` +
        `\`${text}\`\n\n` +
        `[🎨 Pick Color](command:tailwindColorPicker.pick?${encodeURIComponent(
          JSON.stringify([args])
        )})`
      );
      md.isTrusted = true;

      return new vscode.Hover(md);
    },
  };
}

export function registerTailwindHoverProvider(
  context: vscode.ExtensionContext
): void {
  const provider = createTailwindHoverProvider();
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(SUPPORTED_LANGUAGES, provider)
  );
}

