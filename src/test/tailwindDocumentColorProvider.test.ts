import * as vscode from "vscode";
import { TailwindDocumentColorProvider } from "../extension/providers/tailwindDocumentColorProvider";
import { loadTailwindPalette } from "../extension/tailwind/palette";

describe("TailwindDocumentColorProvider", () => {
  let provider: TailwindDocumentColorProvider;

  beforeEach(() => {
    provider = new TailwindDocumentColorProvider();
  });

  describe("provideDocumentColors", () => {
    it("should extract standard tailwind colors", () => {
      const document = {
        getText: () => "div { class: 'text-red-500' }",
        positionAt: (offset: number) => new vscode.Position(0, offset),
      } as any;

      const colors = provider.provideDocumentColors(document, {} as any);
      expect(colors).toHaveLength(1);
      const colorInfo = colors[0];
      // red-500 in Tailwind v4 is oklch, so we check for approximate red color
      expect(colorInfo.color.red).toBeGreaterThan(0.9);
      expect(colorInfo.color.green).toBeLessThan(0.4);
      expect(colorInfo.color.blue).toBeLessThan(0.4);
    });

    it("should extract arbitrary colors", () => {
      const document = {
        getText: () => "div { class: 'bg-[#0000ff]' }",
        positionAt: (offset: number) => new vscode.Position(0, offset),
      } as any;

      const colors = provider.provideDocumentColors(document, {} as any);
      expect(colors).toHaveLength(1);
      const colorInfo = colors[0];
      // #0000ff -> blue
      expect(colorInfo.color.red).toBe(0);
      expect(colorInfo.color.green).toBe(0);
      expect(colorInfo.color.blue).toBe(1);
    });
  });

  describe("provideColorPresentations", () => {
    it("should return nearest tailwind class for standard color", () => {
      const color = new vscode.Color(239 / 255, 68 / 255, 68 / 255, 1); // red-500
      const context = {
        document: {
          getText: () => "text-red-500", // simulated original text
        } as any,
        range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 12)),
      };

      const presentations = provider.provideColorPresentations(color, context, {} as any);
      // Should find text-red-500
      const labels = presentations.map(p => p.label);
      if (!labels.includes("text-red-500")) {
        console.log("Presentations:", labels);
      }
      expect(labels).toContain("text-red-500");
    });

    it("should return arbitrary value for custom color", () => {
      const color = new vscode.Color(0.1, 0.2, 0.3, 1); // some random color
      const context = {
        document: {
          getText: () => "text-[#123456]", // simulated original text
        } as any,
        range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 14)),
      };

      const presentations = provider.provideColorPresentations(color, context, {} as any);
      // Check for arbitrary value format text-[#...]
      // Hex for 0.1, 0.2, 0.3 -> 1a, 33, 4d
      expect(presentations.some(p => p.label.startsWith("text-["))).toBe(true);
    });

    it("should return class with opacity when alpha < 1", () => {
      const color = new vscode.Color(1, 1, 1, 0.5); // white with 50% opacity
      const context = {
        document: {
          getText: () => "bg-white",
        } as any,
        range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 8)),
      };

      const presentations = provider.provideColorPresentations(color, context, {} as any);
      const labels = presentations.map(p => p.label);
      expect(labels).toContain("bg-white/50");
    });

    it("should return arbitrary value with opacity when alpha < 1", () => {
      const color = new vscode.Color(1, 0, 0, 0.5); // red with 50% opacity
      const context = {
        document: {
          getText: () => "bg-[#ff0000]",
        } as any,
        range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 11)),
      };

      const presentations = provider.provideColorPresentations(color, context, {} as any);
      const labels = presentations.map(p => p.label);
      expect(labels).toContain("bg-[#ff0000]/50");
    });
  });
});
