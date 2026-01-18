import * as vscode from "vscode";
import { activateExtension } from "./extension/activation/activateExtension";

export { extractColor } from "./extension/parsing/classParser";
export { extractColorFromApply } from "./extension/parsing/applyParser";
export { resolveTheme } from "./extension/tailwind/themeResolver";
export { loadTailwindPalette } from "./extension/tailwind/palette";
export { findNearestTailwindColor } from "./extension/tailwind/nearestColor";
export { applyDecorations } from "./extension/decorations/applyDecorations";
export {
  COLOR_REGEX,
  APPLY_REGEX,
  CLASS_REGEX,
  TW_RING_REGEX,
} from "./extension/regex/tailwindRegex";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Tailwind Color Picker: Activating...");
  try {
    activateExtension(context);
    console.log("Tailwind Color Picker: Activated successfully.");
  } catch (error) {
    console.error("Tailwind Color Picker: Activation failed:", error);
  }
}

export function deactivate(): void {}

