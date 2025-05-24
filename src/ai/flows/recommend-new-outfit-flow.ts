
// src/ai/flows/recommend-new-outfit-flow.ts
'use server';

/**
 * @fileOverview Recommends a new outfit based on selected explorative items, mood, and weather.
 *
 * - recommendNewOutfit - A function that recommends a new outfit.
 * - RecommendNewOutfitInput - The input type for the recommendNewOutfit function.
 * - RecommendNewOutfitOutput - The return type for the recommendNewOutfit function.
 */

import {z}from 'genkit'; 
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_TEXT_MODEL
} from '@/ai/genkit'; 

const RecommendNewOutfitInputSchema = z.object({
  selectedItemNames: z.array(z.string()).describe('用户选择探索的新衣物或风格名称列表 (中文)。'),
  moodKeywords: z.string().describe('描述用户心情的关键词 (例如：轻松、活力、正式)。'),
  weatherInformation: z.string().describe('当前天气信息 (例如：晴朗、下雨、寒冷)。'),
  userGender: z.string().optional().describe('用户的性别，例如：男、女、其他。'),
  userAge: z.number().int().positive().optional().describe('用户的年龄。'),
  creativityLevel: z.number().int().min(1).max(10).describe('创意程度，1-10，1表示非常保守，10表示非常大胆。此值基于1-15的评分体系。'),
});
export type RecommendNewOutfitInput = z.infer<typeof RecommendNewOutfitInputSchema>;

const RecommendNewOutfitOutputSchema = z.object({
  description: z.string().describe('推荐的全新服装组合的详细描述 (中文)。'),
  imagePromptDetails: z.string().describe('用于生成服装效果图的详细提示词，仅描述服装的关键元素、颜色、材质和风格 (中文)，不包含人物特征。'),
});
export type RecommendNewOutfitOutput = z.infer<typeof RecommendNewOutfitOutputSchema>;

export async function recommendNewOutfit(input: RecommendNewOutfitInput): Promise<RecommendNewOutfitOutput> {
  const validatedInput = RecommendNewOutfitInputSchema.parse(input);

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

  const promptContent = `你是一位富有创意的AI时尚造型师。请根据用户选择的以下“探索性”单品、他们的心情、当前天气状况以及指定的创意程度，推荐一套完整的、时尚的服装搭配。
${personaContext}
探索性单品:
${validatedInput.selectedItemNames.map(item => `- ${item}`).join('\n')}

用户心情: ${validatedInput.moodKeywords}
天气状况: ${validatedInput.weatherInformation}
创意程度: ${validatedInput.creativityLevel} (此评级基于1至15的范围，1表示非常保守和常规，10表示非常有创意和大胆，用户选择的是 ${validatedInput.creativityLevel}/15 的创意度)。请根据此创意程度调整搭配的独特性和前卫性。

请提供两部分输出，格式为JSON对象，包含 description 和 imagePromptDetails 字段:
1.  **description**: 对这套推荐服装的详细描述，包括为什么这样搭配，以及它适合的场合。请用自然流畅的中文表述。
2.  **imagePromptDetails**: 一段专门用于AI图像生成的提示文本。这段文本应清晰、简洁地描述这套服装的关键视觉元素，例如："一件宽松的白色亚麻衬衫，搭配一条深蓝色高腰阔腿牛仔裤和一双棕色皮革踝靴。配饰包括一条简约的银色项链和一个黑色单肩包。整体风格是休闲时尚/都市简约"。**此字段仅包含衣物描述，不要涉及人物特征如性别、年龄、肤色等。**确保包含颜色、材质和具体款式。

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
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SiliconFlow API Error (recommendNewOutfit):', response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from SiliconFlow API (recommendNewOutfit):', data);
      throw new Error('Invalid response structure from API');
    }

    const content = data.choices[0].message.content;
    let parsedContent;
    try {
      // Try to parse directly if it's a JSON string
      parsedContent = JSON.parse(content);
    } catch (e) {
        // If direct parsing fails, try to extract from Markdown code block
        const markdownMatch = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
        if (markdownMatch && markdownMatch[1]) {
            try {
                parsedContent = JSON.parse(markdownMatch[1].trim());
            } catch (e2) {
                console.error("Failed to parse JSON from Markdown block (recommendNewOutfit):", markdownMatch[1], e2);
                throw new Error('Failed to parse new outfit details from model response after Markdown extraction.');
            }
        } else {
            console.error("Failed to parse content as JSON and no Markdown block found (recommendNewOutfit):", content, e);
            throw new Error('Could not find or parse new outfit details from model response.');
        }
    }
    
    const result = RecommendNewOutfitOutputSchema.parse(parsedContent);
    return result;

  } catch (error) {
    console.error('Error in recommendNewOutfit:', error);
    throw error;
  }
}
