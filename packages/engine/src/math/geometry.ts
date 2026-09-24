import { Point2D, Point3D, Landmark } from '../types/index.js';

export function distance2D(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distance3D(a: Point3D, b: Point3D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function midpoint2D(a: Point2D, b: Point2D): Point2D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}

export function angle2D(a: Point2D, b: Point2D): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface AffineTransform2D {
  scaleX: number;
  scaleY: number;
  rotation: number; // Radians
  translateX: number;
  translateY: number;
}

/**
 * Calculates a smooth 2D affine transformation between reference anchor points
 * and detected subject landmarks.
 */
export function calculateGarmentTransform(
  leftShoulder: Point2D,
  rightShoulder: Point2D,
  leftHip?: Point2D,
  rightHip?: Point2D,
  referenceWidthRatio: number = 1.25,
  verticalSlackRatio: number = 1.10
): AffineTransform2D {
  const shoulderCenter = midpoint2D(leftShoulder, rightShoulder);
  const shoulderWidth = distance2D(leftShoulder, rightShoulder);
  const rotation = angle2D(leftShoulder, rightShoulder);

  // Compute torso length if hips are available; otherwise estimate from shoulder width
  let torsoHeight = shoulderWidth * 1.35;
  let hipCenter: Point2D | null = null;
  if (leftHip && rightHip) {
    hipCenter = midpoint2D(leftHip, rightHip);
    torsoHeight = distance2D(shoulderCenter, hipCenter);
  }

  const scaleX = shoulderWidth * referenceWidthRatio;
  const scaleY = torsoHeight * verticalSlackRatio;

  return {
    scaleX,
    scaleY,
    rotation,
    translateX: shoulderCenter.x,
    translateY: shoulderCenter.y
  };
}

/**
 * Computes eyewear alignment based on eye centers or temple landmarks.
 */
export function calculateEyewearTransform(
  leftEye: Point2D,
  rightEye: Point2D,
  noseBridge?: Point2D,
  scaleMultiplier: number = 2.1
): AffineTransform2D {
  const eyeCenter = midpoint2D(leftEye, rightEye);
  const eyeDistance = distance2D(leftEye, rightEye);
  const rotation = angle2D(leftEye, rightEye);

  // Target width matches IPD * multiplier for frame temple width
  const scaleX = eyeDistance * scaleMultiplier;
  const scaleY = scaleX * 0.45; // Standard aspect ratio for eyewear frames

  return {
    scaleX,
    scaleY,
    rotation,
    translateX: noseBridge ? (eyeCenter.x + noseBridge.x) / 2 : eyeCenter.x,
    translateY: noseBridge ? (eyeCenter.y + noseBridge.y) / 2 : eyeCenter.y
  };
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function computeLandmarksBoundingBox(landmarks: Landmark[], width: number, height: number): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const lm of landmarks) {
    const px = lm.x * width;
    const py = lm.y * height;
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  };
}

/**
 * Computes barycentric coordinates (u, v, w) of point P with respect to triangle (A, B, C).
 */
export function computeBarycentric2D(p: Point2D, a: Point2D, b: Point2D, c: Point2D): [number, number, number] {
  const v0 = { x: b.x - a.x, y: b.y - a.y };
  const v1 = { x: c.x - a.x, y: c.y - a.y };
  const v2 = { x: p.x - a.x, y: p.y - a.y };

  const d00 = v0.x * v0.x + v0.y * v0.y;
  const d01 = v0.x * v1.x + v0.y * v1.y;
  const d11 = v1.x * v1.x + v1.y * v1.y;
  const d20 = v2.x * v0.x + v2.y * v0.y;
  const d21 = v2.x * v1.x + v2.y * v1.y;

  const denom = d00 * d11 - d01 * d01;
  if (Math.abs(denom) < 1e-6) {
    return [1 / 3, 1 / 3, 1 / 3];
  }

  const v = (d11 * d20 - d01 * d21) / denom;
  const w = (d00 * d21 - d01 * d20) / denom;
  const u = 1.0 - v - w;

  return [u, v, w];
}
