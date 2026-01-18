import { extractColor } from "./classParser";

export function extractColorFromApply(value: string): string | null {
  const classes = value.split(/\s+/);

  for (const c of classes) {
    const color = extractColor(c);
    if (color && c.includes("[")) return color;
  }

  return null;
}

