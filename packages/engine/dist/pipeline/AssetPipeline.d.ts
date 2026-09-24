import { CategoryType, CategoryAnchorMap } from '../types/index.js';
export interface AssetAnalysisResult {
    suggestedCategory: CategoryType;
    confidence: number;
    anchorMap: CategoryAnchorMap;
    aspectRatio: number;
    suggestedTags: string[];
}
export declare class AssetPipeline {
    /**
     * Suggests category and default anchor mappings based on asset dimensions and keywords.
     */
    static analyzeAsset(filename: string, width: number, height: number): AssetAnalysisResult;
    static generateDefaultAnchorMap(category: CategoryType): CategoryAnchorMap;
}
//# sourceMappingURL=AssetPipeline.d.ts.map