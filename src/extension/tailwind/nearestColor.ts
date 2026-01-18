import { TailwindPalette } from "./palette";
import { colorStringToRgb } from "../utils/colorUtils";

export type RGB = { r: number; g: number; b: number };

export function findNearestTailwindColor(
  colorString: string,
  palette: TailwindPalette
) {
  const target = colorStringToRgb(colorString);
  if (!target) return null;

  let best: { color: string; shade: string } | null = null;
  let min = Infinity;

  for (const color in palette) {
    for (const shade in palette[color]) {
      const rgb = colorStringToRgb(palette[color][shade]);
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

function distance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

