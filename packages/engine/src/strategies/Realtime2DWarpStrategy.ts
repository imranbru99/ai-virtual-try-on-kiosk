import {
  TryOnStrategy,
  TryOnStrategyType,
  EngineConfig,
  RenderContext,
  VisionDetectionResult,
  TryOnProduct,
  FitAdjustment,
  Landmark,
  Point2D
} from '../types/index.js';
import {
  calculateGarmentTransform,
  calculateEyewearTransform,
  degToRad
} from '../math/geometry.js';
import { LandmarkOneEuroFilter } from '../filters/OneEuroFilter.js';

export class Realtime2DWarpStrategy implements TryOnStrategy {
  readonly strategyType: TryOnStrategyType = '2d_warp';
  private config: EngineConfig | null = null;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private poseFilter: LandmarkOneEuroFilter = new LandmarkOneEuroFilter(1.2, 0.007, 1.0);
  private faceFilter: LandmarkOneEuroFilter = new LandmarkOneEuroFilter(1.5, 0.009, 1.0);
  private tintCanvas: HTMLCanvasElement | null = null;
  private tintCtx: CanvasRenderingContext2D | null = null;

  async initialize(config: EngineConfig): Promise<void> {
    this.config = config;
    if (config.oneEuroParams) {
      this.poseFilter = new LandmarkOneEuroFilter(
        config.oneEuroParams.minCutoff,
        config.oneEuroParams.beta,
        config.oneEuroParams.dCutoff
      );
      this.faceFilter = new LandmarkOneEuroFilter(
        config.oneEuroParams.minCutoff * 1.25,
        config.oneEuroParams.beta * 1.2,
        config.oneEuroParams.dCutoff
      );
    }
  }

