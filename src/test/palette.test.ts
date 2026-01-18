import { loadTailwindPalette, findNearestTailwindColor } from "../main";

describe("Tailwind Palette", () => {
  it("loads palette", () => {
    const palette = loadTailwindPalette();
    expect(palette).toHaveProperty("red");
  });

  it("find nearest", () => {
    const palette = {
      red: { "500": "#ff0000", "600": "#ee0000" },
      blue: { "500": "#0000ff" }
    };

    const nearest = findNearestTailwindColor("#ff0000", palette);
    expect(nearest).toEqual({ color: "red", shade: "500" });
  });
});
