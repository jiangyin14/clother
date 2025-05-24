
'use server';
import { identifyClothingAttributes } from '@/ai/flows/identify-clothing-attributes';
import { recommendClothing } from '@/ai/flows/recommend-clothing-based-on-mood-and-weather';
import { recommendNewOutfit } from '@/ai/flows/recommend-new-outfit-flow';
import { generateOutfitImage } from '@/ai/flows/generate-outfit-image-flow';
import { generateClothingName } from '@/ai/flows/generate-clothing-name-flow';
// verifyCaptchaToken is no longer needed here for AI actions, but kept if other actions might use it.
// If not used by any other action in this file, it can be removed from imports.
// For now, we'll keep it as userActions.ts still uses it.
// import { verifyCaptchaToken } from '@/lib/captcha'; 

import type { IdentifyClothingAttributesOutput } from '@/ai/flows/identify-clothing-attributes';
import type { RecommendClothingOutput } from '@/ai/flows/recommend-clothing-based-on-mood-and-weather';
import type { RecommendNewOutfitOutput } from '@/ai/flows/recommend-new-outfit-flow';
import type { GenerateOutfitImageOutput } from '@/ai/flows/generate-outfit-image-flow';
import type { GenerateClothingNameOutput } from '@/ai/flows/generate-clothing-name-flow';

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

export async function handleGenerateClothingNameAction(
  attributes: string[]
): Promise<GenerateClothingNameOutput> {
  if (!attributes || attributes.length === 0) {
    throw new Error('衣物属性是生成名称所必需的。');
  }
  try {
    const result = await generateClothingName({ attributes });
    return result;
  } catch (error) {
    console.error('Error generating clothing name:', error);
    throw new Error('生成衣物名称失败，请重试。');
  }
}

export async function handleGetRecommendationAction(
  moodKeywords: string,
  weatherInformation: string,
  clothingKeywords: string[]
  // captchaToken: string | null // Removed captchaToken
): Promise<RecommendClothingOutput> {
  // const isHuman = await verifyCaptchaToken(captchaToken); // Removed captcha verification
  // if (!isHuman) {
  //   throw new Error('人机验证失败，请刷新页面后重试。');
  // }

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
  // captchaToken: string | null // Removed captchaToken
): Promise<RecommendNewOutfitOutput> {
  // const isHuman = await verifyCaptchaToken(captchaToken); // Removed captcha verification
  // if (!isHuman) {
  //   throw new Error('人机验证失败，请刷新页面后重试。');
  // }

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
    if (error instanceof Error && error.message.includes('SAFETY')) {
       throw new Error('图片生成失败，可能由于内容安全策略。请尝试不同的描述或搭配。');
    }
    throw new Error('生成服装图片失败，请重试。');
  }
}
