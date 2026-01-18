export const COLOR_REGEX =
  /\b((?:[a-z]+:)*)(bg|text|border|ring|fill|stroke)-(?:\[([^\]]+)\]|([a-z]+-\d{2,3}))\b/;

export const APPLY_REGEX = /@apply\s+([^;]+);/g;

export const THEME_REGEX = /theme\(([^)]+)\)/g;

export const TW_RING_REGEX =
  /--tw-(ring-color|ring-offset-color):\s*([^;]+);/g;

export const CLASS_REGEX =
  /\b(?:class|className)\s*=\s*["']([^"']+)["']|class:([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/g;

