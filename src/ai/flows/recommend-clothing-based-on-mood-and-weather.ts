
// src/ai/flows/recommend-clothing-based-on-mood-and-weather.ts
'use server';

/**
 * @fileOverview Recommends clothing combinations based on mood, weather, and available clothing.
 *
 * - recommendClothing - A function that recommends clothing combinations and provides an image prompt.
 * - RecommendClothingInput - The input type for the recommendClothing function.
 * - RecommendClothingOutput - The return type for the recommendClothing function.
 */

import {z} from 'genkit';
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_TEXT_MODEL
} from '@/ai/genkit';
import type { RecommendClothingOutput as RecommendClothingOutputType } from '@/lib/definitions';


const RecommendClothingInputSchema = z.object({
  moodKeywords: z.string().describe('描述用户心情的关键词 (例如：轻松、活力、正式)。'),
  weatherInformation: z.string().describe('当前天气信息 (例如：晴朗、下雨、寒冷)。'),
  clothingKeywords: z.array(z.string()).describe('描述可选衣物的关键词 (中文)。'),
  userGender: z.string().optional().describe('用户的性别，例如：男、女、其他。'),
  userAge: z.number().int().positive().optional().describe('用户的年龄。'),
  creativityLevel: z.number().int().min(1).max(10).describe('创意程度，1-10，1表示非常保守，10表示非常大胆。此值基于1-15的评分体系。'),
});
export type RecommendClothingInput = z.infer<typeof RecommendClothingInputSchema>;

const RecommendClothingOutputSchema = z.object({
  recommendedOutfit: z.string().describe('推荐的服装组合的详细文字描述 (中文)。'),
  imagePromptDetails: z.string().optional().describe('用于AI图像生成的详细提示词 (中文)，仅描述服装的关键元素、颜色、材质和风格，不包含人物特征。'),
});
export type RecommendClothingOutput = z.infer<typeof RecommendClothingOutputSchema>;


export async function recommendClothing(input: RecommendClothingInput): Promise<RecommendClothingOutputType> {
  const validatedInput = RecommendClothingInputSchema.parse(input);

  let personaContext = "";
  if (validatedInput.userGender) {
    personaContext += `用户性别: ${validatedInput.userGender}。`;
  }
  if (validatedInput.userAge) {
    personaContext += `用户年龄: ${validatedInput.userAge}岁。`;
  }
  if (personaContext) {
    personaContext = `请考虑以下用户信息以使推荐更个性化：${personaContext}\n`;
  }

  const promptContent = `你是一位AI时尚造型师。请根据用户的心情、当前天气状况、他们衣橱中的可选衣物以及指定的创意程度，推荐一套完整的、时尚的服装搭配。
${personaContext}
用户心情: ${validatedInput.moodKeywords}
天气状况: ${validatedInput.weatherInformation}
可选衣物 (来自用户衣橱): ${validatedInput.clothingKeywords.join(', ')}
创意程度: ${validatedInput.creativityLevel} (此评级基于1至15的范围，1表示非常保守和常规，10表示非常有创意和大胆，用户选择的是 ${validatedInput.creativityLevel}/15 的创意度)。请根据此创意程度调整搭配的独特性和前卫性。

请提供两部分输出，格式为JSON对象，包含 recommendedOutfit 和 imagePromptDetails 字段:
1.  **recommendedOutfit**: 对这套推荐服装的详细文字描述，包括为什么这样搭配，以及它适合的场合。请用自然流畅的中文表述。
2.  **imagePromptDetails**: 一段专门用于AI图像生成的提示文本。这段文本应清晰、简洁地描述这套服装的关键视觉元素，例如："一件宽松的白色亚麻衬衫，搭配一条深蓝色高腰阔腿牛仔裤和一双棕色皮革踝靴。配饰包括一条简约的银色项链和一个黑色单肩包。整体风格是休闲时尚/都市简约"。**此字段仅包含衣物描述，不要涉及人物特征如性别、年龄、肤色等。**确保包含颜色、材质和具体款式。如果无法根据可选衣物生成有意义的图像提示，可以将此字段留空或提供一个通用提示。

请用中文回答。输出严格为JSON对象，例如：{"recommendedOutfit": "描述...", "imagePromptDetails": "图片提示..."}。`;

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
      console.error('SiliconFlow API Error (recommendClothing):', response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from SiliconFlow API (recommendClothing):', data);
      throw new Error('Invalid response structure from API');
    }

    const content = data.choices[0].message.content;
    let jsonString = content.trim();

    const markdownMatch = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (markdownMatch && markdownMatch[1]) {
      jsonString = markdownMatch[1].trim();
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON from model response (recommendClothing). Content:", jsonString, parseError);
      throw new Error(`Failed to parse JSON from model response. Raw content: "${content}". Processed string: "${jsonString}". Error: ${parseError.message}`);
    }
    
    const result = RecommendClothingOutputSchema.parse(parsedContent);
    return result as RecommendClothingOutputType;

  } catch (error) {
    console.error('Error in recommendClothing:', error);
    throw error;
  }
}
