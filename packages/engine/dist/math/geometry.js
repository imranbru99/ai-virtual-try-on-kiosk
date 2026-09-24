"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distance2D = distance2D;
exports.distance3D = distance3D;
exports.midpoint2D = midpoint2D;
exports.angle2D = angle2D;
exports.radToDeg = radToDeg;
exports.degToRad = degToRad;
exports.calculateGarmentTransform = calculateGarmentTransform;
exports.calculateEyewearTransform = calculateEyewearTransform;
exports.computeLandmarksBoundingBox = computeLandmarksBoundingBox;
exports.computeBarycentric2D = computeBarycentric2D;
function distance2D(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function distance3D(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function midpoint2D(a, b) {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    };
}
function angle2D(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}
function radToDeg(radians) {
    return (radians * 180) / Math.PI;
}
function degToRad(degrees) {
    return (degrees * Math.PI) / 180;
}
/**
 * Calculates a smooth 2D affine transformation between reference anchor points
 * and detected subject landmarks.
 */
function calculateGarmentTransform(leftShoulder, rightShoulder, leftHip, rightHip, referenceWidthRatio = 1.25, verticalSlackRatio = 1.10) {
    const shoulderCenter = midpoint2D(leftShoulder, rightShoulder);
    const shoulderWidth = distance2D(leftShoulder, rightShoulder);
    const rotation = angle2D(leftShoulder, rightShoulder);
    // Compute torso length if hips are available; otherwise estimate from shoulder width
    let torsoHeight = shoulderWidth * 1.35;
    let hipCenter = null;
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
function calculateEyewearTransform(leftEye, rightEye, noseBridge, scaleMultiplier = 2.1) {
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
function computeLandmarksBoundingBox(landmarks, width, height) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const lm of landmarks) {
        const px = lm.x * width;
        const py = lm.y * height;
        if (px < minX)
            minX = px;
        if (py < minY)
            minY = py;
        if (px > maxX)
            maxX = px;
        if (py > maxY)
            maxY = py;
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
function computeBarycentric2D(p, a, b, c) {
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
//# sourceMappingURL=geometry.js.map