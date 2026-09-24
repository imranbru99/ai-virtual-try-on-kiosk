import {
  TryOnStrategy,
  TryOnStrategyType,
  EngineConfig,
  RenderContext,
  VisionDetectionResult,
  TryOnProduct,
  FitAdjustment,
  BenchmarkMetrics
} from './types/index.js';
import { Realtime2DWarpStrategy } from './strategies/Realtime2DWarpStrategy.js';
import { Realtime3DStrategy } from './strategies/Realtime3DStrategy.js';
import { GenerativeHDStrategy } from './strategies/GenerativeHDStrategy.js';
import { BenchmarkSuite } from './benchmark/BenchmarkSuite.js';
import { DebugOverlay } from './overlay/DebugOverlay.js';

export class TryOnEngine {
  private config: EngineConfig;
  private strategies: Map<TryOnStrategyType, TryOnStrategy> = new Map();
  private activeStrategyType: TryOnStrategyType = '2d_warp';
  private fitAdjustments: Map<string, FitAdjustment> = new Map();
  private activeProducts: TryOnProduct[] = [];
  private benchmark: BenchmarkSuite = new BenchmarkSuite();
  private debugOverlay: DebugOverlay;

  constructor(config?: Partial<EngineConfig>) {
    this.config = {
      targetFps: 60,
      enableSegmentation: true,
      enableOneEuroFilter: true,
      oneEuroParams: {
        minCutoff: 1.2,
        beta: 0.007,
        dCutoff: 1.0
      },
      debugOverlay: {
        showLandmarks: false,
        showAnchors: false,
        showBoundingBoxes: false,
        showFps: true,
        showJitterGraph: false
      },
      ...config
    };

    // Register standard strategies
    this.strategies.set('2d_warp', new Realtime2DWarpStrategy());
    this.strategies.set('3d_mesh', new Realtime3DStrategy());
    this.strategies.set('generative_hd', new GenerativeHDStrategy());

    this.debugOverlay = new DebugOverlay(this.config.debugOverlay);
  }

  public async initialize(): Promise<void> {
    for (const strategy of this.strategies.values()) {
      await strategy.initialize(this.config);
    }
  }

  public setStrategy(type: TryOnStrategyType): void {
    if (this.strategies.has(type)) {
      this.activeStrategyType = type;
    }
  }

  public getActiveStrategy(): TryOnStrategy {
    return this.strategies.get(this.activeStrategyType) || this.strategies.get('2d_warp')!;
  }

  public async setActiveProducts(products: TryOnProduct[]): Promise<void> {
    this.activeProducts = products;
    const warp2D = this.strategies.get('2d_warp') as Realtime2DWarpStrategy;
    if (warp2D) {
      await Promise.all(products.map(p => warp2D.preloadProductAsset(p)));
    }
  }

  public setAdjustment(productId: string, adjustment: Partial<FitAdjustment>): void {
    const current = this.fitAdjustments.get(productId) || {
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotationNudge: 0
    };
    this.fitAdjustments.set(productId, { ...current, ...adjustment });
  }

  public getAdjustment(productId: string): FitAdjustment {
    return this.fitAdjustments.get(productId) || {
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotationNudge: 0
    };
  }

  public resetAdjustments(productId?: string): void {
    if (productId) {
      this.fitAdjustments.delete(productId);
    } else {
      this.fitAdjustments.clear();
    }
  }

  /**
   * Main frame render call. Must be invoked within requestAnimationFrame or video frame callback.
   */
  public renderFrame(context: RenderContext, detection: VisionDetectionResult): void {
    const startTime = performance.now();

    // Clear overlay layer if separate
    const strategy = this.getActiveStrategy();
    strategy.render(context, detection, this.activeProducts, this.fitAdjustments);

    const renderTime = performance.now() - startTime;
    this.benchmark.recordFrame(renderTime, detection.timestampMs);

    // Render debug visualizer if enabled
    if (this.config.debugOverlay) {
      const metrics = this.benchmark.getMetrics();
      this.debugOverlay.render(context, detection, metrics);
    }
  }

  public getMetrics(): BenchmarkMetrics {
    return this.benchmark.getMetrics();
  }

  public updateDebugOptions(options: Partial<EngineConfig['debugOverlay']>): void {
    if (this.config.debugOverlay) {
      this.config.debugOverlay = { ...this.config.debugOverlay, ...options };
      this.debugOverlay.updateOptions(this.config.debugOverlay);
    }
  }

  public dispose(): void {
    for (const strategy of this.strategies.values()) {
      strategy.dispose();
    }
    this.strategies.clear();
    this.fitAdjustments.clear();
    this.activeProducts = [];
  }
}
