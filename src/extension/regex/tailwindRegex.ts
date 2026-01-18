import { escapeRegex, getTailwindUtilities } from "../utils/getTailwindUtilities";

export function createColorRegex(): RegExp {
  const utilities = getTailwindUtilities()
    .map(escapeRegex)
    .join("|");

  return new RegExp(
    String.raw`\b((?:[a-z]+:)*)(${utilities})-(?:\[([^\]]+)\]|([a-z]+-\d{2,3})\b)`,
    "g"
  );
}


export const COLOR_REGEX = createColorRegex();

export const APPLY_REGEX = /@apply\s+([^;]+);/g;

export const THEME_REGEX = /theme\(([^)]+)\)/g;

export const TW_RING_REGEX =
  /--tw-(ring-color|ring-offset-color):\s*([^;]+);/g;

export const CLASS_REGEX =
  /\b(?:class|className)\s*=\s*["']([^"']+)["']|class:([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/g;

