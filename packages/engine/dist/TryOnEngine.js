"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryOnEngine = void 0;
const Realtime2DWarpStrategy_js_1 = require("./strategies/Realtime2DWarpStrategy.js");
const Realtime3DStrategy_js_1 = require("./strategies/Realtime3DStrategy.js");
const GenerativeHDStrategy_js_1 = require("./strategies/GenerativeHDStrategy.js");
const BenchmarkSuite_js_1 = require("./benchmark/BenchmarkSuite.js");
const DebugOverlay_js_1 = require("./overlay/DebugOverlay.js");
class TryOnEngine {
    config;
    strategies = new Map();
    activeStrategyType = '2d_warp';
    fitAdjustments = new Map();
    activeProducts = [];
    benchmark = new BenchmarkSuite_js_1.BenchmarkSuite();
    debugOverlay;
    constructor(config) {
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
        this.strategies.set('2d_warp', new Realtime2DWarpStrategy_js_1.Realtime2DWarpStrategy());
        this.strategies.set('3d_mesh', new Realtime3DStrategy_js_1.Realtime3DStrategy());
        this.strategies.set('generative_hd', new GenerativeHDStrategy_js_1.GenerativeHDStrategy());
        this.debugOverlay = new DebugOverlay_js_1.DebugOverlay(this.config.debugOverlay);
    }
    async initialize() {
        for (const strategy of this.strategies.values()) {
            await strategy.initialize(this.config);
        }
    }
    setStrategy(type) {
        if (this.strategies.has(type)) {
            this.activeStrategyType = type;
        }
    }
    getActiveStrategy() {
        return this.strategies.get(this.activeStrategyType) || this.strategies.get('2d_warp');
    }
    async setActiveProducts(products) {
        this.activeProducts = products;
        const warp2D = this.strategies.get('2d_warp');
        if (warp2D) {
            await Promise.all(products.map(p => warp2D.preloadProductAsset(p)));
        }
    }
    setAdjustment(productId, adjustment) {
        const current = this.fitAdjustments.get(productId) || {
            scale: 1.0,
            offsetX: 0,
            offsetY: 0,
            rotationNudge: 0
        };
        this.fitAdjustments.set(productId, { ...current, ...adjustment });
    }
    getAdjustment(productId) {
        return this.fitAdjustments.get(productId) || {
            scale: 1.0,
            offsetX: 0,
            offsetY: 0,
            rotationNudge: 0
        };
    }
    resetAdjustments(productId) {
        if (productId) {
            this.fitAdjustments.delete(productId);
        }
        else {
            this.fitAdjustments.clear();
        }
    }
    /**
     * Main frame render call. Must be invoked within requestAnimationFrame or video frame callback.
     */
    renderFrame(context, detection) {
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
    getMetrics() {
        return this.benchmark.getMetrics();
    }
    updateDebugOptions(options) {
        if (this.config.debugOverlay) {
            this.config.debugOverlay = { ...this.config.debugOverlay, ...options };
            this.debugOverlay.updateOptions(this.config.debugOverlay);
        }
    }
    dispose() {
        for (const strategy of this.strategies.values()) {
            strategy.dispose();
        }
        this.strategies.clear();
        this.fitAdjustments.clear();
        this.activeProducts = [];
    }
}
exports.TryOnEngine = TryOnEngine;
//# sourceMappingURL=TryOnEngine.js.map