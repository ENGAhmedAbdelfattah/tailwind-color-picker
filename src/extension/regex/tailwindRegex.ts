import { escapeRegex, getTailwindUtilities } from "../utils/getTailwindUtilities";

export function createColorRegex(): RegExp {
  const utilities = getTailwindUtilities()
    .map(escapeRegex)
    .join("|");

  return new RegExp(
    String.raw`(?<![:a-z0-9-])((?:([a-z0-9-]+:)*)(${utilities})-(?:\[([^\]]+)\]|([a-z0-9-]+?)(?:-(\d{2,4}))?(?:\/(\d+))?\b))`,
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

// CSS custom property definitions (for @theme inline and :root blocks)
// Matches: --color-primary: hsl(var(--primary)); or --primary: 120 80% 28%;
export const CSS_VAR_REGEX =
  /--([a-z0-9-]+):\s*(?:hsl\(var\(--([a-z0-9-]+)\)\)|([0-9.]+\s+[0-9.]+%\s+[0-9.]+%));/g;

