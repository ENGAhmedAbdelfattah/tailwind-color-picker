import colors from "tailwindcss/colors";
import { loadCSSThemeColors } from "./cssThemeParser";

export type TailwindPalette = Record<string, Record<string, string>>;

export function loadTailwindPalette(): TailwindPalette {
  const palette: TailwindPalette = {};

  // 1. Load standard Tailwind colors
  for (const [name, value] of Object.entries(colors)) {
    if (typeof value === "object" && value !== null) {
      const shades = Object.entries(value).filter(([k]) => /^\d+$/.test(k) || k === 'DEFAULT');
      if (shades.length > 0) {
        palette[name] = Object.fromEntries(shades) as Record<string, string>;
      }
    } else if (typeof value === "string") {
      // For colors like 'white', 'black', 'transparent'
      palette[name] = { DEFAULT: value };
    }
  }

  // 2. Load and merge CSS theme colors
  const cssColors = loadCSSThemeColors();
  for (const [fullName, value] of Object.entries(cssColors)) {
    // Check if the name has a shade suffix (e.g., "primary-500" or "blue-50")
    const shadeMatch = fullName.match(/^(.*?)-(\d{2,4})$/);

    if (shadeMatch) {
      const baseName = shadeMatch[1];
      const shade = shadeMatch[2];

      if (!palette[baseName]) {
        palette[baseName] = {};
      }
      palette[baseName][shade] = value;
    } else {
      // No shade or non-numeric suffix, use as DEFAULT
      if (!palette[fullName]) {
        palette[fullName] = {};
      }
      palette[fullName]["DEFAULT"] = value;
    }
  }

  return palette;
}

