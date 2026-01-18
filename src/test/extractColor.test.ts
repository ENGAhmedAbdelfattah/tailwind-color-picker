import { extractColor } from "../../src/extension";

describe("extractColor", () => {
  it("extracts hex", () => {
    expect(extractColor("bg-[#ff0000]")).toBe("#ff0000");
  });

  it("extracts rgb", () => {
    expect(extractColor("bg-[rgb(255,0,0)]")).toBe("rgb(255,0,0)");
  });

  it("extracts rgba", () => {
    expect(extractColor("bg-[rgba(255,0,0,0.5)]")).toBe("rgba(255,0,0,0.5)");
  });

  it("extracts hsl", () => {
    expect(extractColor("bg-[hsl(0,100%,50%)]")).toBe("hsl(0,100%,50%)");
  });

  it("extracts hsla", () => {
    expect(extractColor("bg-[hsla(0,100%,50%,0.5)]")).toBe("hsla(0,100%,50%,0.5)");
  });

  it("extracts var()", () => {
    expect(extractColor("bg-[var(--primary)]")).toBe("var(--primary)");
  });

  it("extracts theme()", () => {
    // requires tailwind.config.js
    expect(extractColor("bg-[theme('colors.red.500')]")).toBe("#ef4444");
  });

  it("extracts named palette color", () => {
    expect(extractColor("bg-red-500")).toBe("oklch(63.7% 0.237 25.331)");
  });

  it("extracts gray palette color", () => {
    expect(extractColor("text-gray-400")).toBe("oklch(70.7% 0.022 261.325)");
  });
});
