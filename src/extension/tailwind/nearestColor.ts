import { TailwindPalette } from "./palette";

export type RGB = { r: number; g: number; b: number };

export function findNearestTailwindColor(
  hex: string,
  palette: TailwindPalette
) {
  const target = hexToRgb(hex);
  if (!target) return null;

  let best: { color: string; shade: string } | null = null;
  let min = Infinity;

  for (const color in palette) {
    for (const shade in palette[color]) {
      const rgb = hexToRgb(palette[color][shade]);
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

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return null;
  const [r, g, b] = m.map((x) => parseInt(x, 16));
  return { r, g, b };
}

function distance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

