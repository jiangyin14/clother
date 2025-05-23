// src/ai/flows/recommend-clothing-based-on-mood-and-weather.ts
'use server';

/**
 * @fileOverview Recommends clothing combinations based on mood and weather.
 *
 * - recommendClothing - A function that recommends clothing combinations.
 * - RecommendClothingInput - The input type for the recommendClothing function.
 * - RecommendClothingOutput - The return type for the recommendClothing function.
 */

import {z} from 'genkit';
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_TEXT_MODEL
} from '@/ai/genkit';

const RecommendClothingInputSchema = z.object({
  moodKeywords: z.string().describe('描述用户心情的关键词 (例如：轻松、活力、正式)。'),
  weatherInformation: z.string().describe('当前天气信息 (例如：晴朗、下雨、寒冷)。'),
  clothingKeywords: z.array(z.string()).describe('描述可选衣物的关键词 (中文)。'),
});
export type RecommendClothingInput = z.infer<typeof RecommendClothingInputSchema>;

const RecommendClothingOutputSchema = z.object({
  recommendedOutfit: z.string().describe('推荐的服装组合描述 (中文)。'),
});
export type RecommendClothingOutput = z.infer<typeof RecommendClothingOutputSchema>;

export async function recommendClothing(input: RecommendClothingInput): Promise<RecommendClothingOutput> {
  // Validate input using Zod schema
  const validatedInput = RecommendClothingInputSchema.parse(input);

  const promptContent = `请根据用户的心情和当前的天气状况，从以下可选衣物中推荐一个服装组合。

心情: ${validatedInput.moodKeywords}
天气: ${validatedInput.weatherInformation}
可选衣物: ${validatedInput.clothingKeywords.join(', ')}

请综合考虑心情和天气，推荐最合适的搭配。请用几句话解释你的理由。
请用中文提供推荐和理由。输出应为JSON对象，包含 recommendedOutfit 字段，例如：{"recommendedOutfit": "推荐描述..."}。`;

  try {
    const response = await fetch(`${SILICONFLOW_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: SILICONFLOW_TEXT_MODEL,
        messages: [
          {
            role: 'user',
            content: promptContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SiliconFlow API Error:', response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from SiliconFlow API:', data);
      throw new Error('Invalid response structure from API');
    }

    const content = data.choices[0].message.content;
    let parsedContent;
    try {
      // Attempt to parse the content as JSON directly
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse content as JSON, attempting to extract from string:", content, e);
      // Fallback: if the model doesn't strictly return JSON, you might need to extract it
      const match = content.match(/{\s*"recommendedOutfit":\s*".*?"\s*}/);
      if (match && match[0]) {
        try {
          parsedContent = JSON.parse(match[0]);
        } catch (e2) {
          console.error("Failed to parse extracted JSON:", match[0], e2);
          throw new Error('Failed to parse recommended outfit from model response after extraction.');
        }
      } else {
        throw new Error('Could not find or parse recommended outfit from model response.');
      }
    }

    // Validate output using Zod schema
    const result = RecommendClothingOutputSchema.parse(parsedContent);
    return result;

  } catch (error) {
    console.error('Error in recommendClothing:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
