import { TryOnStrategy, TryOnStrategyType, EngineConfig, RenderContext, VisionDetectionResult, TryOnProduct, FitAdjustment, BenchmarkMetrics } from './types/index.js';
export declare class TryOnEngine {
    private config;
    private strategies;
    private activeStrategyType;
    private fitAdjustments;
    private activeProducts;
    private benchmark;
    private debugOverlay;
    constructor(config?: Partial<EngineConfig>);
    initialize(): Promise<void>;
    setStrategy(type: TryOnStrategyType): void;
    getActiveStrategy(): TryOnStrategy;
    setActiveProducts(products: TryOnProduct[]): Promise<void>;
    setAdjustment(productId: string, adjustment: Partial<FitAdjustment>): void;
    getAdjustment(productId: string): FitAdjustment;
    resetAdjustments(productId?: string): void;
    /**
     * Main frame render call. Must be invoked within requestAnimationFrame or video frame callback.
     */
    renderFrame(context: RenderContext, detection: VisionDetectionResult): void;
    getMetrics(): BenchmarkMetrics;
    updateDebugOptions(options: Partial<EngineConfig['debugOverlay']>): void;
    dispose(): void;
}
//# sourceMappingURL=TryOnEngine.d.ts.map