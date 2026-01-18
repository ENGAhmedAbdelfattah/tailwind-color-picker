import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface CSSThemeColors {
  [key: string]: string; // e.g., "primary": "120 80% 28%", "background": "0 0% 100%"
}

/**
 * Parses CSS files to extract color definitions from @theme inline blocks
 * and :root CSS variables
 */
export function parseCSSThemeColors(cssFilePath: string): CSSThemeColors {
  const colors: CSSThemeColors = {};

  if (!fs.existsSync(cssFilePath)) {
    return colors;
  }

  try {
    const content = fs.readFileSync(cssFilePath, "utf-8");

    // Parse @theme inline block
    const themeBlockRegex = /@theme\s+inline\s*\{([^}]+)\}/gs;
    const themeMatch = themeBlockRegex.exec(content);

    if (themeMatch) {
      const themeContent = themeMatch[1];
      // Match color definitions like: --color-primary: hsl(var(--primary));
      const colorVarRegex = /--color-([a-z0-9-]+):\s*hsl\(var\(--([a-z0-9-]+)\)\);/g;
      
      let match;
      while ((match = colorVarRegex.exec(themeContent)) !== null) {
        const colorName = match[1]; // e.g., "primary", "primary-500"
        const varName = match[2]; // e.g., "primary", "primary-500"
        
        // Now find the actual value in :root or .dark
        const rootValue = findCSSVariableValue(content, varName);
        if (rootValue) {
          colors[colorName] = rootValue;
        }
      }
    }

    // Also parse :root variables directly
    const rootRegex = /:root\s*\{([^}]+)\}/gs;
    const rootMatch = rootRegex.exec(content);

    if (rootMatch) {
      const rootContent = rootMatch[1];
      // Match color definitions like: --primary: 120 80% 28%;
      const varRegex = /--([a-z0-9-]+):\s*([0-9.]+\s+[0-9.]+%\s+[0-9.]+%);/g;
      
      let match;
      while ((match = varRegex.exec(rootContent)) !== null) {
        const varName = match[1];
        const value = match[2];
        
        // Only add if not already present (theme block takes precedence)
        if (!colors[varName]) {
          colors[varName] = value;
        }
      }
    }

  } catch (error) {
    console.error(`Error parsing CSS theme from ${cssFilePath}:`, error);
  }

  return colors;
}

/**
 * Finds the value of a CSS variable in :root or .dark blocks
 */
function findCSSVariableValue(content: string, varName: string): string | null {
  // Look in :root first
  const rootRegex = new RegExp(
    `:root\\s*\\{[^}]*--${escapeRegex(varName)}:\\s*([^;]+);`,
    "s"
  );
  const rootMatch = rootRegex.exec(content);
  
  if (rootMatch) {
    return rootMatch[1].trim();
  }

  // Could also check .dark if needed
  return null;
}

/**
 * Resolves a CSS variable reference to its color value
 * Supports both direct references and hsl() wrapped references
 */
export function resolveCSSVariable(
  varReference: string,
  themeColors: CSSThemeColors
): string | null {
  // Handle var(--color-name) or var(--name)
  const varMatch = varReference.match(/var\(--([a-z0-9-]+)\)/);
  if (!varMatch) {
    return null;
  }

  const varName = varMatch[1];
  
  // Try to find in theme colors (with or without "color-" prefix)
  let value = themeColors[varName];
  
  if (!value && varName.startsWith("color-")) {
    // Try without the "color-" prefix
    const nameWithoutPrefix = varName.substring(6);
    value = themeColors[nameWithoutPrefix];
  } else if (!value && !varName.startsWith("color-")) {
    // Try with the "color-" prefix
    value = themeColors[`color-${varName}`];
  }

  if (!value) {
    return null;
  }

  // Value is in format "120 80% 28%" (HSL without hsl() wrapper)
  // Convert to hsl(120, 80%, 28%)
  return `hsl(${value.replace(/\s+/g, ", ")})`;
}

/**
 * Finds CSS files in the workspace (typically looking for app.css, globals.css, etc.)
 */
export function findCSSThemeFiles(): string[] {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return [];
  }

  const possiblePaths = [
    "src/app.css",
    "src/index.css",
    "src/globals.css",
    "src/styles/globals.css",
    "app/globals.css",
    "styles/globals.css",
    "public/styles.css",
  ];

  const foundFiles: string[] = [];

  for (const relativePath of possiblePaths) {
    const fullPath = path.join(workspace.uri.fsPath, relativePath);
    if (fs.existsSync(fullPath)) {
      foundFiles.push(fullPath);
    }
  }

  return foundFiles;
}

/**
 * Loads all CSS theme colors from workspace CSS files
 */
export function loadCSSThemeColors(): CSSThemeColors {
  const cssFiles = findCSSThemeFiles();
  const allColors: CSSThemeColors = {};

  for (const file of cssFiles) {
    const colors = parseCSSThemeColors(file);
    Object.assign(allColors, colors);
  }

  return allColors;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
