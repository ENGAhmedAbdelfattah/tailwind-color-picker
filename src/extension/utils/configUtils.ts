import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface ProjectConfig {
  cssFilePath?: string;
  utilities?: string[];
}

/**
 * Gets configuration value, prioritizing project-level config file over VS Code settings
 */
export function getExtensionConfig<T>(key: keyof ProjectConfig, defaultValue: T): T {
  const workspace = vscode.workspace.workspaceFolders?.[0];

  if (workspace) {
    const configPath = path.join(workspace.uri.fsPath, "tailwind-color-picker.json");

    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, "utf-8");
        const json = JSON.parse(content) as ProjectConfig;

        if (json[key] !== undefined) {
          return json[key] as unknown as T;
        }
      } catch (error) {
        console.error("Error reading tailwind-color-picker.json:", error);
      }
    }
  }

  // Fallback to VS Code settings
  const config = vscode.workspace.getConfiguration("tailwindColorPicker");
  return config.get<T>(key, defaultValue);
}
