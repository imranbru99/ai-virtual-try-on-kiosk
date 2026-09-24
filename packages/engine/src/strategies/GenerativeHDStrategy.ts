import {
  TryOnStrategy,
  TryOnStrategyType,
  EngineConfig,
  RenderContext,
  VisionDetectionResult,
  TryOnProduct,
  FitAdjustment
} from '../types/index.js';

export interface HDJobSubmission {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progressPercent: number;
  resultUrl?: string;
  error?: string;
}

export class GenerativeHDStrategy implements TryOnStrategy {
  readonly strategyType: TryOnStrategyType = 'generative_hd';
  private config: EngineConfig | null = null;
  private activeJobs: Map<string, HDJobSubmission> = new Map();

  async initialize(config: EngineConfig): Promise<void> {
    this.config = config;
  }

  public render(
    context: RenderContext,
    detection: VisionDetectionResult,
    products: TryOnProduct[],
    adjustments: Map<string, FitAdjustment>
  ): void {
    // Generative HD runs as an asynchronous offline render pass.
    // Realtime display renders the preview while overlaying the HD progress indicator if an active render job is processing.
  }

  public trackJob(job: HDJobSubmission): void {
    this.activeJobs.set(job.jobId, job);
  }

  public getJob(jobId: string): HDJobSubmission | undefined {
    return this.activeJobs.get(jobId);
  }

  public dispose(): void {
    this.activeJobs.clear();
  }
}
