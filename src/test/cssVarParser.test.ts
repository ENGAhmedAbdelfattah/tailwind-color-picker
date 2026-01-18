import { parseCSSVariables } from "../extension/parsing/cssVarParser";

// Mock the loadCSSThemeColors function
jest.mock("../extension/tailwind/cssThemeParser", () => ({
  loadCSSThemeColors: () => ({
    "primary": "120 80% 28%",
    "secondary": "0 0% 32%",
    "background": "0 0% 100%",
  }),
}));

describe("CSS Variable Parser", () => {
  test("should parse direct HSL values", () => {
    const cssText = `
:root {
  --primary: 120 80% 28%;
  --secondary: 0 0% 32%;
}
    `;

    const matches = parseCSSVariables(cssText);

    expect(matches.length).toBe(2);
    expect(matches[0].varName).toBe("primary");
    expect(matches[0].color).toBe("hsl(120, 80%, 28%)");
    expect(matches[1].varName).toBe("secondary");
    expect(matches[1].color).toBe("hsl(0, 0%, 32%)");
  });

  test("should parse referenced variables in @theme inline", () => {
    const cssText = `
@theme inline {
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
}
    `;

    const matches = parseCSSVariables(cssText);

    expect(matches.length).toBe(2);
    expect(matches[0].varName).toBe("color-primary");
    expect(matches[0].color).toBe("hsl(120, 80%, 28%)");
    expect(matches[1].varName).toBe("color-secondary");
    expect(matches[1].color).toBe("hsl(0, 0%, 32%)");
  });

  test("should handle mixed direct and referenced values", () => {
    const cssText = `
:root {
  --custom-color: 240 50% 60%;
}

@theme inline {
  --color-custom: hsl(var(--custom-color));
  --color-direct: 180 70% 45%;
}
    `;

    const matches = parseCSSVariables(cssText);

    expect(matches.length).toBeGreaterThan(0);

    const customColor = matches.find(m => m.varName === "custom-color");
    expect(customColor).toBeDefined();
    expect(customColor?.color).toBe("hsl(240, 50%, 60%)");
  });

  test("should track correct indices and lengths", () => {
    const cssText = `--test: 120 80% 28%;`;

    const matches = parseCSSVariables(cssText);

    expect(matches.length).toBe(1);
    expect(matches[0].index).toBe(0);
    expect(matches[0].length).toBe(cssText.length);
  });
});
