import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  distance2D,
  distance3D,
  midpoint2D,
  angle2D,
  calculateGarmentTransform,
  calculateEyewearTransform,
  computeBarycentric2D,
  computeLandmarksBoundingBox
} from '../dist/math/geometry.js';

describe('Geometry & Warping Math', () => {
  test('distance2D computes Euclidean distance correctly', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    assert.strictEqual(distance2D(p1, p2), 5);
  });

  test('distance3D computes 3D Euclidean distance correctly', () => {
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 2, y: 3, z: 6 };
    assert.strictEqual(distance3D(p1, p2), 7);
  });

  test('midpoint2D calculates average center point', () => {
    const p1 = { x: 10, y: 20 };
    const p2 = { x: 30, y: 40 };
    const mid = midpoint2D(p1, p2);
    assert.deepStrictEqual(mid, { x: 20, y: 30 });
  });

  test('calculateGarmentTransform derives scale, rotation, and translation', () => {
    const leftShoulder = { x: 100, y: 150 };
    const rightShoulder = { x: 200, y: 150 }; // Horizontal line: 100px wide
    const leftHip = { x: 105, y: 300 };
    const rightHip = { x: 195, y: 300 };

    const transform = calculateGarmentTransform(
      leftShoulder,
      rightShoulder,
      leftHip,
      rightHip,
      1.25,
      1.10
    );

    assert.strictEqual(transform.rotation, 0); // Horizontal shoulders
    assert.strictEqual(transform.translateX, 150); // Midpoint of shoulders
    assert.strictEqual(transform.translateY, 150);
    assert.strictEqual(transform.scaleX, 125); // 100 * 1.25
    assert.ok(transform.scaleY > 150);
  });

  test('calculateEyewearTransform correctly scales with IPD and rotation', () => {
    const leftEye = { x: 80, y: 100 };
    const rightEye = { x: 140, y: 100 }; // 60px eye distance
    const nose = { x: 110, y: 110 };

    const transform = calculateEyewearTransform(leftEye, rightEye, nose, 2.0);

    assert.strictEqual(transform.rotation, 0);
    assert.strictEqual(transform.scaleX, 120); // 60 * 2.0
    assert.strictEqual(transform.translateX, 110);
    assert.strictEqual(transform.translateY, 105);
  });

  test('computeLandmarksBoundingBox calculates tight bounding rect', () => {
    const landmarks = [
      { x: 0.2, y: 0.1, z: 0 },
      { x: 0.8, y: 0.9, z: 0 },
      { x: 0.5, y: 0.5, z: 0 }
    ];

    const box = computeLandmarksBoundingBox(landmarks, 1000, 1000);
    assert.strictEqual(box.minX, 200);
    assert.strictEqual(box.minY, 100);
    assert.strictEqual(box.maxX, 800);
    assert.strictEqual(box.maxY, 900);
    assert.strictEqual(box.width, 600);
    assert.strictEqual(box.height, 800);
  });

  test('computeBarycentric2D calculates valid barycentric weights', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    const c = { x: 0, y: 10 };
    const p = { x: 2, y: 2 };

    const [u, v, w] = computeBarycentric2D(p, a, b, c);
    assert.ok(Math.abs(u + v + w - 1.0) < 1e-5);
    assert.ok(u > 0 && v > 0 && w > 0);
  });
});
