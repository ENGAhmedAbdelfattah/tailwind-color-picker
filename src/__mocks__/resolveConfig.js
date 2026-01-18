const colors = require("./colors");

function deepMerge(target, source) {
  if (typeof target !== "object" || typeof source !== "object") {
    return source;
  }

  const merged = { ...target };

  for (const key of Object.keys(source)) {
    if (key in target) {
      merged[key] = deepMerge(target[key], source[key]);
    } else {
      merged[key] = source[key];
    }
  }

  return merged;
}

module.exports = function resolveConfig(userConfig) {
  const config = userConfig || {};

  const defaultConfig = {
    theme: {
      colors,
    },
  };

  const merged = deepMerge(defaultConfig, config);

  // Ensure theme exists
  merged.theme = merged.theme || {};
  merged.theme.colors = merged.theme.colors || colors;

  return merged;
};