  /**
   * Preloads garment/accessory cutouts into memory to ensure sub-100ms instant switching.
   */
  public async preloadProductAsset(product: TryOnProduct): Promise<void> {
    if (this.imageCache.has(product.cutoutUrl)) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(product.cutoutUrl, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`[2DWarp] Failed to load image cutout: ${product.cutoutUrl}`);
        resolve(); // Graceful degradation
      };
      img.src = product.cutoutUrl;
    });
  }

  public render(
    context: RenderContext,
    detection: VisionDetectionResult,
    products: TryOnProduct[],
    adjustments: Map<string, FitAdjustment>
  ): void {
    const { ctx, width, height } = context;

    let filteredPose: Landmark[] | undefined = detection.poseLandmarks;
    let filteredFace: Landmark[] | undefined = detection.faceLandmarks;

    if (this.config?.enableOneEuroFilter) {
      if (filteredPose && filteredPose.length > 0) {
        filteredPose = this.poseFilter.filterLandmarks(filteredPose, detection.timestampMs);
      }
      if (filteredFace && filteredFace.length > 0) {
        filteredFace = this.faceFilter.filterLandmarks(filteredFace, detection.timestampMs);
      }
    }

    // Render layers: bottoms -> tops -> outerwear -> jewelry -> eyewear -> hats
    const sortedProducts = this.sortProductsByZIndex(products);

    for (const product of sortedProducts) {
      const adjustment = adjustments.get(product.id) || {
        scale: 1.0,
        offsetX: 0,
        offsetY: 0,
        rotationNudge: 0
      };

      if (['tops', 'outerwear', 'dresses', 'traditional'].includes(product.category)) {
        if (filteredPose && filteredPose.length >= 25) {
          this.renderGarmentLayer(context, filteredPose, product, adjustment, detection.segmentationMask);
        }
      } else if (product.category === 'eyewear') {
        if (filteredFace && filteredFace.length >= 468) {
          this.renderEyewearLayer(context, filteredFace, product, adjustment);
        } else if (filteredPose && filteredPose.length >= 10) {
          // Fallback to pose eye landmarks if detailed face landmarks are absent
          this.renderEyewearFromPose(context, filteredPose, product, adjustment);
        }
      }
    }
  }

  private sortProductsByZIndex(products: TryOnProduct[]): TryOnProduct[] {
    const order: Record<string, number> = {
      bottoms: 1,
      dresses: 2,
      tops: 3,
      outerwear: 4,
      jewelry: 5,
      eyewear: 6,
      hats: 7
    };
    return [...products].sort((a, b) => (order[a.category] || 3) - (order[b.category] || 3));
  }

  private renderGarmentLayer(
    context: RenderContext,
    pose: Landmark[],
    product: TryOnProduct,
    adj: FitAdjustment,
    segmentationMask?: ImageBitmap | ImageData | HTMLCanvasElement
  ): void {
    const { ctx, width, height } = context;

    // MediaPipe Pose Landmark Indices:
    // 11 = Left Shoulder, 12 = Right Shoulder
    // 23 = Left Hip, 24 = Right Hip
    const leftShoulder: Point2D = { x: pose[11].x * width, y: pose[11].y * height };
    const rightShoulder: Point2D = { x: pose[12].x * width, y: pose[12].y * height };
    const leftHip: Point2D = { x: pose[23].x * width, y: pose[23].y * height };
    const rightHip: Point2D = { x: pose[24].x * width, y: pose[24].y * height };

    // Visibility confidence check
    if ((pose[11].visibility ?? 1) < 0.4 || (pose[12].visibility ?? 1) < 0.4) {
      return;
    }

    const transform = calculateGarmentTransform(
      leftShoulder,
      rightShoulder,
      leftHip,
      rightHip,
      product.anchorMap.referenceWidthRatio,
      product.anchorMap.verticalSlackRatio
    );

    const img = this.imageCache.get(product.cutoutUrl);
    if (!img || !img.complete) return;

    ctx.save();

    // Center translation + user nudges
    const centerX = transform.translateX + adj.offsetX * width;
    const centerY = transform.translateY + (adj.offsetY * height) + (transform.scaleY * 0.35); // Shift origin down to chest center
    const totalRotation = transform.rotation + degToRad(adj.rotationNudge);

    ctx.translate(centerX, centerY);
    ctx.rotate(totalRotation);

    const renderW = transform.scaleX * adj.scale;
    const renderH = transform.scaleY * adj.scale;

    // Optional color variant tinting
    let sourceImage: CanvasImageSource = img;
    if (adj.colorVariantHex) {
      sourceImage = this.applyColorTint(img, adj.colorVariantHex);
    }

    // Draw centered on transform anchor
    ctx.drawImage(sourceImage, -renderW / 2, -renderH / 2, renderW, renderH);

    ctx.restore();
  }

  private renderEyewearLayer(
    context: RenderContext,
    face: Landmark[],
    product: TryOnProduct,
    adj: FitAdjustment
  ): void {
    const { ctx, width, height } = context;

    // MediaPipe Face Landmarks:
    // 33: Left eye outer corner, 263: Right eye outer corner, 168: Nose bridge / midpoint
    const leftEye: Point2D = { x: face[33].x * width, y: face[33].y * height };
    const rightEye: Point2D = { x: face[263].x * width, y: face[263].y * height };
    const noseBridge: Point2D = { x: face[168].x * width, y: face[168].y * height };

    const transform = calculateEyewearTransform(
      leftEye,
      rightEye,
      noseBridge,
      product.anchorMap.referenceWidthRatio || 2.1
    );

    const img = this.imageCache.get(product.cutoutUrl);
    if (!img || !img.complete) return;

    ctx.save();

    const centerX = transform.translateX + adj.offsetX * width;
    const centerY = transform.translateY + adj.offsetY * height;
    const totalRotation = transform.rotation + degToRad(adj.rotationNudge);

    ctx.translate(centerX, centerY);
    ctx.rotate(totalRotation);

    const renderW = transform.scaleX * adj.scale;
    const renderH = (transform.scaleY || renderW * 0.42) * adj.scale;

    let sourceImage: CanvasImageSource = img;
    if (adj.colorVariantHex) {
      sourceImage = this.applyColorTint(img, adj.colorVariantHex);
    }

    ctx.drawImage(sourceImage, -renderW / 2, -renderH / 2, renderW, renderH);

    ctx.restore();
  }

  private renderEyewearFromPose(
    context: RenderContext,
    pose: Landmark[],
    product: TryOnProduct,
    adj: FitAdjustment
  ): void {
    const { ctx, width, height } = context;

    // Pose 2 = left eye, Pose 5 = right eye, Pose 0 = nose
    const leftEye: Point2D = { x: pose[2].x * width, y: pose[2].y * height };
    const rightEye: Point2D = { x: pose[5].x * width, y: pose[5].y * height };
    const nose: Point2D = { x: pose[0].x * width, y: pose[0].y * height };

    const transform = calculateEyewearTransform(leftEye, rightEye, nose, 2.3);
    const img = this.imageCache.get(product.cutoutUrl);
    if (!img || !img.complete) return;

    ctx.save();
    ctx.translate(transform.translateX, transform.translateY);
    ctx.rotate(transform.rotation);
    const renderW = transform.scaleX * adj.scale;
    const renderH = renderW * 0.45;
    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();
  }

  private applyColorTint(image: HTMLImageElement, colorHex: string): HTMLCanvasElement {
    if (!this.tintCanvas) {
      this.tintCanvas = document.createElement('canvas');
      this.tintCtx = this.tintCanvas.getContext('2d');
    }
    if (!this.tintCtx) return this.tintCanvas;

    this.tintCanvas.width = image.width;
    this.tintCanvas.height = image.height;

    // Draw base image
    this.tintCtx.clearRect(0, 0, image.width, image.height);
    this.tintCtx.drawImage(image, 0, 0);

    // Multiply/tint blend
    this.tintCtx.globalCompositeOperation = 'source-atop';
    this.tintCtx.fillStyle = colorHex;
    this.tintCtx.globalAlpha = 0.45;
    this.tintCtx.fillRect(0, 0, image.width, image.height);

    // Reset composite operation
    this.tintCtx.globalCompositeOperation = 'source-over';
    this.tintCtx.globalAlpha = 1.0;

    return this.tintCanvas;
  }

  public dispose(): void {
    this.imageCache.clear();
    this.poseFilter.reset();
    this.faceFilter.reset();
    this.tintCanvas = null;
    this.tintCtx = null;
  }
}
