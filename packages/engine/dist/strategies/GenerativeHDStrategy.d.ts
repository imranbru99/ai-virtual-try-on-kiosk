import { TryOnStrategy, TryOnStrategyType, EngineConfig, RenderContext, VisionDetectionResult, TryOnProduct, FitAdjustment } from '../types/index.js';
export interface HDJobSubmission {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progressPercent: number;
    resultUrl?: string;
    error?: string;
}
export declare class GenerativeHDStrategy implements TryOnStrategy {
    readonly strategyType: TryOnStrategyType;
    private config;
    private activeJobs;
    initialize(config: EngineConfig): Promise<void>;
    render(context: RenderContext, detection: VisionDetectionResult, products: TryOnProduct[], adjustments: Map<string, FitAdjustment>): void;
    trackJob(job: HDJobSubmission): void;
    getJob(jobId: string): HDJobSubmission | undefined;
    dispose(): void;
}
//# sourceMappingURL=GenerativeHDStrategy.d.ts.map