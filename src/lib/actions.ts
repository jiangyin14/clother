'use server';
import { identifyClothingAttributes } from '@/ai/flows/identify-clothing-attributes';
import { recommendClothing } from '@/ai/flows/recommend-clothing-based-on-mood-and-weather';
import type { IdentifyClothingAttributesOutput } from '@/ai/flows/identify-clothing-attributes';
import type { RecommendClothingOutput } from '@/ai/flows/recommend-clothing-based-on-mood-and-weather';

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
