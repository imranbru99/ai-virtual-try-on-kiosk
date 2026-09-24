import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AssetPipeline } from '../dist/pipeline/AssetPipeline.js';

describe('AssetPipeline', () => {
  test('detects eyewear assets from keywords and aspect ratio', () => {
    const analysis = AssetPipeline.analyzeAsset('aviator_sunglasses.png', 800, 350);
    assert.strictEqual(analysis.suggestedCategory, 'eyewear');
    assert.ok(analysis.confidence >= 0.9);
    assert.strictEqual(analysis.anchorMap.category, 'eyewear');
    assert.ok(analysis.anchorMap.anchors.left_eye);
    assert.ok(analysis.anchorMap.anchors.right_eye);
  });

  test('detects outerwear assets from blazer keyword', () => {
    const analysis = AssetPipeline.analyzeAsset('noir_silk_blazer.png', 1000, 1200);
    assert.strictEqual(analysis.suggestedCategory, 'outerwear');
    assert.strictEqual(analysis.anchorMap.category, 'outerwear');
    assert.ok(analysis.anchorMap.anchors.left_shoulder);
    assert.ok(analysis.anchorMap.anchors.right_shoulder);
  });

  test('detects dresses and suggests vertical slack ratio', () => {
    const analysis = AssetPipeline.analyzeAsset('summer_floral_dress.png', 600, 1200);
    assert.strictEqual(analysis.suggestedCategory, 'dresses');
    assert.ok(analysis.anchorMap.verticalSlackRatio >= 1.5);
  });
});
