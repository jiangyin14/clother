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
    .describe('List of attributes identified in the clothing item.'),
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
  prompt: `You are an AI fashion assistant.  Please identify the attributes of the clothing in the image.

  Here is the image of the clothing: {{media url=photoDataUri}}
  The output should be a list of attributes.  Examples of attributes include "red", "cotton", "casual", "dress", etc.
  Return the attributes as a JSON array.
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
