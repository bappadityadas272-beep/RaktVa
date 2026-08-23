/**
 * Pure rule engine for anemia severity classification.
 * CLOSED after Phase 0 — extend via config files, not by editing this.
 */

/**
 * Determine anemia severity based on hemoglobin level and config thresholds.
 * @param {number} hb - Hemoglobin value in g/dL
 * @param {object} config - Threshold configuration (adultThresholds.json or childThresholds.json)
 * @returns {object} {level, color, message} - Severity classification
 */
export function getSeverity(hb, config) {
  if (typeof hb !== 'number' || isNaN(hb) || hb < 0) {
    throw new Error('Invalid hemoglobin value');
  }

  if (!config || !config.severityBands || !Array.isArray(config.severityBands)) {
    throw new Error('Invalid config structure');
  }

  // Find matching severity band
  for (const band of config.severityBands) {
    const minHb = band.minHb;
    const maxHb = band.maxHb;

    // Check if Hb falls within this band's range
    const aboveMin = minHb === null || hb >= minHb;
    const belowMax = maxHb === null || hb <= maxHb;

    if (aboveMin && belowMax) {
      // Pick a random message from the band's message array
      const randomMessage = band.messages[Math.floor(Math.random() * band.messages.length)];

      return {
        level: band.level,
        color: band.color,
        message: randomMessage,
        hbValue: hb,
        unit: config.unit || 'g/dL'
      };
    }
  }

  // Fallback if no band matched (shouldn't happen with proper config)
  throw new Error(`No matching severity band for Hb=${hb}`);
}

/**
 * Get food synergy tip based on meal description and food table.
 * @param {string} mealText - Description of food consumed
 * @param {object} foodConfig - Food synergy lookup table
 * @returns {object} {tip, category} - Personalized food tip
 */
export function getFoodTip(mealText, foodConfig) {
  if (!mealText || typeof mealText !== 'string') {
    return { tip: 'Log your meals to get personalized nutrition tips.', category: 'general' };
  }

  if (!foodConfig || !foodConfig.inhibitors || !foodConfig.enhancers) {
    throw new Error('Invalid food config structure');
  }

  const lowerText = mealText.toLowerCase();

  // Check for iron inhibitors
  for (const inhibitor of foodConfig.inhibitors) {
    for (const keyword of inhibitor.keywords) {
      if (lowerText.includes(keyword)) {
        return {
          tip: inhibitor.tip,
          category: 'inhibitor',
          matched: keyword
        };
      }
    }
  }

  // Check for iron enhancers
  for (const enhancer of foodConfig.enhancers) {
    for (const keyword of enhancer.keywords) {
      if (lowerText.includes(keyword)) {
        return {
          tip: enhancer.tip,
          category: 'enhancer',
          matched: keyword
        };
      }
    }
  }

  // Default tip if no match
  return {
    tip: foodConfig.defaultTip || 'Pair iron-rich foods with vitamin C sources like lemon or amla for better absorption.',
    category: 'general'
  };
}
