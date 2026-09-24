import { BenchmarkMetrics } from '../types/index.js';
export declare class BenchmarkSuite {
    private frameTimes;
    private renderLatencies;
    private lastTimestamp;
    private droppedFrames;
    private readonly maxSamples;
    recordFrame(renderLatencyMs: number, visionTimestampMs: number): void;
    getMetrics(): BenchmarkMetrics;
    reset(): void;
}
//# sourceMappingURL=BenchmarkSuite.d.ts.map