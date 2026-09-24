/**
 * 1€ Filter (One-Euro Filter)
 * Reference: Casiez, G., Roussel, N. and Vogel, F. (2012)
 * "1 € Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems"
 * ACM CHI 2012.
 */
import { Landmark } from '../types/index.js';
export declare class OneEuroFilter {
    private minCutoff;
    private beta;
    private dCutoff;
    private xFilter;
    private dxFilter;
    private lastTimestamp;
    constructor(minCutoff?: number, beta?: number, dCutoff?: number);
    private computeAlpha;
    filter(value: number, timestamp: number): number;
    reset(): void;
}
export declare class LandmarkOneEuroFilter {
    private filters;
    private minCutoff;
    private beta;
    private dCutoff;
    constructor(minCutoff?: number, beta?: number, dCutoff?: number);
    filterLandmarks(landmarks: Landmark[], timestampMs: number): Landmark[];
    reset(): void;
}
//# sourceMappingURL=OneEuroFilter.d.ts.map