import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { getSeverity } from './ruleEngine.js';

const adultConfig = JSON.parse(readFileSync('./config/adultThresholds.json', 'utf-8'));

test('getSeverity returns Normal for Hb=13', () => {
  const result = getSeverity(13, adultConfig);
  assert.strictEqual(result.level, 'Normal');
  assert.strictEqual(result.color, '#10B981');
  assert.ok(result.message.length > 0);
  assert.strictEqual(result.hbValue, 13);
});

test('getSeverity returns Mild Anemia for Hb=11', () => {
  const result = getSeverity(11, adultConfig);
  assert.strictEqual(result.level, 'Mild Anemia');
  assert.strictEqual(result.color, '#FCD34D');
  assert.ok(result.message.length > 0);
});

test('getSeverity returns Moderate Anemia for Hb=9', () => {
  const result = getSeverity(9, adultConfig);
  assert.strictEqual(result.level, 'Moderate Anemia');
  assert.strictEqual(result.color, '#F59E0B');
  assert.ok(result.message.length > 0);
  assert.strictEqual(result.hbValue, 9);
});

test('getSeverity returns Severe Anemia for Hb=7', () => {
  const result = getSeverity(7, adultConfig);
  assert.strictEqual(result.level, 'Severe Anemia');
  assert.strictEqual(result.color, '#EF4444');
  assert.ok(result.message.length > 0);
});

test('getSeverity throws error for invalid Hb', () => {
  assert.throws(() => getSeverity('invalid', adultConfig), /Invalid hemoglobin value/);
  assert.throws(() => getSeverity(-5, adultConfig), /Invalid hemoglobin value/);
  assert.throws(() => getSeverity(NaN, adultConfig), /Invalid hemoglobin value/);
});

test('getSeverity throws error for invalid config', () => {
  assert.throws(() => getSeverity(10, null), /Invalid config structure/);
  assert.throws(() => getSeverity(10, {}), /Invalid config structure/);
});
