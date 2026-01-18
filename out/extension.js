"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/* ======================================================
   CONFIG
====================================================== */
const DEFAULT_UTILITIES = ["bg", "text", "border", "ring", "fill", "stroke"];
const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
const COLOR_REGEX = /\b((?:[a-z]+:)*)(bg|text|border|ring|fill|stroke)-(?:\[.*?\]|[a-z]+-\d{2,3})\b/;
/* ======================================================
   EXTENSION ENTRY
====================================================== */
function activate(context) {
    const decoration = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: " ",
            width: "0.9em",
            height: "0.9em",
            margin: "0 0.4em 0 0",
            border: "1px solid #00000033"
        }
    });
    context.subscriptions.push(decoration);
    /* ---------------- Hover Provider ---------------- */
    context.subscriptions.push(vscode.languages.registerHoverProvider(["html", "javascript", "typescript", "javascriptreact", "typescriptreact"], {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, COLOR_REGEX);
            if (!range)
                return;
            const text = document.getText(range);
            const match = text.match(COLOR_REGEX);
            if (!match)
                return;
            const [, variants, utility] = match;
            const md = new vscode.MarkdownString(`**Tailwind v4 Color**\n\n` +
                `\`${text}\`\n\n` +
                `[🎨 Pick Color](command:tailwindColorPicker.pick?${encodeURIComponent(JSON.stringify({ range, variants, utility }))})`);
            md.isTrusted = true;
            return new vscode.Hover(md);
        }
    }));
    /* ---------------- Decorations ---------------- */
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor)
            applyDecorations(editor, decoration);
    }));
    if (vscode.window.activeTextEditor) {
        applyDecorations(vscode.window.activeTextEditor, decoration);
    }
    /* ---------------- Command ---------------- */
    context.subscriptions.push(vscode.commands.registerCommand("tailwindColorPicker.pick", async (args) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const mode = await vscode.window.showQuickPick(["Tailwind Palette", "Arbitrary Color", "Hex → Nearest Palette"], { placeHolder: "Select color mode" });
        if (!mode)
            return;
        let colorValue = "";
        if (mode === "Tailwind Palette") {
            const palette = loadTailwindPalette();
            const color = await vscode.window.showQuickPick(Object.keys(palette));
            if (!color)
                return;
            const shade = await vscode.window.showQuickPick(SHADES);
            if (!shade)
                return;
            colorValue = `${color}-${shade}`;
        }
        if (mode === "Arbitrary Color") {
            const input = await vscode.window.showInputBox({
                prompt: "CSS Color",
                placeHolder: "#ff0000 | oklch(...) | var(--primary)"
            });
            if (!input)
                return;
            colorValue = `[${input}]`;
        }
        if (mode === "Hex → Nearest Palette") {
            const hex = await vscode.window.showInputBox({
                prompt: "Hex color",
                placeHolder: "#ff0000"
            });
            if (!hex)
                return;
            const palette = loadTailwindPalette();
            const nearest = findNearestTailwindColor(hex, palette);
            if (!nearest)
                return;
            colorValue = `${nearest.color}-${nearest.shade}`;
        }
        const finalClass = `${args.variants}${args.utility}-${colorValue}`;
        editor.edit(edit => {
            edit.replace(args.range, finalClass);
        });
    }));
}
function deactivate() { }
/* ======================================================
   INLINE COLOR PREVIEW
====================================================== */
function applyDecorations(editor, decoration) {
    const text = editor.document.getText();
    const matches = [];
    for (const match of text.matchAll(COLOR_REGEX)) {
        const start = editor.document.positionAt(match.index ?? 0);
        const end = editor.document.positionAt((match.index ?? 0) + match[0].length);
        const color = extractColor(match[0]);
        if (!color)
            continue;
        matches.push({
            range: new vscode.Range(start, end),
            renderOptions: {
                before: {
                    backgroundColor: color
                }
            }
        });
    }
    editor.setDecorations(decoration, matches);
}
function extractColor(className) {
    const hexMatch = className.match(/\[(#.*?)\]/);
    if (hexMatch)
        return hexMatch[1];
    return null;
}
/* ======================================================
   TAILWIND V4 PALETTE LOADING
====================================================== */
function loadTailwindPalette() {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace)
        return {};
    const cssPath = path.join(workspace.uri.fsPath, "node_modules", "tailwindcss", "dist", "colors.css");
    if (!fs.existsSync(cssPath))
        return {};
    const css = fs.readFileSync(cssPath, "utf8");
    const palette = {};
    const regex = /--color-([a-z]+)-(\d+):\s*(#[0-9a-fA-F]{6})/g;
    let match;
    while ((match = regex.exec(css))) {
        const [, color, shade, hex] = match;
        palette[color] ?? (palette[color] = {});
        palette[color][shade] = hex;
    }
    return palette;
}
/* ======================================================
   HEX → NEAREST PALETTE
====================================================== */
function findNearestTailwindColor(hex, palette) {
    const target = hexToRgb(hex);
    if (!target)
        return null;
    let best = null;
    let min = Infinity;
    for (const color in palette) {
        for (const shade in palette[color]) {
            const rgb = hexToRgb(palette[color][shade]);
            if (!rgb)
                continue;
            const d = distance(target, rgb);
            if (d < min) {
                min = d;
                best = { color, shade };
            }
        }
    }
    return best;
}
function hexToRgb(hex) {
    const m = hex.replace("#", "").match(/.{2}/g);
    if (!m)
        return null;
    const [r, g, b] = m.map(x => parseInt(x, 16));
    return { r, g, b };
}
function distance(a, b) {
    return Math.sqrt((a.r - b.r) ** 2 +
        (a.g - b.g) ** 2 +
        (a.b - b.b) ** 2);
}
