import { Point2D, Point3D, Landmark } from '../types/index.js';
export declare function distance2D(a: Point2D, b: Point2D): number;
export declare function distance3D(a: Point3D, b: Point3D): number;
export declare function midpoint2D(a: Point2D, b: Point2D): Point2D;
export declare function angle2D(a: Point2D, b: Point2D): number;
export declare function radToDeg(radians: number): number;
export declare function degToRad(degrees: number): number;
export interface AffineTransform2D {
    scaleX: number;
    scaleY: number;
    rotation: number;
    translateX: number;
    translateY: number;
}
/**
 * Calculates a smooth 2D affine transformation between reference anchor points
 * and detected subject landmarks.
 */
export declare function calculateGarmentTransform(leftShoulder: Point2D, rightShoulder: Point2D, leftHip?: Point2D, rightHip?: Point2D, referenceWidthRatio?: number, verticalSlackRatio?: number): AffineTransform2D;
/**
 * Computes eyewear alignment based on eye centers or temple landmarks.
 */
export declare function calculateEyewearTransform(leftEye: Point2D, rightEye: Point2D, noseBridge?: Point2D, scaleMultiplier?: number): AffineTransform2D;
export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}
export declare function computeLandmarksBoundingBox(landmarks: Landmark[], width: number, height: number): BoundingBox;
/**
 * Computes barycentric coordinates (u, v, w) of point P with respect to triangle (A, B, C).
 */
export declare function computeBarycentric2D(p: Point2D, a: Point2D, b: Point2D, c: Point2D): [number, number, number];
//# sourceMappingURL=geometry.d.ts.map