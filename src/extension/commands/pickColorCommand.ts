import * as vscode from "vscode";
import { PickArgs } from "../types/commands";
import { loadTailwindPalette } from "../tailwind/palette";
import { findNearestTailwindColor } from "../tailwind/nearestColor";
import { loadCSSThemeColors } from "../tailwind/cssThemeParser";

const SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

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
          const color = await vscode.window.showQuickPick(Object.keys(palette));
          if (!color) {
            return;
          }

          const shade = await vscode.window.showQuickPick(SHADES);
          if (!shade) {
            return;
          }

          colorValue = `${color}-${shade}`;
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

        // Replace your finalClass logic with this:
        const variants = args?.variants || "";
        const utility = args?.utility || "bg"; // Default to background if utility is missing
        const range = args?.range || editor.selection; // Use current selection if no range provided

        const finalClass = `${variants}${utility}-${colorValue}`;

        editor.edit((edit) => {
          edit.replace(range, finalClass);
        });
      }
    )
  );
}
