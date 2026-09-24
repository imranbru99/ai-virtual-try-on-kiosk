import { RenderContext, VisionDetectionResult, BenchmarkMetrics, DebugOverlayOptions } from '../types/index.js';
export declare class DebugOverlay {
    private options;
    constructor(options?: Partial<DebugOverlayOptions>);
    updateOptions(options: DebugOverlayOptions): void;
    render(context: RenderContext, detection: VisionDetectionResult, metrics: BenchmarkMetrics): void;
    private drawLandmarkDots;
    private drawPoseAnchors;
    private drawStatsHUD;
}
//# sourceMappingURL=DebugOverlay.d.ts.map