import { test, describe } from 'node:test';
import assert from 'node:assert';
import { OneEuroFilter, LandmarkOneEuroFilter } from '../dist/filters/OneEuroFilter.js';

describe('OneEuroFilter', () => {
  test('should return initial raw value on first sample', () => {
    const filter = new OneEuroFilter(1.0, 0.007);
    const result = filter.filter(10.0, 1000);
    assert.strictEqual(result, 10.0);
  });

  test('should smooth noisy steady-state signals without drifting', () => {
    const filter = new OneEuroFilter(1.0, 0.001);
    let t = 1000;
    filter.filter(100.0, t);

    // Apply 5 frames of high-frequency noise around 100
    const noisySamples = [102.5, 97.8, 103.1, 98.2, 101.4];
    let filteredValue = 100.0;
    for (const val of noisySamples) {
      t += 16.6; // 60 FPS interval
      filteredValue = filter.filter(val, t);
    }

    // Filtered value should stay close to 100 without extreme jumps
    assert.ok(Math.abs(filteredValue - 100.0) < 2.0, `Expected close to 100, got ${filteredValue}`);
  });

  test('should rapidly track high-speed movements without excessive lag', () => {
    const filter = new OneEuroFilter(1.0, 0.05); // High beta adapts to velocity
    filter.filter(10.0, 1000);
    
    // Jump rapidly from 10 to 200 over 3 frames
    const step1 = filter.filter(70.0, 1016);
    const step2 = filter.filter(140.0, 1033);
    const step3 = filter.filter(200.0, 1050);

    assert.ok(step3 > 175.0, `Expected step3 to quickly reach near 200, got ${step3}`);
  });

  test('LandmarkOneEuroFilter should filter arrays of 3D landmarks', () => {
    const filter = new LandmarkOneEuroFilter(1.0, 0.005);
    const landmarks = [
      { x: 0.5, y: 0.3, z: 0.1, visibility: 0.99 },
      { x: 0.6, y: 0.4, z: 0.2, visibility: 0.95 }
    ];

    const out1 = filter.filterLandmarks(landmarks, 1000);
    assert.strictEqual(out1.length, 2);
    assert.strictEqual(out1[0].x, 0.5);

    const noisy = [
      { x: 0.52, y: 0.31, z: 0.11, visibility: 0.99 },
      { x: 0.59, y: 0.39, z: 0.21, visibility: 0.95 }
    ];
    const out2 = filter.filterLandmarks(noisy, 1016);
    assert.ok(out2[0].x > 0.5 && out2[0].x < 0.52);
  });
});
