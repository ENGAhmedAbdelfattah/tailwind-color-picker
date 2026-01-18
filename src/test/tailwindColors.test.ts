import { extractColor } from "../main";

describe("Tailwind Colors Support", () => {
  describe("Standard Palette Colors", () => {
    it("extracts standard color (bg-red-500)", () => {
      expect(extractColor("bg-red-500")).toBe("oklch(63.7% 0.237 25.331)");
    });

    it("extracts with variants (hover:text-blue-600)", () => {
      expect(extractColor("hover:text-blue-600")).toBe("oklch(54.6% 0.245 262.881)");
    });

    it("extracts with multiple variants (dark:hover:border-gray-800)", () => {
      expect(extractColor("dark:hover:border-gray-800")).toBe("oklch(27.8% 0.033 256.848)");
    });
  });

  describe("Special Colors", () => {
    it("extracts white", () => {
      expect(extractColor("bg-white")).toBe("#fff");
    });

    it("extracts black", () => {
      expect(extractColor("text-black")).toBe("#000");
    });

    it("extracts transparent", () => {
      expect(extractColor("border-transparent")).toBe("transparent");
    });
  });

  describe("Opacity Support", () => {
    it("extracts color with opacity (bg-red-500/50)", () => {
      // red-500 in v4 is oklch(63.7% 0.237 25.331) which is approx rgba(251, 44, 54, 1)
      expect(extractColor("bg-red-500/50")).toBe("rgba(251, 44, 54, 0.5)");
    });

    it("extracts white with opacity (bg-white/20)", () => {
      expect(extractColor("bg-white/20")).toBe("rgba(255, 255, 255, 0.2)");
    });

    it("extracts black with opacity (text-black/80)", () => {
      expect(extractColor("text-black/80")).toBe("rgba(0, 0, 0, 0.8)");
    });

    it("extracts with 100% opacity", () => {
      expect(extractColor("bg-red-500/100")).toBe("rgba(251, 44, 54, 1)");
    });

    it("extracts with 0% opacity", () => {
      expect(extractColor("bg-red-500/0")).toBe("rgba(251, 44, 54, 0)");
    });
  });

  describe("New Utilities Support", () => {
    const utilities = [
      "decoration",
      "outline",
      "shadow",
      "inset-shadow",
      "inset-ring",
      "accent",
      "caret"
    ];

    utilities.forEach(utility => {
      it(`extracts color for ${utility}`, () => {
        expect(extractColor(`${utility}-blue-500`)).toBe("oklch(62.3% 0.214 259.815)");
      });
    });

    it("extracts fill and stroke", () => {
      expect(extractColor("fill-red-500")).toBe("oklch(63.7% 0.237 25.331)");
      expect(extractColor("stroke-blue-500")).toBe("oklch(62.3% 0.214 259.815)");
    });
  });
});
