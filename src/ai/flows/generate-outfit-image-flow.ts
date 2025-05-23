// src/ai/flows/generate-outfit-image-flow.ts
'use server';

/**
 * @fileOverview Generates an image of an outfit based on a description.
 *
 * - generateOutfitImage - A function that generates an outfit image.
 * - GenerateOutfitImageInput - The input type for the generateOutfitImage function.
 * - GenerateOutfitImageOutput - The return type for the generateOutfitImage function.
 */

import {z} from 'genkit'; // Keep z for schema validation
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  SILICONFLOW_VL_MODEL // Using VL model as it might be used for image generation too
} from '@/ai/genkit';

const GenerateOutfitImageInputSchema = z.object({
  outfitDescription: z.string().describe('AI图像生成模型使用的详细服装描述 (中文)。'),
});
export type GenerateOutfitImageInput = z.infer<typeof GenerateOutfitImageInputSchema>;

const GenerateOutfitImageOutputSchema = z.object({
  imageDataUri: z.string().describe("生成的服装图片，作为数据URI。格式: 'data:image/png;base64,<encoded_data>'"),
});
export type GenerateOutfitImageOutput = z.infer<typeof GenerateOutfitImageOutputSchema>;

export async function generateOutfitImage(input: GenerateOutfitImageInput): Promise<GenerateOutfitImageOutput> {
  // Validate input using Zod schema
  const validatedInput = GenerateOutfitImageInputSchema.parse(input);

  const imagePrompt = `根据以下描述生成一张时尚服装模特图： ${validatedInput.outfitDescription}。请确保图片清晰、现代且美观。主要展现服装，模特姿势自然。`;

  try {
    const apiResponse = await fetch(`${SILICONFLOW_API_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "Kwai-Kolors/Kolors",
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url', // Changed from b64_json to url
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('SiliconFlow Image API Error:', apiResponse.status, errorBody);
      throw new Error(`Image API request failed with status ${apiResponse.status}: ${errorBody}`);
    }

    const responseData = await apiResponse.json();

    // Adjust parsing based on the provided API response structure
    if (!responseData.images || responseData.images.length === 0 || !responseData.images[0].url) {
      console.error('Invalid response structure from SiliconFlow Image API (missing URL):', responseData);
      throw new Error('Invalid image response structure from API (missing URL)');
    }

    const imageUrl = responseData.images[0].url;

    // Fetch the image content from the URL
    const imageContentResponse = await fetch(imageUrl);
    if (!imageContentResponse.ok) {
      const errorBody = await imageContentResponse.text();
      console.error('Failed to fetch image from URL:', imageContentResponse.status, errorBody);
      throw new Error(`Failed to fetch image from URL ${imageUrl}: ${imageContentResponse.status}`);
    }

    const imageArrayBuffer = await imageContentResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
    const imageDataUri = `data:image/png;base64,${imageBase64}`;

    // Validate output using Zod schema
    const result = GenerateOutfitImageOutputSchema.parse({ imageDataUri });
    return result;

  } catch (error) {
    console.error('Error in generateOutfitImage:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Removed Genkit's ai.defineFlow and related constants
