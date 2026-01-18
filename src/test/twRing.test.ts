import { TW_RING_REGEX } from "../../src/extension";

describe("--tw-ring-color", () => {
  it("matches ring color", () => {
    const text = "--tw-ring-color: rgba(0,0,0,0.5);";
    const match = [...text.matchAll(TW_RING_REGEX)];
    expect(match.length).toBe(1);
    expect(match[0][2]).toContain("rgba(0,0,0,0.5)");
  });
});
