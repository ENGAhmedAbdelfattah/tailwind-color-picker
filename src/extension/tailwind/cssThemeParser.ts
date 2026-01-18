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

    // 1. Parse @theme blocks (v4 syntax)
    const themeBlockRegex = /@theme\s*(?:inline)?\s*\{([^}]+)\}/gs;
    let themeMatch;
    while ((themeMatch = themeBlockRegex.exec(content)) !== null) {
      const themeContent = themeMatch[1];
      // Match color definitions like: --color-primary: hsl(var(--primary));
      // or --color-primary: #fff;
      const colorVarRegex = /--color-([a-z0-9-]+):\s*([^;]+);/g;

      let match;
      while ((match = colorVarRegex.exec(themeContent)) !== null) {
        const colorName = match[1]; // e.g., "primary", "primary-500"
        let value = match[2].trim(); // e.g., "hsl(var(--primary))", "#fff"

        // If it's a var reference, try to resolve it
        if (value.includes("var(--")) {
          const varMatch = value.match(/var\(--([a-z0-9-]+)\)/);
          if (varMatch) {
            const varName = varMatch[1];
            const resolvedValue = findCSSVariableValue(content, varName);
            if (resolvedValue) {
              // If the original value was hsl(var(--...)), preserve the hsl() wrapper 
              // but replace the inner var with the resolved value.
              // If the resolved value already looks like a full color, use it.
              if (value.startsWith("hsl(")) {
                value = `hsl(${resolvedValue})`;
              } else if (value.startsWith("rgb(")) {
                value = `rgb(${resolvedValue})`;
              } else {
                value = resolvedValue;
              }
            }
          }
        }

        colors[colorName] = value;
      }
    }

    // 2. Also parse :root variables directly if they look like colors or color components
    const rootRegex = /:root\s*\{([^}]+)\}/gs;
    const rootMatch = rootRegex.exec(content);

    if (rootMatch) {
      const rootContent = rootMatch[1];
      // Match color definitions like: --primary: 120 80% 28%;
      const varRegex = /--([a-z0-9-]+):\s*([^;]+);/g;

      let match;
      while ((match = varRegex.exec(rootContent)) !== null) {
        const varName = match[1];
        const value = match[2].trim();

        // Only add if not already present (theme block takes precedence)
        // And if it looks like a color value (starts with #, hsl, rgb, or is space-separated components)
        if (!colors[varName] && (
          value.startsWith("#") ||
          value.startsWith("hsl") ||
          value.startsWith("rgb") ||
          /^[0-9.]+\s+[0-9.]+%\s+[0-9.]+%?/.test(value)
        )) {
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
    `(?::root|\\.dark)\\s*\\{[^}]*--${escapeRegex(varName)}:\\s*([^;]+);`,
    "s"
  );
  const rootMatch = rootRegex.exec(content);

  if (rootMatch) {
    return rootMatch[1].trim();
  }

  return null;
}

/**
 * Resolves a CSS variable reference to its color value
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
    const nameWithoutPrefix = varName.substring(6);
    value = themeColors[nameWithoutPrefix];
  } else if (!value && !varName.startsWith("color-")) {
    value = themeColors[`color-${varName}`];
  }

  if (!value) {
    return null;
  }

  // If value is space-separated components (like "120 80% 28%"), wrap it in hsl()
  if (/^[0-9.]+\s+[0-9.]+%\s+[0-9.]+/.test(value)) {
    return `hsl(${value})`;
  }

  return value;
}

/**
 * Finds CSS files in the workspace
 */
export function findCSSThemeFiles(): string[] {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return [];
  }

  const config = vscode.workspace.getConfiguration("tailwindColorPicker");
  const customPath = config.get<string>("cssFilePath");
  const foundFiles: string[] = [];

  // 1. Add custom path if set
  if (customPath) {
    const fullCustomPath = path.isAbsolute(customPath)
      ? customPath
      : path.join(workspace.uri.fsPath, customPath);

    if (fs.existsSync(fullCustomPath)) {
      foundFiles.push(fullCustomPath);
    }
  }

  // 2. Add default possible paths
  const possiblePaths = [
    "src/tailwind.css",
    "tailwind.css",
    "src/app.css",
    "src/index.css",
    "src/globals.css",
    "src/styles/globals.css",
    "app/globals.css",
    "styles/globals.css",
    "public/styles.css",
  ];

  for (const relativePath of possiblePaths) {
    const fullPath = path.join(workspace.uri.fsPath, relativePath);
    if (fs.existsSync(fullPath) && !foundFiles.includes(fullPath)) {
      foundFiles.push(fullPath);
    }
  }

  return foundFiles;
}

/**
 * Cache for CSS theme colors to avoid frequent re-parsing
 */
let cssThemeCache: CSSThemeColors | null = null;
let cssWatcher: vscode.FileSystemWatcher | null = null;

/**
 * Loads all CSS theme colors from workspace CSS files
 */
export function loadCSSThemeColors(): CSSThemeColors {
  if (cssThemeCache) {
    return cssThemeCache;
  }

  // Set up watcher on first load
  if (!cssWatcher) {
    cssWatcher = vscode.workspace.createFileSystemWatcher("**/*.css");
    cssWatcher.onDidChange(() => { cssThemeCache = null; });
    cssWatcher.onDidCreate(() => { cssThemeCache = null; });
    cssWatcher.onDidDelete(() => { cssThemeCache = null; });
  }

  const cssFiles = findCSSThemeFiles();
  const allColors: CSSThemeColors = {};

  for (const file of cssFiles) {
    const colors = parseCSSThemeColors(file);
    Object.assign(allColors, colors);
  }

  cssThemeCache = allColors;
  return allColors;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
