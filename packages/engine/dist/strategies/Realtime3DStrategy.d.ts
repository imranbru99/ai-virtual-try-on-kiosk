import { TryOnStrategy, TryOnStrategyType, EngineConfig, RenderContext, VisionDetectionResult, TryOnProduct, FitAdjustment } from '../types/index.js';
export declare class Realtime3DStrategy implements TryOnStrategy {
    readonly strategyType: TryOnStrategyType;
    private config;
    private isInitialized;
    initialize(config: EngineConfig): Promise<void>;
    render(context: RenderContext, detection: VisionDetectionResult, products: TryOnProduct[], adjustments: Map<string, FitAdjustment>): void;
    dispose(): void;
}
//# sourceMappingURL=Realtime3DStrategy.d.ts.map