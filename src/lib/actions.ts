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
    throw new Error('Failed to identify clothing attributes. Please try again.');
  }
}

export async function handleGetRecommendationAction(
  moodKeywords: string,
  weatherInformation: string,
  clothingKeywords: string[]
): Promise<RecommendClothingOutput> {
  if (!moodKeywords || !weatherInformation || clothingKeywords.length === 0) {
    throw new Error('Mood, weather, and at least one clothing item are required for recommendations.');
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
    throw new Error('Failed to get recommendation. Please try again.');
  }
}
