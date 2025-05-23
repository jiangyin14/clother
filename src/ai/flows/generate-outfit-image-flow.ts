// src/ai/flows/generate-outfit-image-flow.ts
'use server';

/**
 * @fileOverview Generates an image of an outfit based on a description.
 *
 * - generateOutfitImage - A function that generates an outfit image.
 * - GenerateOutfitImageInput - The input type for the generateOutfitImage function.
 * - GenerateOutfitImageOutput - The return type for the generateOutfitImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOutfitImageInputSchema = z.object({
  outfitDescription: z.string().describe('AI图像生成模型使用的详细服装描述 (中文)。'),
});
export type GenerateOutfitImageInput = z.infer<typeof GenerateOutfitImageInputSchema>;

const GenerateOutfitImageOutputSchema = z.object({
  imageDataUri: z.string().describe("生成的服装图片，作为数据URI。格式: 'data:image/png;base64,<encoded_data>'"),
});
export type GenerateOutfitImageOutput = z.infer<typeof GenerateOutfitImageOutputSchema>;

export async function generateOutfitImage(input: GenerateOutfitImageInput): Promise<GenerateOutfitImageOutput> {
  return generateOutfitImageFlow(input);
}

const generateOutfitImageFlow = ai.defineFlow(
  {
    name: 'generateOutfitImageFlow',
    inputSchema: GenerateOutfitImageInputSchema,
    outputSchema: GenerateOutfitImageOutputSchema,
    // Enable for debugging if needed
    // authPolicy: (auth, input) => {
    //   if (!auth) {
    //     throw new Error('Authorization required.');
    //   }
    // }
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Use this specific model for image generation
      prompt: `根据以下描述生成一张时尚服装模特图： ${input.outfitDescription}。请确保图片清晰、现代且美观。主要展现服装，模特姿势自然。`,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], // MUST provide both TEXT and IMAGE
        // Loosen safety settings slightly for creative generation, but be mindful of policies
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
        // You can add other parameters like temperature if supported and needed for image generation
        // temperature: 0.7 
      },
    });

    if (!media || !media.url) {
      throw new Error('AI未能生成图片。');
    }
    
    // The model might return text output as well, but we are primarily interested in the image.
    // console.log("Text response from image generation:", text);

    return { imageDataUri: media.url };
  }
);
