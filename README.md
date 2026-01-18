# Tailwind Color Picker

A VS Code extension that enhances Tailwind CSS development by providing inline color previews and a powerful color picker.

## Features

### Inline Color Preview

Displays a small color swatch before Tailwind color classes directly in the editor.

### Color Picker Command

Pick colors using:

* Tailwind Palette
* Arbitrary Color
* Hex → Nearest Palette

### Full Tailwind Support

* Tailwind v3 JIT arbitrary values
* @apply (including nested selectors and @layer)
* theme() function
* --tw-ring-color and --tw-ring-offset-color

### Supported Languages

* HTML
* CSS / SCSS / LESS
* JavaScript / TypeScript
* React (JSX/TSX)
* Vue
* Svelte

## Installation

1. Open VS Code
2. Go to Extensions
3. Search for Tailwind Color Picker
4. Install and reload VS Code

## Usage

### Inline Preview

Inline color preview is enabled automatically in supported file types.

### Color Picker

Hover over a Tailwind class and click the Pick Color link.

### Example

<div class="bg-[#ff0000] text-white"></div>

Hovering over the class shows the picker, and the swatch appears inline.

## Settings (Optional)

You can configure the extension from the settings panel (coming soon).

## Testing

This extension uses Jest for unit testing.

Run tests:

npm test

## Contribution

Contributions are welcome! If you want to contribute:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a Pull Request

## License

This project is licensed under the MIT License.

## Contact

If you have any questions or suggestions, feel free to open an issue.
