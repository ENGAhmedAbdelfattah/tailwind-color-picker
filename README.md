🎨 Tailwind Color Picker
Stop guessing Hex codes. Start seeing your colors.

Tailwind Color Picker is a lightweight, high-performance VS Code extension designed to provide a more visual experience when working with Tailwind CSS. Whether you are using standard utility classes, custom arbitrary values, or **Tailwind v4 CSS theme variables**, this extension ensures your workflow remains uninterrupted and your colors remain accurate.

🚀 Why Tailwind Color Picker?
**Visual Confidence**: See exactly what `bg-indigo-900` looks like without opening a browser.

**Arbitrary Value Ready**: Full support for Tailwind's JIT engine. If you type `bg-[#ff0000]`, we show the swatch.

**Tailwind v4 Theme Support**: Full support for CSS custom properties defined in `@theme inline` blocks and `:root` variables. Works seamlessly with `var(--color-primary)` and theme color definitions.

**Smart Selection**: Don't remember the name of a shade? Use the built-in picker to find the perfect match or convert a Hex code to the closest Tailwind palette equivalent.

**Style-Sheet Power**: Works flawlessly inside `.css` and `.scss` files using `@apply`, `theme()`, and CSS custom properties.

✨ Features at a Glance
**Inline Swatches**: Small, non-intrusive color boxes next to your classes.

**Advanced Picker**: Hover and click to change colors via a visual UI.

**Modern Framework Support**: Built for the modern web—fully compatible with React (JSX/TSX), Vue, Svelte, and Astro.

**Ring & Border Support**: Previews for `--tw-ring-color`, borders, and divide utilities.

**CSS Theme Variables**: Automatic detection and preview of colors defined in `:root` and `@theme inline` blocks.

🛠 Supported Directives
- `@apply`
- `theme('colors.red.500')`
- `--tw-ring-color`
- Arbitrary values: `-[...]`
- CSS custom properties: `var(--color-name)`
- `@theme inline` blocks (Tailwind v4)
- `:root` color variables

## 🎨 Tailwind v4 CSS Theme Support

This extension now fully supports Tailwind v4's CSS-based theme configuration:

```css
/* Define colors in :root */
:root {
  --primary: 120 80% 28%;
  --secondary: 0 0% 32%;
}

/* Map to Tailwind theme */
@theme inline {
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
}
```

The extension will:
- ✅ Show color previews for CSS variable definitions
- ✅ Resolve `var(--color-name)` references in class attributes
- ✅ Support both direct HSL values and `hsl(var(...))` references
- ✅ Work with color shades (e.g., `--primary-500`, `--primary-600`)

📦 How to Use
1. Install the extension.
2. Open any file with Tailwind classes or CSS theme definitions.
3. Visual swatches will appear automatically.
4. Hover over a class and click "Pick Color" to modify it.
