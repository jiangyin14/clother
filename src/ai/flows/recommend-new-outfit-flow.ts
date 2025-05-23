// src/ai/flows/recommend-new-outfit-flow.ts
'use server';

/**
 * @fileOverview Recommends a new outfit based on selected explorative items, mood, and weather.
 *
 * - recommendNewOutfit - A function that recommends a new outfit.
 * - RecommendNewOutfitInput - The input type for the recommendNewOutfit function.
 * - RecommendNewOutfitOutput - The return type for the recommendNewOutfit function.
 */

import {z} from 'genkit'; // Keep z for schema validation
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_TEXT_MODEL
} from '@/ai/genkit'; // Corrected imports

const RecommendNewOutfitInputSchema = z.object({
  selectedItemNames: z.array(z.string()).describe('用户选择探索的新衣物或风格名称列表 (中文)。'),
  moodKeywords: z.string().describe('描述用户心情的关键词 (例如：轻松、活力、正式)。'),
  weatherInformation: z.string().describe('当前天气信息 (例如：晴朗、下雨、寒冷)。'),
});
export type RecommendNewOutfitInput = z.infer<typeof RecommendNewOutfitInputSchema>;

const RecommendNewOutfitOutputSchema = z.object({
  description: z.string().describe('推荐的全新服装组合的详细描述 (中文)。'),
  imagePromptDetails: z.string().describe('用于生成服装效果图的详细提示词，描述服装的关键元素、颜色、材质和风格 (中文)。'),
});
export type RecommendNewOutfitOutput = z.infer<typeof RecommendNewOutfitOutputSchema>;

export async function recommendNewOutfit(input: RecommendNewOutfitInput): Promise<RecommendNewOutfitOutput> {
  // Validate input using Zod schema
  const validatedInput = RecommendNewOutfitInputSchema.parse(input);

  const promptContent = `你是一位富有创意的AI时尚造型师。请根据用户选择的以下“探索性”单品、他们的心情以及当前天气状况，推荐一套完整的、时尚的服装搭配。

探索性单品:
${validatedInput.selectedItemNames.map(item => `- ${item}`).join('\n')}

用户心情: ${validatedInput.moodKeywords}
天气状况: ${validatedInput.weatherInformation}

请提供两部分输出，格式为JSON对象，包含 description 和 imagePromptDetails 字段:
1.  **description**: 对这套推荐服装的详细描述，包括为什么这样搭配，以及它适合的场合。请用自然流畅的中文表述。
2.  **imagePromptDetails**: 一段专门用于AI图像生成的提示文本。这段文本应清晰、简洁地描述这套服装的关键视觉元素，例如："一位模特穿着[上衣描述，如：一件宽松的白色亚麻衬衫]，搭配[下装描述，如：一条深蓝色高腰阔腿牛仔裤]和[鞋子描述，如：一双棕色皮革踝靴]。配饰包括[配饰描述，如：一条简约的银色项链和一个黑色单肩包]。整体风格是[风格描述，如：休闲时尚/都市简约]。背景可以是[背景描述，如：明亮的城市街道/纯色背景]"。确保包含颜色、材质和具体款式。

请用中文回答。输出严格为JSON对象，例如：{"description": "描述...", "imagePromptDetails": "图片提示..."}。`;

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
        // response_format: { type: "json_object" }, // OpenAI specific, check SiliconFlow docs
        // max_tokens: 500,
        // temperature: 0.7,
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
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse content as JSON, attempting to extract from string:", content, e);
      // Basic fallback for extracting JSON - might need to be more robust
      // @ts-ignore
      const match = content.match(/{\s*"description":\s*".*?",\s*"imagePromptDetails":\s*".*?"\s*}/s);
      if (match && match[0]) {
        try {
          parsedContent = JSON.parse(match[0]);
        } catch (e2) {
          console.error("Failed to parse extracted JSON:", match[0], e2);
          throw new Error('Failed to parse new outfit details from model response after extraction.');
        }
      } else {
        throw new Error('Could not find or parse new outfit details from model response.');
      }
    }

    // Validate output using Zod schema
    const result = RecommendNewOutfitOutputSchema.parse(parsedContent);
    return result;

  } catch (error) {
    console.error('Error in recommendNewOutfit:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Removed Genkit's ai.definePrompt and ai.defineFlow if they existed below
