"use strict";
/**
 * 1€ Filter (One-Euro Filter)
 * Reference: Casiez, G., Roussel, N. and Vogel, F. (2012)
 * "1 € Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems"
 * ACM CHI 2012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandmarkOneEuroFilter = exports.OneEuroFilter = void 0;
class LowPassFilter {
    y = null;
    s = null;
    filter(value, alpha) {
        if (this.y === null) {
            this.s = value;
            this.y = value;
            return value;
        }
        this.s = alpha * value + (1.0 - alpha) * (this.s ?? value);
        this.y = this.s;
        return this.y;
    }
    hasLastRawValue() {
        return this.y !== null;
    }
    lastRawValue() {
        return this.y ?? 0;
    }
    reset() {
        this.y = null;
        this.s = null;
    }
}
class OneEuroFilter {
    minCutoff;
    beta;
    dCutoff;
    xFilter;
    dxFilter;
    lastTimestamp = null;
    constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
        this.xFilter = new LowPassFilter();
        this.dxFilter = new LowPassFilter();
    }
    computeAlpha(rate, cutoff) {
        const tau = 1.0 / (2.0 * Math.PI * cutoff);
        const te = 1.0 / rate;
        return 1.0 / (1.0 + tau / te);
    }
    filter(value, timestamp) {
        if (this.lastTimestamp === null || this.lastTimestamp === timestamp) {
            this.lastTimestamp = timestamp;
            return this.xFilter.filter(value, 1.0);
        }
        const dt = (timestamp - this.lastTimestamp) / 1000.0;
        this.lastTimestamp = timestamp;
        if (dt <= 0) {
            return this.xFilter.lastRawValue();
        }
        const rate = 1.0 / dt;
        // Estimate derivative
        const dx = (value - this.xFilter.lastRawValue()) * rate;
        const edx = this.dxFilter.filter(dx, this.computeAlpha(rate, this.dCutoff));
        // Dynamic cutoff based on speed
        const cutoff = this.minCutoff + this.beta * Math.abs(edx);
        return this.xFilter.filter(value, this.computeAlpha(rate, cutoff));
    }
    reset() {
        this.xFilter.reset();
        this.dxFilter.reset();
        this.lastTimestamp = null;
    }
}
exports.OneEuroFilter = OneEuroFilter;
class LandmarkOneEuroFilter {
    filters = new Map();
    minCutoff;
    beta;
    dCutoff;
    constructor(minCutoff = 1.2, beta = 0.005, dCutoff = 1.0) {
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
    }
    filterLandmarks(landmarks, timestampMs) {
        return landmarks.map((lm, index) => {
            let filterPair = this.filters.get(index);
            if (!filterPair) {
                filterPair = {
                    x: new OneEuroFilter(this.minCutoff, this.beta, this.dCutoff),
                    y: new OneEuroFilter(this.minCutoff, this.beta, this.dCutoff),
                    z: new OneEuroFilter(this.minCutoff, this.beta, this.dCutoff)
                };
                this.filters.set(index, filterPair);
            }
            return {
                x: filterPair.x.filter(lm.x, timestampMs),
                y: filterPair.y.filter(lm.y, timestampMs),
                z: filterPair.z.filter(lm.z, timestampMs),
                visibility: lm.visibility,
                presence: lm.presence
            };
        });
    }
    reset() {
        for (const pair of this.filters.values()) {
            pair.x.reset();
            pair.y.reset();
            pair.z.reset();
        }
        this.filters.clear();
    }
}
exports.LandmarkOneEuroFilter = LandmarkOneEuroFilter;
//# sourceMappingURL=OneEuroFilter.js.map