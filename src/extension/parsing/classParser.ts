import { loadTailwindPalette } from "../tailwind/palette";
import { resolveTheme } from "../tailwind/themeResolver";
import { loadCSSThemeColors, resolveCSSVariable } from "../tailwind/cssThemeParser";

// Cache CSS theme colors to avoid re-parsing on every call
let cssThemeCache: ReturnType<typeof loadCSSThemeColors> | null = null;

function getCSSThemeColors() {
  if (!cssThemeCache) {
    cssThemeCache = loadCSSThemeColors();
  }
  return cssThemeCache;
}

export function extractColor(className: string): string | null {
  const hexMatch = className.match(/\[(#.*?)\]/);
  if (hexMatch) return hexMatch[1];

  const rgbMatch = className.match(/\[(rgb[a]?\([^\]]+\))\]/);
  if (rgbMatch) return rgbMatch[1];

  const hslMatch = className.match(/\[(hsl[a]?\([^\]]+\))\]/);
  if (hslMatch) return hslMatch[1];

  const varMatch = className.match(/\[(var\([^\]]+\))\]/);
  if (varMatch) {
    // Try to resolve CSS variable from theme
    const themeColors = getCSSThemeColors();
    const resolved = resolveCSSVariable(varMatch[1], themeColors);
    if (resolved) return resolved;

    // Return the var() reference as-is if we can't resolve it
    return varMatch[1];
  }

  const themeMatch = className.match(/theme\(([^)]+)\)/);
  if (themeMatch) {
    const value = resolveTheme(themeMatch[1]);
    if (value) return value;
  }

  const paletteMatch = className.match(
    /^(?:[a-z]+:)*(?:bg|text|border|ring|fill|stroke)-([a-z]+)-(\d{2,3})$/
  );
  if (paletteMatch) {
    const [, colorName, shade] = paletteMatch;
    const palette = loadTailwindPalette();
    const shades = palette[colorName];
    if (shades && shades[shade]) {
      return shades[shade];
    }
  }

  return null;
}

