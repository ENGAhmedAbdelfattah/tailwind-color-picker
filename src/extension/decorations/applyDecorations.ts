import * as vscode from "vscode";
import {
  COLOR_REGEX,
  APPLY_REGEX,
  CLASS_REGEX,
} from "../regex/tailwindRegex";
import { extractColor } from "../parsing/classParser";
import { extractColorFromApply } from "../parsing/applyParser";
import { parseRingColors } from "../parsing/ringParser";

export function applyDecorations(
  editor: vscode.TextEditor,
  decoration: vscode.TextEditorDecorationType
): void {
  const text = editor.document.getText();
  const matches: vscode.DecorationOptions[] = [];

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

  const ringMatches = parseRingColors(text);
  for (const ring of ringMatches) {
    const start = editor.document.positionAt(ring.index);
    const end = editor.document.positionAt(ring.index + ring.length);

    matches.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        before: { backgroundColor: ring.color },
      },
    });
  }

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

