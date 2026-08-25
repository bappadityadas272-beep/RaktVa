import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { getSeverity } from './ruleEngine.js';

const adult = JSON.parse(readFileSync('./config/adultThresholds.json', 'utf-8'));
const child = JSON.parse(readFileSync('./config/childThresholds.json', 'utf-8'));

test('same getSeverity, different config: Hb 11 is Mild adult / Normal child', () => {
  assert.strictEqual(getSeverity(11, adult).level, 'Mild Anemia');
  assert.strictEqual(getSeverity(11, child).level, 'Normal');
});

test('child Hb 7 is Moderate, adult Hb 7 is Severe', () => {
  assert.strictEqual(getSeverity(7, child).level, 'Moderate Anemia');
  assert.strictEqual(getSeverity(7, adult).level, 'Severe Anemia');
});

test('child Hb 6.5 is Severe', () => {
  assert.strictEqual(getSeverity(6.5, child).level, 'Severe Anemia');
  assert.strictEqual(getSeverity(6.5, child).color, '#EF4444');
});

test('child Hb 13 is Normal', () => {
  assert.strictEqual(getSeverity(13, child).level, 'Normal');
});
