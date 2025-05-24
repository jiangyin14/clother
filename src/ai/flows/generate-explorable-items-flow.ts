'use server';
/**
 * @fileOverview Generates a list of explorable fashion items or concepts.
 *
 * - generateExplorableItems - A function that generates explorable fashion items.
 * - GenerateExplorableItemsOutput - The return type for the generateExplorableItems function.
 */

import {z} from 'genkit';
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_TEXT_MODEL
} from '@/ai/genkit';

// No specific input needed for this flow for now, but we define a schema for consistency
const GenerateExplorableItemsInputSchema = z.object({
  count: z.number().int().positive().optional().default(10).describe('Number of items to generate.'),
});
export type GenerateExplorableItemsInput = z.infer<typeof GenerateExplorableItemsInputSchema>;

const ExplorableItemSchema = z.object({
  name: z.string().describe('The concise name of the fashion item or style (in Chinese, 3-7 words).'),
  description: z.string().describe('A short, engaging description of the item/style (in Chinese, 1-2 sentences).'),
});

const GenerateExplorableItemsOutputSchema = z.object({
  items: z.array(ExplorableItemSchema).describe('An array of generated explorable fashion items.'),
});
export type GenerateExplorableItemsOutput = z.infer<typeof GenerateExplorableItemsOutputSchema>;


export async function generateExplorableItems(input?: GenerateExplorableItemsInput): Promise<GenerateExplorableItemsOutput> {
  const validatedInput = GenerateExplorableItemsInputSchema.parse(input || {});
  const itemCount = validatedInput.count;

  const promptContent = `你是一位顶尖的时尚顾问和潮流趋势预测师。请为用户生成一份包含 ${itemCount} 个当前流行或非常具有探索价值的时尚单品、风格、搭配概念或独特元素的清单。
每个元素应包括一个简洁的名称（中文，3-7个字）和一个简短但引人入胜的描述（中文，1-2句话）。
请确保清单内容多样化，涵盖服装、配饰、特定风格（例如：Y2K风、极简主义、工装风）、或者某种独特的时尚概念（例如：可持续时尚拼接、未来感金属配饰）。
返回结果必须是一个JSON对象，包含一个名为 "items" 的数组，数组中的每个对象都有 "name" 和 "description" 两个键。

例如:
{
  "items": [
    {
      "name": "复古风奶奶开衫",
      "description": "舒适柔软的针织开衫，带有复古图案，轻松打造温柔怀旧风格。"
    },
    {
      "name": "解构主义牛仔裤",
      "description": "打破常规剪裁的牛仔裤，通过不对称设计和拼接展现独特个性。"
    },
    {
      "name": "赛博朋克墨镜",
      "description": "造型夸张，充满未来科技感的墨镜，是派对吸睛利器。"
    }
    // ... 更多项目
  ]
}

请确保输出严格遵循此JSON格式。`;

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
        // Ensure the model is capable of returning JSON. Adjust parameters if needed.
        // response_format: { type: "json_object" }, // If supported and necessary
        temperature: 0.7, // Allow for some creativity
        max_tokens: 1500, // Adjust based on expected number of items and description length
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SiliconFlow API Error (generateExplorableItems):', response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from SiliconFlow API (generateExplorableItems):', data);
      throw new Error('Invalid response structure from API');
    }

    let content = data.choices[0].message.content;
    
    // Attempt to extract JSON from Markdown code block if present
    const markdownMatch = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (markdownMatch && markdownMatch[1]) {
      content = markdownMatch[1].trim();
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse JSON from model response (generateExplorableItems). Content:", content, parseError);
      throw new Error(`Failed to parse JSON from model response. Raw content: "${data.choices[0].message.content}". Processed string for parsing: "${content}". Error: ${parseError.message}`);
    }
    
    // Validate the parsed content against the Zod schema
    const result = GenerateExplorableItemsOutputSchema.parse(parsedContent);
    return result;

  } catch (error) {
    console.error('Error in generateExplorableItems:', error);
    // Re-throw the error to be handled by the caller (e.g., the Server Action)
    throw error;
  }
}
