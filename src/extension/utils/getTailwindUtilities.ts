import * as vscode from "vscode";

import { getExtensionConfig } from "./configUtils";

export function getTailwindUtilities(): string[] {
  return getExtensionConfig<string[]>("utilities", [
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
