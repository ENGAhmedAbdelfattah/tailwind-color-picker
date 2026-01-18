import * as vscode from "vscode";
import {
  COLOR_REGEX,
  APPLY_REGEX,
  CLASS_REGEX,
} from "../regex/tailwindRegex";
import { extractColor } from "../parsing/classParser";
import { extractColorFromApply } from "../parsing/applyParser";
import { parseRingColors } from "../parsing/ringParser";
import { parseCSSVariables } from "../parsing/cssVarParser";
import { colorStringToVscodeColor, vscodeColorToHex } from "../utils/colorUtils";
import { findNearestTailwindColor } from "../tailwind/nearestColor";
import { loadTailwindPalette } from "../tailwind/palette";
import { escapeRegex, getTailwindUtilities } from "../utils/getTailwindUtilities";

export class TailwindDocumentColorProvider implements vscode.DocumentColorProvider {
  private palette = loadTailwindPalette();

  public provideDocumentColors(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ColorInformation[] {
    const text = document.getText();
    const colorMap = new Map<string, vscode.ColorInformation>();

    const addColor = (range: vscode.Range, colorString: string | null) => {
      if (!colorString) return;
      const color = colorStringToVscodeColor(colorString);
      if (color) {
        const key = `${range.start.line}:${range.start.character}:${range.end.line}:${range.end.character}`;
        colorMap.set(key, new vscode.ColorInformation(range, color));
      }
    };

    // 1. Handle COLOR_REGEX (standard utility classes)
    for (const match of text.matchAll(COLOR_REGEX)) {
      const start = document.positionAt(match.index ?? 0);
      const end = document.positionAt((match.index ?? 0) + match[0].length);
      addColor(new vscode.Range(start, end), extractColor(match[0]));
    }

    // 2. Handle APPLY_REGEX
    for (const match of text.matchAll(APPLY_REGEX)) {
      const start = document.positionAt(match.index ?? 0);
      const end = document.positionAt((match.index ?? 0) + match[0].length);
      addColor(new vscode.Range(start, end), extractColorFromApply(match[1]));
    }

    // 3. Handle Ring Colors
    for (const ring of parseRingColors(text)) {
      const start = document.positionAt(ring.index);
      const end = document.positionAt(ring.index + ring.length);
      addColor(new vscode.Range(start, end), ring.color);
    }

    // 4. Handle CSS custom properties
    for (const cssVar of parseCSSVariables(text)) {
      const start = document.positionAt(cssVar.index);
      const end = document.positionAt(cssVar.index + cssVar.length);
      addColor(new vscode.Range(start, end), cssVar.color);
    }

    const result = Array.from(colorMap.values());
    // Final deduplication for nested ranges (e.g., if bg-white and white were both matched somehow)
    return result.filter((c1, i) => {
      return !result.some((c2, j) => {
        if (i === j) return false;
        // If c1's range is entirely inside c2's range, and they aren't identical, remove c1
        return c2.range.contains(c1.range) && !c1.range.isEqual(c2.range);
      });
    });
  }

  public provideColorPresentations(
    color: vscode.Color,
    context: { document: vscode.TextDocument; range: vscode.Range },
    token: vscode.CancellationToken
  ): vscode.ColorPresentation[] {
    const hex = vscodeColorToHex(color);
    const presentations: vscode.ColorPresentation[] = [];

    // Get the prefix from the original text (e.g., "text-", "bg-")
    const originalText = context.document.getText(context.range);
    const utilities = getTailwindUtilities()
      .map(escapeRegex)
      .join("|");

    const prefixMatch = originalText.match(new RegExp(`^([a-z]+:)*(${utilities})-`));
    const prefix = prefixMatch ? prefixMatch[0] : "";

    // 1. Try to find nearest Tailwind class
    const nearest = findNearestTailwindColor(hex, this.palette);

    if (nearest) {
      if (prefix) {
        const shadePart = nearest.shade === "DEFAULT" ? "" : `-${nearest.shade}`;
        let className = `${prefix}${nearest.color}${shadePart}`;

        // Add opacity if alpha is less than 1
        if (color.alpha < 1) {
          const opacity = Math.round(color.alpha * 100);
          className += `/${opacity}`;
        }

        const p = new vscode.ColorPresentation(className);
        p.label = className;
        presentations.push(p);
      }
    }

    // 2. Add all Theme Colors (v4) as selectable options
    if (prefix) {
      const { loadCSSThemeColors } = require("../tailwind/cssThemeParser");
      const themeColors = loadCSSThemeColors();

      const themePresentations: { presentation: vscode.ColorPresentation, distance: number }[] = [];

      for (const [name, value] of Object.entries(themeColors)) {
        const themeColorVscode = colorStringToVscodeColor(value as string);
        if (themeColorVscode) {
          // Calculate distance to current color to sort them
          const dr = color.red - themeColorVscode.red;
          const dg = color.green - themeColorVscode.green;
          const db = color.blue - themeColorVscode.blue;
          const distance = dr * dr + dg * dg + db * db;

          const className = `${prefix}${name}`;
          const p = new vscode.ColorPresentation(className);
          // Add a small hint that this is a theme color
          p.label = `✨ ${className}`;
          themePresentations.push({ presentation: p, distance });
        }
      }

      // Sort by distance (closest first) and add to presentations
      themePresentations.sort((a, b) => a.distance - b.distance);
      presentations.push(...themePresentations.map(tp => tp.presentation));
    }

    // 3. Arbitrary value (JIT)
    // e.g. text-[#123456]
    if (prefix) {
      let arbitrary = `${prefix}[${hex}]`;
      if (color.alpha < 1) {
        const opacity = Math.round(color.alpha * 100);
        arbitrary += `/${opacity}`;
      }
      const p = new vscode.ColorPresentation(arbitrary);
      p.label = arbitrary;
      presentations.push(p);
    } else {
      // Fallback if no prefix found
      let result = hex;
      if (color.alpha < 1) {
        const alphaHex = Math.round(color.alpha * 255).toString(16).padStart(2, '0');
        result += alphaHex;
      }
      const p = new vscode.ColorPresentation(result);
      p.label = result;
      presentations.push(p);
    }

    return presentations;
  }
}
