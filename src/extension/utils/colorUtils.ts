import * as vscode from "vscode";

export function colorStringToVscodeColor(colorString: string): vscode.Color | null {
  if (!colorString) return null;

  const rgb = colorStringToRgb(colorString);
  if (rgb) {
    return new vscode.Color(rgb.r, rgb.g, rgb.b, rgb.a ?? 1);
  }
  return null;
}

export function vscodeColorToHex(color: vscode.Color): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
}

export function colorStringToRgb(colorString: string): { r: number; g: number; b: number; a?: number } | null {
  if (!colorString) return null;

  // Hex
  if (colorString.startsWith("#")) {
    const hex = colorString.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16) / 255;
      const g = parseInt(hex[1] + hex[1], 16) / 255;
      const b = parseInt(hex[2] + hex[2], 16) / 255;
      return { r, g, b, a: 1 };
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return { r, g, b, a: 1 };
    } else if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return { r, g, b, a };
    }
  }

  // RGB/RGBA
  const rgbMatch = colorString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]) / 255;
    const g = parseInt(rgbMatch[2]) / 255;
    const b = parseInt(rgbMatch[3]) / 255;
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
    return { r, g, b, a };
  }

  // HSL/HSLA
  // Supports: hsl(120, 80%, 28%) or hsl(120 80% 28%) or hsla(120, 80%, 28%, 0.5)
  const hslMatch = colorString.match(/^hsla?\(([\d.]+),?\s*([\d.]+)%,?\s*([\d.]+)%(?:,?\s*\/?\s*([\d.]+)%?)?\)$/);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]) / 100;
    const l = parseFloat(hslMatch[3]) / 100;
    const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
    return hslToRgb(h, s, l, a);
  }

  // OKLCH
  // oklch(63.7% 0.237 25.331) or oklch(0.637 0.237 25.331)
  const oklchMatch = colorString.match(/^oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)%?)?\)$/);
  if (oklchMatch) {
    let l = parseFloat(oklchMatch[1]);
    if (colorString.includes("%") && l > 1) l = l / 100; // Handle percentage if explicit
    // But regex check for % is better.
    // Let's refine parsing.

    // Simple parsing splitting by spaces/slash
    const parts = colorString.slice(6, -1).split(/\s+/).filter(Boolean);
    if (parts.length >= 3) {
      let L = parseFloat(parts[0]);
      if (parts[0].endsWith('%')) L = L / 100;

      const C = parseFloat(parts[1]);

      let H = parseFloat(parts[2]); // Degrees

      let A = 1;
      if (parts.length >= 4) {
        let alphaPart = parts[3];
        if (alphaPart.startsWith('/')) alphaPart = alphaPart.slice(1);
        if (alphaPart) {
          A = parseFloat(alphaPart);
          if (parts[3].endsWith('%')) A = A / 100;
        }
      } else if (colorString.includes('/')) {
        // Handle slash syntax if split failed to separate slash
        // But regex split usually works if spaces around slash.
        // Standard: oklch(L C H / A)
      }

      return oklchToRgb(L, C, H, A);
    }
  }

  return null;
}

function hslToRgb(h: number, s: number, l: number, a: number = 1): { r: number, g: number, b: number, a: number } {
  // Normalize hue to 0-360 range
  h = h % 360;
  if (h < 0) h += 360;
  h = h / 360;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r, g, b, a };
}

function oklchToRgb(L: number, C: number, H: number, Alpha: number = 1): { r: number, g: number, b: number, a: number } {
  const hRad = H * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  let l = l_ * l_ * l_;
  let m = m_ * m_ * m_;
  let s = s_ * s_ * s_;

  let rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const transfer = (v: number) => {
    return v >= 0.0031308 ? 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055 : 12.92 * v;
  };

  const red = Math.min(1, Math.max(0, transfer(rLinear)));
  const green = Math.min(1, Math.max(0, transfer(gLinear)));
  const blue = Math.min(1, Math.max(0, transfer(bLinear)));

  return { r: red, g: green, b: blue, a: Alpha };
}

export function applyOpacity(colorString: string, opacity: string): string {
  if (!colorString) return colorString;

  // Parse opacity
  let alpha = 1;
  const opacityNum = parseFloat(opacity);
  if (!isNaN(opacityNum)) {
    alpha = opacityNum / 100;
  }

  // If color is already rgba/hsla etc., we might want to replace alpha.
  // But for simple hex colors from palette:
  const rgb = colorStringToRgb(colorString);
  if (rgb) {
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    // If it's 1, we can return as is if we want, but usually we want to return the version with alpha
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return colorString;
}
