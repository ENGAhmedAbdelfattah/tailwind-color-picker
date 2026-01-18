import { CLASS_REGEX } from "../main";

describe("CLASS_REGEX", () => {
  it("matches class attribute", () => {
    const text = `<div class="bg-[#ff0000] text-white"></div>`;
    const match = [...text.matchAll(CLASS_REGEX)];
    expect(match.length).toBe(1);
    expect(match[0][1]).toContain("bg-[#ff0000]");
  });

  it("matches className attribute", () => {
    const text = `<div className="bg-[#ff0000]"></div>`;
    const match = [...text.matchAll(CLASS_REGEX)];
    expect(match.length).toBe(1);
    expect(match[0][1]).toContain("bg-[#ff0000]");
  });

  it("matches class binding", () => {
    const text = `<div class:bg-red-500="isActive"></div>`;
    const match = [...text.matchAll(CLASS_REGEX)];
    expect(match.length).toBe(1);
    expect(match[0][2]).toBe("bg-red-500");
  });
});
