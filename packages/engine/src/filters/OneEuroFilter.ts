/**
 * 1€ Filter (One-Euro Filter)
 * Reference: Casiez, G., Roussel, N. and Vogel, F. (2012)
 * "1 € Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems"
 * ACM CHI 2012.
 */

import { Landmark, Point2D, Point3D } from '../types/index.js';

class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.y === null) {
      this.s = value;
      this.y = value;
      return value;
    }
    this.s = alpha * value + (1.0 - alpha) * (this.s ?? value);
    this.y = this.s;
    return this.y;
  }

  hasLastRawValue(): boolean {
    return this.y !== null;
  }

  lastRawValue(): number {
    return this.y ?? 0;
  }

  reset(): void {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTimestamp: number | null = null;

  constructor(minCutoff: number = 1.0, beta: number = 0.007, dCutoff: number = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  private computeAlpha(rate: number, cutoff: number): number {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }

  filter(value: number, timestamp: number): number {
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

  reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTimestamp = null;
  }
}

export class LandmarkOneEuroFilter {
  private filters: Map<number, { x: OneEuroFilter; y: OneEuroFilter; z: OneEuroFilter }> = new Map();
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;

  constructor(minCutoff: number = 1.2, beta: number = 0.005, dCutoff: number = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  filterLandmarks(landmarks: Landmark[], timestampMs: number): Landmark[] {
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

  reset(): void {
    for (const pair of this.filters.values()) {
      pair.x.reset();
      pair.y.reset();
      pair.z.reset();
    }
    this.filters.clear();
  }
}
