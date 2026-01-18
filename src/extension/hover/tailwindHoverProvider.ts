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
      const range = document.getWordRangeAtPosition(position, COLOR_REGEX);
      if (!range) {
        return;
      }

      const text = document.getText(range);
      // Use a non-global regex to get capture groups
      const match = new RegExp(COLOR_REGEX.source, "").exec(text);
      if (!match) {
        return;
      }

      const [, , variants, utility] = match;

      const args: PickArgs = { range, variants: variants || "", utility: utility || "bg" };

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

