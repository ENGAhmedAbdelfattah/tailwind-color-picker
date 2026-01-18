import { resolveTheme } from "../main";

describe("resolveTheme", () => {
  it("resolves tailwind config", () => {
    const value = resolveTheme("colors.red.500");
    expect(value).toBe("#ef4444");
  });

  it("returns null for invalid path", () => {
    expect(resolveTheme("colors.invalid.500")).toBeNull();
  });
});
