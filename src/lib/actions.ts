'use server';
import { identifyClothingAttributes } from '@/ai/flows/identify-clothing-attributes';
import { recommendClothing } from '@/ai/flows/recommend-clothing-based-on-mood-and-weather';
import { recommendNewOutfit } from '@/ai/flows/recommend-new-outfit-flow';
import { generateOutfitImage } from '@/ai/flows/generate-outfit-image-flow';

import type { IdentifyClothingAttributesOutput } from '@/ai/flows/identify-clothing-attributes';
import type { RecommendClothingOutput } from '@/ai/flows/recommend-clothing-based-on-mood-and-weather';
import type { RecommendNewOutfitOutput } from '@/ai/flows/recommend-new-outfit-flow';
import type { GenerateOutfitImageOutput } from '@/ai/flows/generate-outfit-image-flow';

export async function handleIdentifyAttributesAction(
  photoDataUri: string
): Promise<IdentifyClothingAttributesOutput> {
  try {
    const result = await identifyClothingAttributes({ photoDataUri });
    return result;
  } catch (error) {
    console.error('Error identifying clothing attributes:', error);
    throw new Error('识别衣物属性失败，请重试。');
  }
}

export async function handleGetRecommendationAction(
  moodKeywords: string,
  weatherInformation: string,
  clothingKeywords: string[]
): Promise<RecommendClothingOutput> {
  if (!moodKeywords || !weatherInformation || clothingKeywords.length === 0) {
    throw new Error('心情、天气和至少一件衣物是获取推荐所必需的。');
  }
  try {
    const result = await recommendClothing({
      moodKeywords,
      weatherInformation,
      clothingKeywords,
    });
    return result;
  } catch (error)
   {
    console.error('Error getting recommendation:', error);
    throw new Error('获取推荐失败，请重试。');
  }
}

export async function handleExploreOutfitAction(
  selectedNewItems: string[],
  moodKeywords: string,
  weatherInformation: string
): Promise<RecommendNewOutfitOutput> {
  if (selectedNewItems.length === 0 || !moodKeywords || !weatherInformation) {
    throw new Error('探索物品、心情和天气信息都是必需的。');
  }
  try {
    const result = await recommendNewOutfit({
      selectedItemNames: selectedNewItems,
      moodKeywords,
      weatherInformation,
    });
    return result;
  } catch (error) {
    console.error('Error exploring new outfit:', error);
    throw new Error('探索新搭配失败，请重试。');
  }
}

export async function handleGenerateOutfitImageAction(
  outfitDescription: string
): Promise<GenerateOutfitImageOutput> {
  if (!outfitDescription) {
    throw new Error('缺少服装描述，无法生成图片。');
  }
  try {
    const result = await generateOutfitImage({ outfitDescription });
    return result;
  } catch (error) {
    console.error('Error generating outfit image:', error);
    // It's helpful to indicate that safety filters might be an issue.
    if (error instanceof Error && error.message.includes('SAFETY')) {
       throw new Error('图片生成失败，可能由于内容安全策略。请尝试不同的描述或搭配。');
    }
    throw new Error('生成服装图片失败，请重试。');
  }
}
