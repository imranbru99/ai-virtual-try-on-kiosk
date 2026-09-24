import {
  RenderContext,
  VisionDetectionResult,
  BenchmarkMetrics,
  DebugOverlayOptions,
  Landmark
} from '../types/index.js';
import { computeLandmarksBoundingBox } from '../math/geometry.js';

export class DebugOverlay {
  private options: DebugOverlayOptions;

  constructor(options?: Partial<DebugOverlayOptions>) {
    this.options = {
      showLandmarks: false,
      showAnchors: false,
      showBoundingBoxes: false,
      showFps: true,
      showJitterGraph: false,
      ...options
    };
  }

  public updateOptions(options: DebugOverlayOptions): void {
    this.options = options;
  }

  public render(
    context: RenderContext,
    detection: VisionDetectionResult,
    metrics: BenchmarkMetrics
  ): void {
    const { ctx, width, height } = context;

    ctx.save();

    // 1. Draw Landmarks
    if (this.options.showLandmarks && detection.poseLandmarks) {
      this.drawLandmarkDots(ctx, detection.poseLandmarks, width, height, '#00ffcc');
    }
    if (this.options.showLandmarks && detection.faceLandmarks) {
      this.drawLandmarkDots(ctx, detection.faceLandmarks, width, height, '#ff007f');
    }

    // 2. Draw Skeleton / Anchors
    if (this.options.showAnchors && detection.poseLandmarks && detection.poseLandmarks.length >= 25) {
      this.drawPoseAnchors(ctx, detection.poseLandmarks, width, height);
    }

    // 3. Draw Bounding Box
    if (this.options.showBoundingBoxes && detection.poseLandmarks) {
      const box = computeLandmarksBoundingBox(detection.poseLandmarks, width, height);
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(box.minX, box.minY, box.width, box.height);
      ctx.setLineDash([]);
    }

    // 4. Draw HUD / Stats Pill
    if (this.options.showFps) {
      this.drawStatsHUD(ctx, metrics, detection.confidence);
    }

    ctx.restore();
  }

  private drawLandmarkDots(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    w: number,
    h: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    for (const lm of landmarks) {
      if ((lm.visibility ?? 1) < 0.25) continue;
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawPoseAnchors(
    ctx: CanvasRenderingContext2D,
    pose: Landmark[],
    w: number,
    h: number
  ): void {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;

    // Shoulders (11 to 12)
    ctx.beginPath();
    ctx.moveTo(pose[11].x * w, pose[11].y * h);
    ctx.lineTo(pose[12].x * w, pose[12].y * h);
    ctx.stroke();

    // Left Torso (11 to 23)
    ctx.beginPath();
    ctx.moveTo(pose[11].x * w, pose[11].y * h);
    ctx.lineTo(pose[23].x * w, pose[23].y * h);
    ctx.stroke();

    // Right Torso (12 to 24)
    ctx.beginPath();
    ctx.moveTo(pose[12].x * w, pose[12].y * h);
    ctx.lineTo(pose[24].x * w, pose[24].y * h);
    ctx.stroke();

    // Hips (23 to 24)
    ctx.beginPath();
    ctx.moveTo(pose[23].x * w, pose[23].y * h);
    ctx.lineTo(pose[24].x * w, pose[24].y * h);
    ctx.stroke();
  }

  private drawStatsHUD(
    ctx: CanvasRenderingContext2D,
    m: BenchmarkMetrics,
    confidence: number
  ): void {
    const pad = 12;
    const boxW = 190;
    const boxH = 96;
    const x = pad;
    const y = pad;

    // Background pill with luxury dark glass style
    ctx.fillStyle = 'rgba(15, 17, 23, 0.82)';
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Text stats
    ctx.font = '600 12px "Inter", -apple-system, sans-serif';
    ctx.fillStyle = m.fps >= 30 ? '#10b981' : '#f59e0b';
    ctx.fillText(`FPS: ${m.fps} (Target 60)`, x + 12, y + 24);

    ctx.font = '400 11px "Inter", -apple-system, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`Frame Time: ${m.frameTimeMs} ms`, x + 12, y + 42);
    ctx.fillText(`Render Latency: ${m.renderLatencyMs} ms`, x + 12, y + 58);
    ctx.fillText(`Jitter: ±${m.jitterVariance} ms | Conf: ${Math.round(confidence * 100)}%`, x + 12, y + 76);
  }
}
