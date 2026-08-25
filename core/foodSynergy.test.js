import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { getFoodTip } from './foodSynergy.js';

const config = JSON.parse(readFileSync('./config/foodSynergyTable.json', 'utf-8'));

test('chai ke saath khana khaya → tea-timing inhibitor', () => {
  const result = getFoodTip('chai ke saath khana khaya', config);
  assert.strictEqual(result.type, 'inhibitor');
  assert.match(result.tip, /tea|60/i);
});

test('doodh ke saath roti → dairy inhibitor', () => {
  const result = getFoodTip('doodh ke saath roti', config);
  assert.strictEqual(result.type, 'inhibitor');
  assert.match(result.tip, /dairy|calcium/i);
});

test('nimbu ke saath palak → vitamin C enhancer', () => {
  const result = getFoodTip('nimbu ke saath palak', config);
  assert.strictEqual(result.type, 'enhancer');
  assert.match(result.tip, /vitamin c|citrus|lemon|iron/i);
});

test('unrecognized input → fallback tip, never blank', () => {
  const result = getFoodTip('khichdi aur achar', config);
  assert.ok(result.tip && result.tip.length > 10);
  assert.strictEqual(result.type, 'default');
});

test('empty input returns an object with fallback tip', () => {
  const result = getFoodTip('', config);
  assert.strictEqual(typeof result, 'object');
  assert.ok(result.tip.length > 0);
});

test('iron_deficiency type selects type-aware default branch', () => {
  const result = getFoodTip('khichdi', config, 'default', { anemiaType: 'iron_deficiency' });
  assert.match(result.tip, /iron-deficiency|dal|palak|jaggery/i);
});

test('child audience selects moringa porridge branch', () => {
  const result = getFoodTip('daliya khaya', config, 'default', { audience: 'child' });
  assert.match(result.tip, /moringa|porridge|child/i);
});
