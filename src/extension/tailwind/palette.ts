import colors from "tailwindcss/colors";

export type TailwindPalette = Record<string, Record<string, string>>;

export function loadTailwindPalette(): TailwindPalette {
  const palette: TailwindPalette = {};

  for (const [name, value] of Object.entries(colors)) {
    if (typeof value === "object" && value !== null) {
      const shades = Object.entries(value).filter(([k]) => /^\d+$/.test(k));
      if (shades.length > 0) {
        palette[name] = Object.fromEntries(shades) as Record<string, string>;
      }
    }
  }

  return palette;
}

