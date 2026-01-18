import { CSS_VAR_REGEX } from "../regex/tailwindRegex";
import { loadCSSThemeColors } from "../tailwind/cssThemeParser";

export interface CSSVarMatch {
  varName: string;
  color: string;
  index: number;
  length: number;
}

/**
 * Parses CSS custom property definitions and resolves their color values
 */
export function parseCSSVariables(text: string): CSSVarMatch[] {
  const matches: CSSVarMatch[] = [];
  const themeColors = loadCSSThemeColors();

  for (const match of text.matchAll(CSS_VAR_REGEX)) {
    const varName = match[1]; // e.g., "color-primary" or "primary"
    const referencedVar = match[2]; // e.g., "primary" (from hsl(var(--primary)))
    const directValue = match[3]; // e.g., "120 80% 28%"

    let colorValue: string | null = null;

    if (directValue) {
      // Direct HSL value without hsl() wrapper
      colorValue = `hsl(${directValue.replace(/\s+/g, ", ")})`;
    } else if (referencedVar) {
      // Referenced variable - look it up in theme colors
      const value = themeColors[referencedVar];
      if (value) {
        colorValue = `hsl(${value.replace(/\s+/g, ", ")})`;
      }
    }

    if (colorValue) {
      matches.push({
        varName,
        color: colorValue,
        index: match.index ?? 0,
        length: match[0].length,
      });
    }
  }

  return matches;
}
