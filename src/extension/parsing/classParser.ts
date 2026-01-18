import { loadTailwindPalette } from "../tailwind/palette";
import { resolveTheme } from "../tailwind/themeResolver";
import { loadCSSThemeColors, resolveCSSVariable } from "../tailwind/cssThemeParser";
import { escapeRegex, getTailwindUtilities } from "../utils/getTailwindUtilities";
import { applyOpacity } from "../utils/colorUtils";

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
    const themeColors = loadCSSThemeColors();
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

  const utilities = getTailwindUtilities()
    .map(escapeRegex)
    .join("|");

  // Support variants, utility, color name, optional shade, and optional opacity
  // Matches: hover:bg-red-500, bg-white, text-black/50, border-red-500/20, bg-primary-1000
  const paletteMatch = className.match(
    new RegExp(`^([a-z0-9-]+:)*(${utilities})-([a-z0-9-]+?)(?:-(\\d{2,4}))?(?:\\/(\\d+))?$`)
  );

  if (paletteMatch) {
    const colorName = paletteMatch[3];
    const shade = paletteMatch[4] || "DEFAULT";
    const opacity = paletteMatch[5];

    const palette = loadTailwindPalette();
    const colorShades = palette[colorName];
    if (colorShades && colorShades[shade]) {
      const colorValue = colorShades[shade];
      if (opacity) {
        return applyOpacity(colorValue, opacity);
      }
      return colorValue;
    }
  }

  return null;
}
