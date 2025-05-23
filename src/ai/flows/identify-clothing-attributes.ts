'use server';

/**
 * @fileOverview An AI agent that identifies the attributes of clothing.
 *
 * - identifyClothingAttributes - A function that identifies clothing attributes.
 * - IdentifyClothingAttributesInput - The input type for the identifyClothingAttributes function.
 * - IdentifyClothingAttributesOutput - The return type for the identifyClothingAttributes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return identifyClothingAttributesFlow(input);
}

const identifyClothingAttributesPrompt = ai.definePrompt({
  name: 'identifyClothingAttributesPrompt',
  input: {schema: IdentifyClothingAttributesInputSchema},
  output: {schema: IdentifyClothingAttributesOutputSchema},
  prompt: `你是一个AI时尚助手。请识别图片中衣物的属性。

  这是衣物的图片: {{media url=photoDataUri}}
  输出应为一个属性列表。属性的例子包括 "红色", "棉布", "休闲", "连衣裙", 等。
  请以JSON数组的形式返回中文属性。
  `,
});

const identifyClothingAttributesFlow = ai.defineFlow(
  {
    name: 'identifyClothingAttributesFlow',
    inputSchema: IdentifyClothingAttributesInputSchema,
    outputSchema: IdentifyClothingAttributesOutputSchema,
  },
  async input => {
    const {output} = await identifyClothingAttributesPrompt(input);
    return output!;
  }
);
