
'use server';
import { identifyClothingAttributes } from '@/ai/flows/identify-clothing-attributes';
import { recommendClothing } from '@/ai/flows/recommend-clothing-based-on-mood-and-weather';
import { recommendNewOutfit } from '@/ai/flows/recommend-new-outfit-flow';
import { generateOutfitImage } from '@/ai/flows/generate-outfit-image-flow';
import { generateClothingName } from '@/ai/flows/generate-clothing-name-flow';
import { getClosetItems } from '@/actions/closetActions'; 
import { getUserFromSession } from '@/actions/userActions'; 

import type { IdentifyClothingAttributesOutput } from '@/ai/flows/identify-clothing-attributes';
import type { RecommendNewOutfitOutput } from '@/ai/flows/recommend-new-outfit-flow';
import type { GenerateOutfitImageOutput } from '@/ai/flows/generate-outfit-image-flow';
import type { GenerateClothingNameOutput } from '@/ai/flows/generate-clothing-name-flow';
import type { RecommendClothingOutput } from '@/lib/definitions';

export async function handleIdentifyAttributesAction(
  photoDataUri: string
): Promise<IdentifyClothingAttributesOutput> {
  try {
    const result = await identifyClothingAttributes({ photoDataUri });
    return result;
  } catch (error) {
    console.error('Error in handleIdentifyAttributesAction:', error);
    if (error instanceof Error) {
      throw new Error(`识别衣物属性失败: ${error.message}`);
    }
    throw new Error('识别衣物属性时发生未知错误。');
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
    console.error('Error in handleGenerateClothingNameAction:', error);
    if (error instanceof Error) {
      throw new Error(`生成衣物名称失败: ${error.message}`);
    }
    throw new Error('生成衣物名称时发生未知错误。');
  }
}

export async function handleGetRecommendationAction(
  moodKeywords: string,
  weatherInformation: string
): Promise<RecommendClothingOutput & { error?: string }> {
  if (!moodKeywords || !weatherInformation ) {
    throw new Error('心情和天气信息是获取推荐所必需的。');
  }

  try {
    const user = await getUserFromSession(); 
    const closetItems = await getClosetItems(); 
    if (closetItems.length === 0) {
      return { 
        recommendedOutfit: "您的衣橱是空的，或您尚未登录。请先在“衣橱”页面添加一些衣物，或登录后重试。", 
        imagePromptDetails: undefined,
        error: "衣橱为空或未登录，无法生成推荐。"
      };
    }

    const allAttributes = Array.from(new Set(closetItems.flatMap(item => item.attributes)));
    if (allAttributes.length === 0) {
       return { 
        recommendedOutfit: "您的衣橱中的衣物似乎没有可识别的属性，无法生成推荐。请尝试上传属性更清晰的衣物图片。", 
        imagePromptDetails: undefined,
        error: "衣橱衣物无有效属性。"
      };
    }

    const result = await recommendClothing({
      moodKeywords,
      weatherInformation,
      clothingKeywords: allAttributes,
      userGender: user?.gender || undefined, 
      userAge: user?.age || undefined,       
    });
    
    return {
      recommendedOutfit: result.recommendedOutfit,
      imagePromptDetails: result.imagePromptDetails, 
    };
  } catch (error) {
    console.error('Error in handleGetRecommendationAction:', error);
    if (error instanceof Error) {
      throw new Error(`AI获取推荐失败: ${error.message}`);
    }
    throw new Error('AI获取推荐时发生未知错误。');
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
    const user = await getUserFromSession(); 
    const result = await recommendNewOutfit({
      selectedItemNames: selectedNewItems,
      moodKeywords,
      weatherInformation,
      userGender: user?.gender || undefined, 
      userAge: user?.age || undefined,       
    });
    return result; 
  } catch (error) {
    console.error('Error in handleExploreOutfitAction:', error);
     if (error instanceof Error) {
      throw new Error(`探索新搭配失败: ${error.message}`);
    }
    throw new Error('探索新搭配时发生未知错误。');
  }
}

export async function handleGenerateOutfitImageAction(
  outfitClothingDescription: string 
): Promise<GenerateOutfitImageOutput> {
  if (!outfitClothingDescription) {
    console.error("Error in handleGenerateOutfitImageAction: outfitClothingDescription is missing.");
    throw new Error('缺少服装描述，无法生成图片。');
  }
  try {
    const user = await getUserFromSession();
    let userWeightDescription: string | undefined = undefined;
    if (user?.weight) {
      userWeightDescription = `约 ${user.weight} 公斤`;
    }
    let userHeightDescription: string | undefined = undefined;
    if (user?.height) {
      userHeightDescription = `身高约 ${user.height} 厘米`;
    }

    const result = await generateOutfitImage({ 
      outfitDescription: outfitClothingDescription,
      userGender: user?.gender || undefined,
      userAge: user?.age || undefined,
      userWeightDescription: userWeightDescription,
      userSkinTone: user?.skinTone || undefined,
      userHeightDescription: userHeightDescription,
    });
    return result;
  } catch (error) {
    console.error('Error in handleGenerateOutfitImageAction calling generateOutfitImage:', error);
    if (error instanceof Error) {
       // Check for specific configuration error messages from the flow
      if (error.message.includes('API Key配置不正确') || error.message.includes('API基础URL配置不正确')) {
        throw error; // Re-throw specific config errors as is
      }
      throw new Error(`生成服装图片失败: ${error.message}`);
    }
    throw new Error('生成服装图片时发生未知错误。');
  }
}

