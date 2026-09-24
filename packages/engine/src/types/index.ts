export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface Landmark extends Point3D {
  visibility?: number;
  presence?: number;
}

export type CategoryType = 
  | 'tops' 
  | 'outerwear' 
  | 'dresses' 
  | 'bottoms' 
  | 'traditional' 
  | 'eyewear' 
  | 'hats' 
  | 'jewelry' 
  | 'watches' 
  | 'footwear' 
  | 'cosmetics' 
  | 'hair_color';

export type TryOnStrategyType = '2d_warp' | '3d_mesh' | 'generative_hd' | 'cosmetics_blend';

export interface AnchorPointDefinition {
  landmarkId: number;
  uv: [number, number]; // [0..1, 0..1]
  virtual?: boolean; // Calculated e.g. midpoint
}

export interface CategoryAnchorMap {
  category: CategoryType;
  anchors: Record<string, AnchorPointDefinition>;
  referenceWidthRatio: number;
  verticalSlackRatio: number;
  occlusion?: {
    maskArms?: boolean;
    maskHair?: boolean;
    tuckMode?: 'tucked' | 'untucked';
  };
}

export interface FitAdjustment {
  scale: number;       // Default 1.0 (0.8 .. 1.2)
  offsetX: number;     // Normalized delta (-0.2 .. +0.2)
  offsetY: number;     // Normalized delta (-0.2 .. +0.2)
  rotationNudge: number; // Degrees (-15 .. +15)
  colorVariantHex?: string;
}

export interface TryOnProduct {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  cutoutUrl: string;
  model3dUrl?: string;
  anchorMap: CategoryAnchorMap;
  price: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  inStock?: boolean;
}

export interface VisionDetectionResult {
  poseLandmarks?: Landmark[];
  faceLandmarks?: Landmark[];
  segmentationMask?: ImageBitmap | ImageData | HTMLCanvasElement;
  confidence: number;
  timestampMs: number;
}

export interface BenchmarkMetrics {
  fps: number;
  frameTimeMs: number;
  visionLatencyMs: number;
  renderLatencyMs: number;
  jitterVariance: number;
  droppedFrames: number;
}

export interface DebugOverlayOptions {
  showLandmarks: boolean;
  showAnchors: boolean;
  showBoundingBoxes: boolean;
  showFps: boolean;
  showJitterGraph: boolean;
}

export interface EngineConfig {
  targetFps: number;
  enableSegmentation: boolean;
  enableOneEuroFilter: boolean;
  oneEuroParams?: {
    minCutoff: number;
    beta: number;
    dCutoff: number;
  };
  debugOverlay?: DebugOverlayOptions;
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gl?: WebGLRenderingContext | WebGL2RenderingContext;
  videoSource?: HTMLVideoElement;
  width: number;
  height: number;
  timestamp: number;
}

export interface TryOnStrategy {
  readonly strategyType: TryOnStrategyType;
  initialize(config: EngineConfig): Promise<void>;
  render(
    context: RenderContext,
    detection: VisionDetectionResult,
    products: TryOnProduct[],
    adjustments: Map<string, FitAdjustment>
  ): void;
  dispose(): void;
}
