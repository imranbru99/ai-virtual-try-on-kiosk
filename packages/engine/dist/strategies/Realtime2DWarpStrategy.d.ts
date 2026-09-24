import { TryOnStrategy, TryOnStrategyType, EngineConfig, RenderContext, VisionDetectionResult, TryOnProduct, FitAdjustment } from '../types/index.js';
export declare class Realtime2DWarpStrategy implements TryOnStrategy {
    readonly strategyType: TryOnStrategyType;
    private config;
    private imageCache;
    private poseFilter;
    private faceFilter;
    private tintCanvas;
    private tintCtx;
    initialize(config: EngineConfig): Promise<void>;
    /**
     * Preloads garment/accessory cutouts into memory to ensure sub-100ms instant switching.
     */
    preloadProductAsset(product: TryOnProduct): Promise<void>;
    render(context: RenderContext, detection: VisionDetectionResult, products: TryOnProduct[], adjustments: Map<string, FitAdjustment>): void;
    private sortProductsByZIndex;
    private renderGarmentLayer;
    private renderEyewearLayer;
    private renderEyewearFromPose;
    private applyColorTint;
    dispose(): void;
}
//# sourceMappingURL=Realtime2DWarpStrategy.d.ts.map