import * as vscode from "vscode";
import { PickArgs } from "../types/commands";
import { loadTailwindPalette } from "../tailwind/palette";
import { findNearestTailwindColor } from "../tailwind/nearestColor";
import { loadCSSThemeColors } from "../tailwind/cssThemeParser";


export function registerPickColorCommand(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tailwindColorPicker.pick",
      async (args: PickArgs) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const mode = await vscode.window.showQuickPick(
          [
            "Tailwind Palette",
            "Theme Colors (v4)",
            "Arbitrary Color",
            "Hex → Nearest Palette",
          ],
          { placeHolder: "Select color mode" }
        );
        if (!mode) {
          return;
        }

        let colorValue = "";

        if (mode === "Tailwind Palette") {
          const palette = loadTailwindPalette();
          const color = await vscode.window.showQuickPick(Object.keys(palette), {
            placeHolder: "Select a color family"
          });
          if (!color) {
            return;
          }

          const availableShades = Object.keys(palette[color]);
          let shade: string | undefined;

          if (availableShades.length === 1 && availableShades[0] === "DEFAULT") {
            shade = "DEFAULT";
          } else {
            shade = await vscode.window.showQuickPick(availableShades, {
              placeHolder: `Select shade for ${color}`
            });
            if (!shade) {
              return;
            }
          }

          colorValue = shade === "DEFAULT" ? color : `${color}-${shade}`;
        } else if (mode === "Theme Colors (v4)") {
          const themeColors = loadCSSThemeColors();
          const colorNames = Object.keys(themeColors);

          if (colorNames.length === 0) {
            vscode.window.showWarningMessage(
              "No theme colors found. Check your CSS theme file path in settings."
            );
            return;
          }

          const color = await vscode.window.showQuickPick(colorNames, {
            placeHolder: "Select a theme color",
          });
          if (!color) {
            return;
          }

          colorValue = color;
        } else if (mode === "Arbitrary Color") {
          const input = await vscode.window.showInputBox({
            prompt: "CSS Color",
            placeHolder: "#ff0000 | oklch(...) | var(--primary)",
          });
          if (!input) {
            return;
          }
          colorValue = `[${input}]`;
        } else if (mode === "Hex → Nearest Palette") {
          const hex = await vscode.window.showInputBox({
            prompt: "Hex color",
            placeHolder: "#ff0000",
          });
          if (!hex) {
            return;
          }

          const palette = loadTailwindPalette();
          const nearest = findNearestTailwindColor(hex, palette);
          if (!nearest) {
            return;
          }

          colorValue = `${nearest.color}-${nearest.shade}`;
        }

        let range: vscode.Range;
        let variants = args?.variants || "";
        let utility = args?.utility || "bg";

        if (args?.range && !(args.range instanceof vscode.Range)) {
          // Reconstruct Range from plain object
          const rawRange = args.range as any;
          range = new vscode.Range(
            rawRange.start.line,
            rawRange.start.character,
            rawRange.end.line,
            rawRange.end.character
          );
        } else if (args?.range) {
          range = args.range;
        } else {
          // Fallback: try to find the color range at current position
          const { COLOR_REGEX } = require("../regex/tailwindRegex");
          const colorRange = editor.document.getWordRangeAtPosition(
            editor.selection.active,
            COLOR_REGEX
          );
          range = colorRange || editor.selection;

          if (colorRange) {
            const text = editor.document.getText(colorRange);
            const match = new RegExp(COLOR_REGEX.source, "").exec(text);
            if (match) {
              // Groups: 1:full, 2:variants, 3:utility
              variants = match[2] || "";
              utility = match[3] || "bg";
            }
          }
        }

        const finalClass = `${variants}${utility}-${colorValue}`;

        await editor.edit((edit) => {
          edit.replace(range, finalClass);
        });
      }
    )
  );
}
