# Changelog
All notable changes to the Tailwind Color Picker extension will be documented in this file.

## [Unreleased]

### Added

* **Tailwind v4 CSS Theme Support**: Full support for CSS custom properties defined in `@theme inline` blocks and `:root` variables.
* **CSS Variable Resolution**: Automatic resolution of `var(--color-name)` references in class attributes.
* **HSL Color Parsing**: Added support for HSL/HSLA color format parsing.
* **CSS Theme Parser**: New parser to extract and resolve color definitions from CSS files.
* **Inline Previews for CSS Variables**: Color swatches now appear for CSS custom property definitions.
* User settings to toggle inline previews.
* Support for custom color configurations in tailwind.config.js.


## [1.0.0] - 2026-01-18

### Added

* Initial Release of Tailwind Color Picker.
* Inline Color Swatches: Visual previews for standard Tailwind classes (e.g., text-blue-500).
* JIT Support: Support for arbitrary values like bg-[#123456].
* Color Picker Command: New command to select colors from a palette or hex input.
* Directives Support: Support for @apply and theme() functions in CSS/SCSS.
* Ring Support: Integration with --tw-ring utilities.
* Multi-language Support: Works in HTML, JSX, TSX, Vue, and Svelte.

## [0.1.0] - 2026-01-05

### Added

* Beta version for internal testing.
* Basic regex parsing for standard Tailwind color palettes.

### Legend

* Added: For new features.
* Changed: For changes in existing functionality.
* Deprecated: For soon-to-be removed features.
* Removed: For now removed features.
* Fixed: For any bug fixes.
* Security: In case of vulnerabilities.
