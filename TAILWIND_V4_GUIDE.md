# Tailwind v4 CSS Theme Support - Usage Guide

## Overview

The Tailwind Color Picker extension now fully supports Tailwind v4's CSS-based theme configuration. This allows you to define colors using CSS custom properties and see inline color previews throughout your codebase.

## Setting Up Your Theme

### 1. Define Colors in `:root`

First, define your color values in the `:root` block using HSL format **without** the `hsl()` wrapper:

```css
:root {
  /* Base colors - HSL values without hsl() wrapper */
  --primary: 120 80% 28%;
  --secondary: 0 0% 32%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Color shades */
  --primary-500: 120 64% 50%;
  --primary-600: 120 62% 40%;
  --primary-700: 120 60% 30%;
}
```

### 2. Map to Tailwind Theme

Use the `@theme inline` directive to map your CSS variables to Tailwind's color system:

```css
@theme inline {
  /* Add hsl() wrapper here */
  --color-primary: hsl(var(--primary));
  --color-secondary: hsl(var(--secondary));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  
  /* Color shades */
  --color-primary-500: hsl(var(--primary-500));
  --color-primary-600: hsl(var(--primary-600));
  --color-primary-700: hsl(var(--primary-700));
}
```

### 3. Dark Mode Support

Define dark mode colors in a `.dark` class:

```css
.dark {
  --background: 215 20.2% 13.7%;
  --foreground: 215 20.2% 85.1%;
  --primary: 210 40% 98%;
}
```

## Using Theme Colors in Your Code

### In HTML/JSX/TSX

Use CSS variables with the `var()` function in arbitrary values:

```html
<!-- Background colors -->
<div class="bg-[var(--color-primary)] text-white">
  Primary background
</div>

<!-- Text colors -->
<p class="text-[var(--color-foreground)]">
  Foreground text
</p>

<!-- Border colors -->
<div class="border-2 border-[var(--color-primary-600)]">
  Bordered element
</div>

<!-- Multiple colors -->
<button class="bg-[var(--color-primary)] hover:bg-[var(--color-primary-700)] text-white">
  Click me
</button>
```

### In CSS Files

Use the colors directly with the `hsl()` wrapper:

```css
@layer base {
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}

@layer components {
  .btn-primary {
    @apply bg-[var(--color-primary)] text-white;
  }
}
```

## Features

### ✅ Automatic Color Detection

The extension automatically detects and shows color previews for:

1. **CSS Variable Definitions** - Color swatches appear next to variable declarations
2. **CSS Variable References** - `var(--color-name)` in class attributes
3. **Direct HSL Values** - Both `120 80% 28%` and `hsl(120, 80%, 28%)` formats
4. **Color Shades** - Supports numbered shades like `--primary-500`, `--primary-600`

### ✅ Color Picker Integration

Click on any color swatch to:
- Change the color using the visual color picker
- Convert between formats (hex, RGB, HSL)
- Find the nearest Tailwind palette color

### ✅ Workspace-Wide Support

The extension searches for CSS files in common locations:
- `src/app.css`
- `src/index.css`
- `src/globals.css`
- `src/styles/globals.css`
- `app/globals.css`
- `styles/globals.css`

## Best Practices

### 1. Consistent Naming

Use a consistent naming convention for your color variables:

```css
/* Good - Clear hierarchy */
--primary: 120 80% 28%;
--primary-foreground: 210 40% 98%;
--primary-500: 120 64% 50%;
--primary-600: 120 62% 40%;

/* Avoid - Inconsistent naming */
--mainColor: 120 80% 28%;
--primaryText: 210 40% 98%;
--primary_light: 120 64% 50%;
```

### 2. Use HSL Format

HSL format is recommended for Tailwind v4 themes:

```css
/* Recommended - HSL */
--primary: 120 80% 28%;

/* Also works but less flexible */
--primary-hex: #1f7a1f;
```

### 3. Separate Definition from Usage

Keep color definitions in `:root` and map them in `@theme inline`:

```css
/* Define once */
:root {
  --primary: 120 80% 28%;
}

/* Map to theme */
@theme inline {
  --color-primary: hsl(var(--primary));
}
```

## Troubleshooting

### Colors Not Showing?

1. **Check file location**: Ensure your CSS file is in one of the supported locations
2. **Verify format**: Make sure HSL values are in the format `H S% L%` (e.g., `120 80% 28%`)
3. **Reload window**: Try reloading VS Code window (Ctrl+Shift+P → "Reload Window")

### Variables Not Resolving?

1. **Check variable names**: Ensure the variable name in `var()` matches the definition
2. **Verify @theme block**: Make sure variables are properly mapped in `@theme inline`
3. **Check syntax**: Ensure proper use of `hsl(var(--name))` in theme mappings

## Examples

See the included example files:
- `example-theme.css` - Complete theme setup
- `example-demo.html` - Usage examples in HTML

## Support

For issues or feature requests, please visit:
https://github.com/ENGAhmedAbdelfattah/tailwind-color-picker
