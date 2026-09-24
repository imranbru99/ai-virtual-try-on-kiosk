import { CategoryType, CategoryAnchorMap } from '../types/index.js';

export interface AssetAnalysisResult {
  suggestedCategory: CategoryType;
  confidence: number;
  anchorMap: CategoryAnchorMap;
  aspectRatio: number;
  suggestedTags: string[];
}

export class AssetPipeline {
  /**
   * Suggests category and default anchor mappings based on asset dimensions and keywords.
   */
  public static analyzeAsset(
    filename: string,
    width: number,
    height: number
  ): AssetAnalysisResult {
    const lowerName = filename.toLowerCase();
    const aspectRatio = width / Math.max(1, height);

    let category: CategoryType = 'tops';
    let confidence = 0.85;
    let tags: string[] = [];

    if (
      lowerName.includes('glass') ||
      lowerName.includes('spectacle') ||
      lowerName.includes('shades') ||
      aspectRatio > 1.8
    ) {
      category = 'eyewear';
      confidence = 0.92;
      tags = ['eyewear', 'accessories', 'unisex'];
    } else if (
      lowerName.includes('dress') ||
      lowerName.includes('gown') ||
      aspectRatio < 0.65
    ) {
      category = 'dresses';
      confidence = 0.88;
      tags = ['dress', 'women', 'formal'];
    } else if (
      lowerName.includes('jacket') ||
      lowerName.includes('blazer') ||
      lowerName.includes('coat')
    ) {
      category = 'outerwear';
      confidence = 0.90;
      tags = ['outerwear', 'jacket', 'winter'];
    } else if (
      lowerName.includes('pant') ||
      lowerName.includes('trouser') ||
      lowerName.includes('jeans')
    ) {
      category = 'bottoms';
      confidence = 0.89;
      tags = ['bottoms', 'pants'];
    } else {
      tags = ['tops', 'casual'];
    }

    const anchorMap = this.generateDefaultAnchorMap(category);

    return {
      suggestedCategory: category,
      confidence,
      anchorMap,
      aspectRatio,
      suggestedTags: tags
    };
  }

  public static generateDefaultAnchorMap(category: CategoryType): CategoryAnchorMap {
    switch (category) {
      case 'eyewear':
        return {
          category: 'eyewear',
          anchors: {
            left_eye: { landmarkId: 33, uv: [0.25, 0.5] },
            right_eye: { landmarkId: 263, uv: [0.75, 0.5] },
            nose_bridge: { landmarkId: 168, uv: [0.5, 0.5] }
          },
          referenceWidthRatio: 2.15,
          verticalSlackRatio: 1.0
        };

      case 'outerwear':
        return {
          category: 'outerwear',
          anchors: {
            left_shoulder: { landmarkId: 11, uv: [0.18, 0.16] },
            right_shoulder: { landmarkId: 12, uv: [0.82, 0.16] },
            left_hip: { landmarkId: 23, uv: [0.22, 0.88] },
            right_hip: { landmarkId: 24, uv: [0.78, 0.88] }
          },
          referenceWidthRatio: 1.35,
          verticalSlackRatio: 1.15,
          occlusion: {
            maskArms: true,
            tuckMode: 'untucked'
          }
        };

      case 'dresses':
        return {
          category: 'dresses',
          anchors: {
            left_shoulder: { landmarkId: 11, uv: [0.24, 0.12] },
            right_shoulder: { landmarkId: 12, uv: [0.76, 0.12] },
            left_hip: { landmarkId: 23, uv: [0.30, 0.55] },
            right_hip: { landmarkId: 24, uv: [0.70, 0.55] }
          },
          referenceWidthRatio: 1.25,
          verticalSlackRatio: 1.70
        };

      case 'tops':
      default:
        return {
          category: 'tops',
          anchors: {
            left_shoulder: { landmarkId: 11, uv: [0.20, 0.18] },
            right_shoulder: { landmarkId: 12, uv: [0.80, 0.18] },
            left_hip: { landmarkId: 23, uv: [0.25, 0.85] },
            right_hip: { landmarkId: 24, uv: [0.75, 0.85] }
          },
          referenceWidthRatio: 1.28,
          verticalSlackRatio: 1.10,
          occlusion: {
            maskArms: true,
            maskHair: true,
            tuckMode: 'untucked'
          }
        };
    }
  }
}
