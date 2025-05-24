'use server';

import {z} from 'genkit';
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_TEXT_MODEL
} from '@/ai/genkit';

const GenerateClothingNameInputSchema = z.object({
  attributes: z.array(z.string()).describe('衣物属性列表 (中文)，例如：["白色", "棉布", "休闲", "连衣裙"]。'),
});
export type GenerateClothingNameInput = z.infer<typeof GenerateClothingNameInputSchema>;

const GenerateClothingNameOutputSchema = z.object({
  name: z.string().describe('根据属性生成的衣物短名称 (中文)，例如："白色棉布休闲连衣裙"。'),
});
export type GenerateClothingNameOutput = z.infer<typeof GenerateClothingNameOutputSchema>;

export async function generateClothingName(
  input: GenerateClothingNameInput
): Promise<GenerateClothingNameOutput> {
  const validatedInput = GenerateClothingNameInputSchema.parse(input);

  const promptContent = `根据以下衣物属性，为其生成一个简洁、描述性的中文名称（5-10个字）。

属性：
${validatedInput.attributes.join(', ')}

例如，如果属性是 ["红色", "连衣裙", "丝绸", "正式"], 名称可以是 "红色丝绸正式裙"。
如果属性是 ["蓝色", "牛仔裤", "休闲", "男士"], 名称可以是 "蓝色休闲牛仔裤"。

请仅返回生成的名称，不要包含其他任何文字或解释。输出应为JSON对象，包含 name 字段，例如：{"name": "生成的名称..."}。`;

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
        // response_format: { type: "json_object" }, // Check SiliconFlow docs
        // max_tokens: 20, // Adjusted for short name
        // temperature: 0.5, // Adjusted for more deterministic name
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SiliconFlow API Error (generateClothingName):', response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from SiliconFlow API (generateClothingName):', data);
      throw new Error('Invalid response structure from API');
    }

    let content = data.choices[0].message.content;

    // Check if the content is wrapped in a Markdown JSON code block
    const markdownMatch = content.match(/^```json\s*([\s\S]*?)\s*```$/);
    if (markdownMatch && markdownMatch[1]) {
      content = markdownMatch[1]; // Extract the JSON string
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse name JSON from model response:", content, e);
      // Fallback: if the model doesn't strictly return JSON, try to extract from plain string
      // This assumes the model might just return the name directly if JSON parsing fails.
      // A more robust solution might involve regex for specific patterns if this is common.
      if (typeof content === 'string' && content.trim() !== '') {
        // Attempt to use the content directly if it's a simple string and not empty,
        // and wrap it in the expected structure.
         parsedContent = { name: content.trim().replace(/["“”]/g, '') }; // Remove quotes if any
      } else {
        throw new Error('Failed to parse or extract name from model response.');
      }
    }

    // Ensure the name field exists, even if parsedContent was just a string
    if (typeof parsedContent === 'string') {
        parsedContent = { name: parsedContent.trim().replace(/["“”]/g, '') };
    }


    const result = GenerateClothingNameOutputSchema.parse(parsedContent);
    return result;

  } catch (error) {
    console.error('Error in generateClothingName:', error);
    throw error;
  }
}

