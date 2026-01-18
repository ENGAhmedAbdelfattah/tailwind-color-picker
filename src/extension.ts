import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import colors from "tailwindcss/colors";

/* =========================
   CONSTANTS
========================= */

const DEFAULT_UTILITIES = ["bg", "text", "border", "ring", "fill", "stroke"];
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

// Tailwind v3 + arbitrary value regex
const COLOR_REGEX =
  /\b((?:[a-z]+:)*)(bg|text|border|ring|fill|stroke)-(?:\[([^\]]+)\]|([a-z]+-\d{2,3}))\b/;

// @apply support (including arbitrary values + theme())
const APPLY_REGEX = /@apply\s+([^;]+);/g;
const THEME_REGEX = /theme\(([^)]+)\)/g;

// --tw-ring-color / --tw-ring-offset-color
const TW_RING_REGEX = /--tw-(ring-color|ring-offset-color):\s*([^;]+);/g;

// class="" className="" class:binding=""
const CLASS_REGEX =
  /\b(?:class|className)\s*=\s*["']([^"']+)["']|class:([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/g;

type PickArgs = {
  range: vscode.Range;
  variants: string;
  utility: string;
};

type RGB = { r: number; g: number; b: number };

/* =========================
   EXTENSION
========================= */

export function activate(context: vscode.ExtensionContext): void {
  const decoration = vscode.window.createTextEditorDecorationType({
    before: {
      contentText: " ",
      width: "0.9em",
      height: "0.9em",
      margin: "0 0.4em 0 0",
      border: "1px solid #00000033",
    },
  });

  context.subscriptions.push(decoration);

  // Hover provider with picker UI
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      [
        "html",
        "css",
        "scss",
        "less",
        "javascript",
        "typescript",
        "javascriptreact",
        "typescriptreact",
        "vue",
        "svelte",
      ],
      {
        provideHover(document, position) {
          const range = document.getWordRangeAtPosition(position, COLOR_REGEX);
          if (!range) return;

          const text = document.getText(range);
          const match = text.match(COLOR_REGEX);
          if (!match) return;

          const [, variants, utility] = match;

          const md = new vscode.MarkdownString(
            `**Tailwind Color**\n\n` +
              `\`${text}\`\n\n` +
              `[🎨 Pick Color](command:tailwindColorPicker.pick?${encodeURIComponent(
                JSON.stringify({ range, variants, utility })
              )})`
          );
          md.isTrusted = true;

          return new vscode.Hover(md);
        },
      }
    )
  );

  // Decorations
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) applyDecorations(editor, decoration);
    })
  );

  if (vscode.window.activeTextEditor) {
    applyDecorations(vscode.window.activeTextEditor, decoration);
  }

  // Command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tailwindColorPicker.pick",
      async (args: PickArgs) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const mode = await vscode.window.showQuickPick(
          ["Tailwind Palette", "Arbitrary Color", "Hex → Nearest Palette"],
          { placeHolder: "Select color mode" }
        );
        if (!mode) return;

        let colorValue = "";

        if (mode === "Tailwind Palette") {
          const palette = loadTailwindPalette();
          const color = await vscode.window.showQuickPick(Object.keys(palette));
          if (!color) return;

          const shade = await vscode.window.showQuickPick(SHADES);
          if (!shade) return;

          colorValue = `${color}-${shade}`;
        }

        if (mode === "Arbitrary Color") {
          const input = await vscode.window.showInputBox({
            prompt: "CSS Color",
            placeHolder: "#ff0000 | oklch(...) | var(--primary)",
          });
          if (!input) return;
          colorValue = `[${input}]`;
        }

        if (mode === "Hex → Nearest Palette") {
          const hex = await vscode.window.showInputBox({
            prompt: "Hex color",
            placeHolder: "#ff0000",
          });
          if (!hex) return;

          const palette = loadTailwindPalette();
          const nearest = findNearestTailwindColor(hex, palette);
          if (!nearest) return;

          colorValue = `${nearest.color}-${nearest.shade}`;
        }

        const finalClass = `${args.variants}${args.utility}-${colorValue}`;

        editor.edit((edit) => {
          edit.replace(args.range, finalClass);
        });
      }
    )
  );
}

export function deactivate(): void {}

/* =========================
   INLINE PREVIEW
========================= */

