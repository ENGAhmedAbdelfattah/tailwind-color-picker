import { parseCSSThemeColors, resolveCSSVariable, loadCSSThemeColors } from "../extension/tailwind/cssThemeParser";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

describe("CSS Theme Parser", () => {
  let tempCSSFile: string;

  beforeEach(() => {
    // Create a temporary CSS file for testing
    const tempDir = os.tmpdir();
    tempCSSFile = path.join(tempDir, "test-theme.css");
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(tempCSSFile)) {
      fs.unlinkSync(tempCSSFile);
    }
  });

  test("should parse :root CSS variables", () => {
    const cssContent = `
:root {
  --primary: 120 80% 28%;
  --secondary: 0 0% 32%;
  --background: 0 0% 100%;
}
    `;

    fs.writeFileSync(tempCSSFile, cssContent, "utf-8");
    const colors = parseCSSThemeColors(tempCSSFile);

    expect(colors["primary"]).toBe("120 80% 28%");
    expect(colors["secondary"]).toBe("0 0% 32%");
    expect(colors["background"]).toBe("0 0% 100%");
  });

  test("should parse @theme inline color mappings", () => {
    const cssContent = `
:root {
  --primary: 120 80% 28%;
  --secondary: 0 0% 32%;
}

@theme inline {
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
}
    `;

    fs.writeFileSync(tempCSSFile, cssContent, "utf-8");
    const colors = parseCSSThemeColors(tempCSSFile);

    expect(colors["primary"]).toBe("hsl(120 80% 28%)");
    expect(colors["secondary"]).toBe("hsl(0 0% 32%)");
  });

  test("should resolve CSS variables", () => {
    const themeColors = {
      "primary": "120 80% 28%",
      "secondary": "0 0% 32%",
    };

    const resolved1 = resolveCSSVariable("var(--primary)", themeColors);
    expect(resolved1).toBe("hsl(120 80% 28%)");

    const resolved2 = resolveCSSVariable("var(--secondary)", themeColors);
    expect(resolved2).toBe("hsl(0 0% 32%)");
  });

  test("should resolve CSS variables with color- prefix", () => {
    const themeColors = {
      "primary": "120 80% 28%",
      "color-secondary": "0 0% 32%",
    };

    const resolved1 = resolveCSSVariable("var(--color-primary)", themeColors);
    expect(resolved1).toBe("hsl(120 80% 28%)");

    const resolved2 = resolveCSSVariable("var(--color-secondary)", themeColors);
    expect(resolved2).toBe("hsl(0 0% 32%)");
  });

  test("should return null for unknown variables", () => {
    const themeColors = {
      "primary": "120 80% 28%",
    };

    const resolved = resolveCSSVariable("var(--unknown)", themeColors);
    expect(resolved).toBeNull();
  });

  test("should handle complex theme with shades", () => {
    const cssContent = `
:root {
  --primary-500: 120 64% 50%;
  --primary-600: 120 62% 40%;
  --primary-700: 120 60% 30%;
}

@theme inline {
  --color-primary-500: hsl(var(--primary-500));
  --color-primary-600: hsl(var(--primary-600));
  --color-primary-700: hsl(var(--primary-700));
}
    `;

    fs.writeFileSync(tempCSSFile, cssContent, "utf-8");
    const colors = parseCSSThemeColors(tempCSSFile);

    expect(colors["primary-500"]).toBe("hsl(120 64% 50%)");
    expect(colors["primary-600"]).toBe("hsl(120 62% 40%)");
    expect(colors["primary-700"]).toBe("hsl(120 60% 30%)");
  });
});
