import { extractColorFromApply } from "../../src/extension";

describe("extractColorFromApply", () => {
  it("extracts single class", () => {
    expect(extractColorFromApply("bg-red-500")).toBe(
      "oklch(63.7% 0.237 25.331)"
    );
  });

  it("extracts arbitrary class", () => {
    expect(extractColorFromApply("bg-[#ff0000]")).toBe("#ff0000");
  });

  it("extracts multiple classes", () => {
    expect(extractColorFromApply("text-white bg-[#00ff00] border-2")).toBe("#00ff00");
  });
});