function applyDecorations(
  editor: vscode.TextEditor,
  decoration: vscode.TextEditorDecorationType
): void {
  const text = editor.document.getText();
  const matches: vscode.DecorationOptions[] = [];

  // 1) Tailwind classes
  for (const match of text.matchAll(COLOR_REGEX)) {
    const start = editor.document.positionAt(match.index ?? 0);
    const end = editor.document.positionAt(
      (match.index ?? 0) + match[0].length
    );

    const color = extractColor(match[0]);
    if (!color) continue;

    matches.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        before: { backgroundColor: color },
      },
    });
  }

  // 2) @apply
  for (const match of text.matchAll(APPLY_REGEX)) {
    const applyValue = match[1];
    const start = editor.document.positionAt(match.index ?? 0);
    const end = editor.document.positionAt(
      (match.index ?? 0) + match[0].length
    );

    const extracted = extractColorFromApply(applyValue);
    if (!extracted) continue;

    matches.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        before: { backgroundColor: extracted },
      },
    });
  }

  // 3) --tw-ring-color
  for (const match of text.matchAll(TW_RING_REGEX)) {
    const value = match[2];
    const start = editor.document.positionAt(match.index ?? 0);
    const end = editor.document.positionAt(
      (match.index ?? 0) + match[0].length
    );

    const color = value.trim().replace(/;$/, "");
    matches.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        before: { backgroundColor: color },
      },
    });
  }

  // 4) class attributes
  for (const match of text.matchAll(CLASS_REGEX)) {
    const classList = match[1] || match[3];
    if (!classList) continue;

    const classNames = classList.split(/\s+/);
    for (const c of classNames) {
      const color = extractColor(c);
      if (!color) continue;

      const idx = match.index ?? 0;
      const start = editor.document.positionAt(idx + match[0].indexOf(c));
      const end = editor.document.positionAt(
        idx + match[0].indexOf(c) + c.length
      );

      matches.push({
        range: new vscode.Range(start, end),
        renderOptions: {
          before: { backgroundColor: color },
        },
      });
    }
  }

  editor.setDecorations(decoration, matches);
}

/* =========================
   COLOR EXTRACTION
========================= */

function extractColor(className: string): string | null {
  const hexMatch = className.match(/\[(#.*?)\]/);
  if (hexMatch) return hexMatch[1];

  const rgbMatch = className.match(/\[(rgb[a]?\([^\]]+\))\]/);
  if (rgbMatch) return rgbMatch[1];

  const hslMatch = className.match(/\[(hsl[a]?\([^\]]+\))\]/);
  if (hslMatch) return hslMatch[1];

  const varMatch = className.match(/\[(var\([^\]]+\))\]/);
  if (varMatch) return varMatch[1];

  // theme() support
  const themeMatch = className.match(/theme\(([^)]+)\)/);
  if (themeMatch) {
    const value = resolveTheme(themeMatch[1]);
    if (value) return value;
  }

  return null;
}

function extractColorFromApply(value: string): string | null {
  const classes = value.split(/\s+/);

  for (const c of classes) {
    const color = extractColor(c);
    if (color) return color;
  }

  return null;
}


/* =========================
   THEME RESOLUTION
========================= */

function resolveTheme(pathString: string): string | null {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) return null;

  const configPath = path.join(process.cwd(), "tailwind.config.js");
  if (!fs.existsSync(configPath)) return null;

  // load config safely
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

/* =========================
   PALETTE LOADING
========================= */
function loadTailwindPalette(): Record<string, Record<string, string>> {
  const palette: Record<string, Record<string, string>> = {};

  // tailwindcss/colors exports some non-color entries (like 'transparent', 'current')
  // We only keep objects that contain shades.
  for (const [name, value] of Object.entries(colors)) {
    if (typeof value === "object" && value !== null) {
      // Make sure we keep only numeric shades
      const shades = Object.entries(value).filter(([k]) => /^\d+$/.test(k));
      if (shades.length > 0) {
        palette[name] = Object.fromEntries(shades) as Record<string, string>;
      }
    }
  }

  return palette;
}

// function loadTailwindPalette(): Record<string, Record<string, string>> {
//   const workspacePath =
//     vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();

//   const cssPath = path.join(
//     workspacePath,
//     "node_modules",
//     "tailwindcss",
//     "dist",
//     "colors.css"
//   );

//   if (!fs.existsSync(cssPath)) return {};

//   const css = fs.readFileSync(cssPath, "utf8");
//   const palette: Record<string, Record<string, string>> = {};

//   const regex = /--color-([a-z]+)-(\d+):\s*(#[0-9a-fA-F]{6})/g;
//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(css))) {
//     const [, color, shade, hex] = match;
//     palette[color] ??= {};
//     palette[color][shade] = hex;
//   }

//   return palette;
// }

/* =========================
   NEAREST PALETTE
========================= */

function findNearestTailwindColor(
  hex: string,
  palette: Record<string, Record<string, string>>
) {
  const target = hexToRgb(hex);
  if (!target) return null;

  let best: any = null;
  let min = Infinity;

  for (const color in palette) {
    for (const shade in palette[color]) {
      const rgb = hexToRgb(palette[color][shade]);
      if (!rgb) continue;

      const d = distance(target, rgb);
      if (d < min) {
        min = d;
        best = { color, shade };
      }
    }
  }

  return best;
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return null;
  const [r, g, b] = m.map((x) => parseInt(x, 16));
  return { r, g, b };
}

function distance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export {
  extractColor,
  extractColorFromApply,
  resolveTheme,
  loadTailwindPalette,
  findNearestTailwindColor,
  applyDecorations,
  COLOR_REGEX,
  APPLY_REGEX,
  CLASS_REGEX,
  TW_RING_REGEX
};