import test from 'node:test';
import assert from 'node:assert/strict';
import { roadProfile, simulateQuarterCar, comfortGrade } from '../dynamics.js';

test('road profile includes a localized pothole event', () => {
  assert.ok(roadProfile(3.9, 0.02) < roadProfile(2, 0.02));
});
test('quarter-car simulation produces finite telemetry', () => {
  const result = simulateQuarterCar({ spring: 28, damping: 2.4, speed: 55, severity: 2 });
  assert.equal(result.samples.length, 701);
  assert.ok(Number.isFinite(result.rms) && result.maxTravel > 0);
});
test('comfort grading is monotonic', () => {
  assert.equal(comfortGrade(0.3), 'A');
  assert.equal(comfortGrade(1.5), 'D');
  assert.equal(comfortGrade(3), 'E');
});
test('more severe roads increase vibration response', () => {
  const mild = simulateQuarterCar({ spring: 28, damping: 2.4, speed: 55, severity: 1 });
  const severe = simulateQuarterCar({ spring: 28, damping: 2.4, speed: 55, severity: 5 });
  assert.ok(severe.rms > mild.rms);
});
