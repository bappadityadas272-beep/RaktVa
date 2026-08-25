// Food synergy matcher — pure function, config-driven
// Used by both text input and voice transcript
// OPEN file: new branches (region / anemia type / audience) come from config, not ruleEngine.js

function unwrap(config) {
  if (!config) return {};
  if (config.inhibitors || config.enhancers || config.defaultTip || config.byType) return config;
  return config.default || config;
}

function layers(cfg, region, context) {
  const out = [];
  const typeKey = context && context.anemiaType;
  if (typeKey && cfg.byType && cfg.byType[typeKey]) out.push(cfg.byType[typeKey]);
  const audience = context && context.audience;
  if (audience && cfg.byAudience && cfg.byAudience[audience]) out.push(cfg.byAudience[audience]);
  if (region && region !== 'default' && cfg.regions && cfg.regions[region]) out.push(cfg.regions[region]);
  out.push(cfg);
  return out;
}

function matchIn(list, lower) {
  for (const entry of list || []) {
    if (entry.keywords && entry.keywords.some((k) => lower.includes(k))) return entry;
  }
  return null;
}

export function getFoodTip(mealText, config, region = 'default', context = {}) {
  const cfg = unwrap(config);
  const fallback = {
    type: 'default',
    tip: cfg.defaultTip || 'Log a specific food to get a tip.'
  };

  if (!mealText || typeof mealText !== 'string') return fallback;

  const lower = mealText.toLowerCase();
  const stack = layers(cfg, region, context);

  for (const layer of stack) {
    const hit = matchIn(layer.inhibitors, lower);
    if (hit) return { type: 'inhibitor', tip: hit.tip };
  }
  for (const layer of stack) {
    const hit = matchIn(layer.enhancers, lower);
    if (hit) return { type: 'enhancer', tip: hit.tip };
  }
  for (const layer of stack) {
    if (layer.defaultTip) return { type: 'default', tip: layer.defaultTip };
  }
  return fallback;
}
