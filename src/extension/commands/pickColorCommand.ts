import * as vscode from "vscode";
import { PickArgs } from "../types/commands";
import { loadTailwindPalette } from "../tailwind/palette";
import { findNearestTailwindColor } from "../tailwind/nearestColor";

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
  const disposable = vscode.commands.registerCommand(
    "tailwindColorPicker.pick",
    async (args: PickArgs) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const mode = await vscode.window.showQuickPick(
        ["Tailwind Palette", "Arbitrary Color", "Hex → Nearest Palette"],
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

      const finalClass = `${args.variants}${args.utility}-${colorValue}`;

      editor.edit((edit) => {
        edit.replace(args.range, finalClass);
      });
    }
  );

  context.subscriptions.push(disposable);
}

