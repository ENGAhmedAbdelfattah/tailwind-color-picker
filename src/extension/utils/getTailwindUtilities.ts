import * as vscode from "vscode";

export function getTailwindUtilities(): string[] {
  const config = vscode.workspace.getConfiguration("tailwindColorPicker");

  return config.get<string[]>("utilities", [
    "bg",
    "text",
    "decoration",
    "border",
    "outline",
    "shadow",
    "inset-shadow",
    "ring",
    "inset-ring",
    "accent",
    "caret",
    "fill",
    "stroke",
  ]);
}


export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
