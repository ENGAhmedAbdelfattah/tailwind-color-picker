import { parseCSSThemeColors } from "../extension/tailwind/cssThemeParser";
import { extractColor } from "../extension/parsing/classParser";
import * as cssThemeParser from "../extension/tailwind/cssThemeParser";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("Full Theme Scenario Test", () => {
  let tempCSSFile: string;

  const cssContent = `
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 120 80% 28%;
  --primary-50: 120 76% 95%;
  --primary-100: 120 74% 90%;
  --primary-200: 120 70% 80%;
  --card-foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 215 20.2% 13.7%;
}

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-50: hsl(var(--primary-50));
  --color-primary-100: hsl(var(--primary-100));
  --color-primary-200: hsl(var(--primary-200));
  --color-card-foreground: hsl(var(--card-foreground));
}
`;

  beforeAll(() => {
    const tempDir = os.tmpdir();
    tempCSSFile = path.join(tempDir, "scenario-theme.css");
    fs.writeFileSync(tempCSSFile, cssContent);
  });

  afterAll(() => {
    if (fs.existsSync(tempCSSFile)) {
      fs.unlinkSync(tempCSSFile);
    }
  });

  it("should extract colors from custom @theme definitions", () => {
    // Mock loadCSSThemeColors to return our test colors
    const originalLoad = cssThemeParser.loadCSSThemeColors;
    (cssThemeParser as any).loadCSSThemeColors = () => parseCSSThemeColors(tempCSSFile);

    try {
      // Test basic theme color without shade
      expect(extractColor("bg-primary")).toBe("hsl(120 80% 28%)");

      // Test theme color with shade
      expect(extractColor("bg-primary-100")).toBe("hsl(120 74% 90%)");

      // Test multi-part color name
      expect(extractColor("text-card-foreground")).toBe("hsl(222.2 84% 4.9%)");

      // Test with opacity
      // hsl(120 70% 80%) is approx rgba(168, 240, 168, 1)
      expect(extractColor("bg-primary-200/20")).toBe("rgba(168, 240, 168, 0.2)");

      // Test with variants
      expect(extractColor("hover:border-primary")).toBe("hsl(120 80% 28%)");
    } finally {
      (cssThemeParser as any).loadCSSThemeColors = originalLoad;
    }
  });
});
