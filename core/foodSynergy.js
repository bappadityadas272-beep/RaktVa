// Food synergy matcher — pure function, config-driven
// Used by both text input and voice transcript

export function getFoodTip(mealText, config, region = "default") {
  if (!mealText || typeof mealText !== 'string') {
    return config.defaultTip || "Log a specific food to get a tip.";
  }

  const lower = mealText.toLowerCase();

  // Check inhibitors first (warnings)
  for (const entry of config.inhibitors || []) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return { type: 'inhibitor', tip: entry.tip };
    }
  }

  // Check enhancers (positive feedback)
  for (const entry of config.enhancers || []) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return { type: 'enhancer', tip: entry.tip };
    }
  }

  // Fallback
  return { type: 'default', tip: config.defaultTip || "Pair iron-rich foods with vitamin C sources." };
}
