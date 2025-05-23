'use server';

/**
 * @fileOverview An AI agent that identifies the attributes of clothing.
 *
 * - identifyClothingAttributes - A function that identifies clothing attributes.
 * - IdentifyClothingAttributesInput - The input type for the identifyClothingAttributes function.
 * - IdentifyClothingAttributesOutput - The return type for the identifyClothingAttributes function.
 */

import {z} from 'genkit';
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_VL_MODEL
} from '@/ai/genkit';

const IdentifyClothingAttributesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of clothing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyClothingAttributesInput = z.infer<
  typeof IdentifyClothingAttributesInputSchema
>;

const IdentifyClothingAttributesOutputSchema = z.object({
  attributes: z
    .array(z.string())
    .describe('List of attributes identified in the clothing item, in Chinese.'),
});
export type IdentifyClothingAttributesOutput = z.infer<
  typeof IdentifyClothingAttributesOutputSchema
>;

export async function identifyClothingAttributes(
  input: IdentifyClothingAttributesInput
): Promise<IdentifyClothingAttributesOutput> {
  // Validate input using Zod schema
  const validatedInput = IdentifyClothingAttributesInputSchema.parse(input);

  const promptText = `你是一个AI时尚助手。请识别图片中衣物的属性。输出应为一个属性列表。属性的例子包括 "红色", "棉布", "休闲", "连衣裙", 等。请以JSON数组的形式返回中文属性。`;

  try {
    const response = await fetch(`${SILICONFLOW_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: SILICONFLOW_VL_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              {
                type: 'image_url',
                image_url: {
                  url: validatedInput.photoDataUri,
                },
              },
            ],
          },
        ],
        // You might want to add other parameters like max_tokens, temperature
        // max_tokens: 100,
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

    // Assuming the content is a JSON string array e.g., "["红色", "棉布"]"
    let attributesArray;
    try {
      attributesArray = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse attributes JSON from model response:", content, e);
      // Fallback or attempt to extract from a more general string if parsing fails
      // For now, we'll throw, but you could implement more robust parsing/extraction
      throw new Error('Failed to parse attributes from model response.');
    }

    // Validate output using Zod schema
    const result = IdentifyClothingAttributesOutputSchema.parse({ attributes: attributesArray });
    return result;

  } catch (error) {
    console.error('Error in identifyClothingAttributes:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
