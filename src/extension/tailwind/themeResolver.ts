import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function resolveTheme(pathString: string): string | null {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) return null;

  const configPath = path.join(process.cwd(), "tailwind.config.js");
  if (!fs.existsSync(configPath)) return null;

  let config: any = {};
  try {
    config = require(configPath);
    config = config.default ?? config;
  } catch {
    return null;
  }

  const keys = pathString.replace(/["']/g, "").split(".");
  let value: any = config.theme;

  for (const key of keys) {
    if (!value) return null;
    value = value[key];
  }

  return typeof value === "string" ? value : null;
}

