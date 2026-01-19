# 🎨 Tailwind Color Picker

**Stop guessing Hex codes. Start seeing your colors.**

[![](https://img.shields.io/visual-studio-marketplace/v/AhmedAbdelfattah.tailwind-color-picker?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=AhmedAbdelfattah.tailwind-color-picker)
![](https://img.shields.io/visual-studio-marketplace/i/AhmedAbdelfattah.tailwind-color-picker?style=for-the-badge)
![](https://img.shields.io/visual-studio-marketplace/r/AhmedAbdelfattah.tailwind-color-picker?style=for-the-badge)

Tailwind Color Picker is a high-performance VS Code extension that brings visual color intelligence directly into your editor. Designed for the modern Tailwind CSS ecosystem, it provides instant inline swatches, an advanced color picker UI, and deep integration with Tailwind v4's CSS variable-based themes.

![Tailwind Color Picker](images/extension.gif)

---

## 🚀 Why Tailwind Color Picker?

### **Visual Confidence**
See exactly what `bg-indigo-900` or `text-sky-400` looks like without switching to your browser. Real-time swatches appear right next to your code.

### **Tailwind v4 & CSS Variable Native**
Full support for the next generation of Tailwind. The extension automatically parses `@theme inline` blocks and `:root` variables, resolving complex references like `var(--color-primary)` to their actual visual values.

### **Arbitrary Value Support**
Full JIT support. Whether you use `bg-[#ff0000]` or `border-[hsl(200,50%,50%)]`, we've got you covered with accurate previews.

### **Smart Palette Matching**
Don't remember the exact name of a shade? Use the built-in picker to find the perfect match or convert any custom color to its closest Tailwind palette equivalent.

---

## ✨ Features at a Glance

- **Inline Swatches**: Small, non-intrusive color boxes next to your utility classes.
- **Advanced UI Picker**: Hover and click "Pick Color" to choose colors via a visual interface.
- **Deep Theme Integration**: Automatic detection of color definitions in `:root` and `@theme inline` blocks.
- **Dark Mode Ready**: Automatically resolves colors defined in `.dark` classes.
- **Cross-File Support**: Works flawlessly in `.html`, `.css`, `.scss`, `.jsx`, `.tsx`, `.vue`, `.svelte`, and `.astro`.
- **Comprehensive Utility Support**: Previews for background, text, borders, shadows, rings, and more.

---

## 🎨 Tailwind v4 Theme Support

Tailwind Color Picker is optimized for the new CSS-first configuration in Tailwind v4:

```css
/* Define your colors in :root */
:root {
  --primary: 120 80% 28%;
  --secondary: 0 0% 32%;
}

/* Map them in @theme inline */
@theme inline {
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
}
```

![Tailwind v4 Theme Configuration](images/theme-config-v4.gif)

**The extension will:**
- ✅ Resolve `var(--color-name)` references automatically.
- ✅ Support both direct values and `hsl(var(...))` wrappers.
- ✅ Handle color shades (e.g., `--primary-500`) and opacity.
- ✅ Detect changes in your CSS theme files instantly.

> [!TIP]
> For a deep dive into Tailwind v4 support, check out our [Tailwind v4 Usage Guide](./TAILWIND_V4_GUIDE.md).

---

## 🛠 Supported Utilities & Directives

The extension monitors a wide range of Tailwind utilities out of the box:

| Category | Utilities |
| :--- | :--- |
| **Surface** | `bg`, `shadow`, `inset-shadow` |
| **Typography** | `text`, `decoration`, `accent`, `caret` |
| **Border & Outline** | `border`, `outline`, `divide`, `ring`, `inset-ring` |
| **SVG** | `fill`, `stroke` |
| **Directives** | `@apply`, `theme()`, `var()` |

---

## ⚙️ Configuration

You can customize the extension behavior either through VS Code settings or a project-level configuration file.

### **Project Configuration**
Create a `tailwind-color-picker.json` file in your workspace root to share settings with your team:

```json
{
  "utilities": ["bg", "text", "border"],
  "cssFilePath": "src/styles/theme.css"
}
```

### **VS Code Settings**
If no project-level config is found, the extension falls back to your `settings.json`:

- **`tailwindColorPicker.utilities`**: Add or remove utility prefixes the extension should track.
- **`tailwindColorPicker.cssFilePath`**: Point the extension to your custom CSS theme file if it's not in a standard location.

---

## 📦 Supported Languages

- HTML, CSS, SCSS, Less
- JavaScript, TypeScript
- React (JSX/TSX)
- Vue, Svelte, Astro

---

## ⌨️ Commands

- `Tailwind Color Picker: Pick Color` - Open the visual color picker for the utility under the cursor. Supports selecting from:
    - Standard Tailwind palette
    - **Custom Theme Colors (v4)** extracted from your CSS
    - Arbitrary CSS values
    - Hex conversion to nearest palette color

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

---

## 📄 License

MIT © [Ahmed Abdelfattah](https://github.com/ENGAhmedAbdelfattah)
