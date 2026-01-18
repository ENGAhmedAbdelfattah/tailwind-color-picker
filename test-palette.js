const { loadTailwindPalette } = require('./out/extension/tailwind/palette');
try {
  const palette = loadTailwindPalette();
  console.log('Palette loaded successfully');
} catch (error) {
  console.error('Error loading palette:', error);
}
