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
    const colors: vscode.ColorInformation[] = [];

    // 1. Handle COLOR_REGEX (single classes like text-red-500, bg-[#fff])
    for (const match of text.matchAll(COLOR_REGEX)) {
      const start = document.positionAt(match.index ?? 0);
      const end = document.positionAt((match.index ?? 0) + match[0].length);
      const range = new vscode.Range(start, end);

      const colorString = extractColor(match[0]);
      if (colorString) {
        const color = colorStringToVscodeColor(colorString);
        if (color) {
          colors.push(new vscode.ColorInformation(range, color));
        }
      }
    }

    // 2. Handle APPLY_REGEX
    for (const match of text.matchAll(APPLY_REGEX)) {
      const applyValue = match[1];
      // The match index points to "@apply ...". We want the color range.
      // But extractColorFromApply might return just the color string.
      // We need the range of the specific class in the apply rule if possible, 
      // but applyDecorations logic treats the whole apply match?
      // applyDecorations: 
      // const start = editor.document.positionAt(match.index ?? 0);
      // const end = ... match[0].length
      // It highlights the whole line "@apply text-red-500;".

      const start = document.positionAt(match.index ?? 0);
      const end = document.positionAt((match.index ?? 0) + match[0].length);
      const range = new vscode.Range(start, end);

      const extracted = extractColorFromApply(applyValue);
      if (extracted) {
        const color = colorStringToVscodeColor(extracted);
        if (color) {
          colors.push(new vscode.ColorInformation(range, color));
        }
      }
    }

    // 3. Handle Ring Colors
    const ringMatches = parseRingColors(text);
    for (const ring of ringMatches) {
      const start = document.positionAt(ring.index);
      const end = document.positionAt(ring.index + ring.length);
      const range = new vscode.Range(start, end);

      const color = colorStringToVscodeColor(ring.color);
      if (color) {
        colors.push(new vscode.ColorInformation(range, color));
      }
    }

    // 4. Handle className="..."
    for (const match of text.matchAll(CLASS_REGEX)) {
      const classList = match[1] || match[3];
      if (!classList) continue;

      const classNames = classList.split(/\s+/);
      const matchIndex = match.index ?? 0;
      // We need to find the offset of each class within the match
      // match[0] is `className="... ..."`
      // We need the start index of the value part.
      // match[1] is the value.
      // Offset of match[1] inside match[0].
      const valueStartIndex = match[0].indexOf(classList);

      let currentOffset = 0;

      // Re-scanning the classList string to find indices is safer
      let searchPos = 0;
      for (const c of classNames) {
        const indexInList = classList.indexOf(c, searchPos);
        if (indexInList === -1) continue;
        searchPos = indexInList + c.length;

        const colorString = extractColor(c);
        if (colorString) {
          const color = colorStringToVscodeColor(colorString);
          if (color) {
            const startPos = matchIndex + valueStartIndex + indexInList;
            const start = document.positionAt(startPos);
            const end = document.positionAt(startPos + c.length);
            colors.push(new vscode.ColorInformation(new vscode.Range(start, end), color));
          }
        }
      }
    }

    // 5. Handle CSS custom properties (--color-name: value;)
    const cssVarMatches = parseCSSVariables(text);
    for (const cssVar of cssVarMatches) {
      const start = document.positionAt(cssVar.index);
      const end = document.positionAt(cssVar.index + cssVar.length);
      const range = new vscode.Range(start, end);

      const color = colorStringToVscodeColor(cssVar.color);
      if (color) {
        colors.push(new vscode.ColorInformation(range, color));
      }
    }

    return colors;
  }

  public provideColorPresentations(
    color: vscode.Color,
    context: { document: vscode.TextDocument; range: vscode.Range },
    token: vscode.CancellationToken
  ): vscode.ColorPresentation[] {
    const hex = vscodeColorToHex(color);
    const presentations: vscode.ColorPresentation[] = [];

    // 1. Try to find nearest Tailwind class
    const nearest = findNearestTailwindColor(hex, this.palette);

    // Get the prefix from the original text (e.g., "text-", "bg-")
    const originalText = context.document.getText(context.range);
    const utilities = getTailwindUtilities()
      .map(escapeRegex)
      .join("|");

    const prefixMatch = originalText.match(new RegExp(`^([a-z]+:)*(${utilities})-`));
    const prefix = prefixMatch ? prefixMatch[0] : "";

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

    // 2. Arbitrary value (JIT)
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
