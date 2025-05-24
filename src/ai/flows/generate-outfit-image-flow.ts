
// src/ai/flows/generate-outfit-image-flow.ts
'use server';

/**
 * @fileOverview Generates an image of an outfit based on a description and persona details.
 *
 * - generateOutfitImage - A function that generates an outfit image.
 * - GenerateOutfitImageInput - The input type for the generateOutfitImage function.
 * - GenerateOutfitImageOutput - The return type for the generateOutfitImage function.
 */

import {z}from 'genkit'; 
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_BASE_URL,
  // SILICONFLOW_VL_MODEL // Not used directly here, image generation uses specific model
} from '@/ai/genkit';

const GenerateOutfitImageInputSchema = z.object({
  outfitDescription: z.string().describe('仅包含服装的详细文字描述 (中文)，例如："一件宽松的白色亚麻衬衫，搭配一条深蓝色高腰阔腿牛仔裤"。'),
  userGender: z.string().optional().describe('模特性别，例如：男性，女性，中性。'),
  userAge: z.number().int().positive().optional().describe('模特大致年龄。'),
  userWeightDescription: z.string().optional().describe('模特大致体重或体型描述，例如：约60公斤，中等身材，健硕。'),
  userSkinTone: z.string().optional().describe('模特肤色，例如：白皙，自然，健康小麦色，深色。'),
});
export type GenerateOutfitImageInput = z.infer<typeof GenerateOutfitImageInputSchema>;

const GenerateOutfitImageOutputSchema = z.object({
  imageDataUri: z.string().describe("生成的服装图片，作为数据URI。格式: 'data:image/png;base64,<encoded_data>'"),
});
export type GenerateOutfitImageOutput = z.infer<typeof GenerateOutfitImageOutputSchema>;

export async function generateOutfitImage(input: GenerateOutfitImageInput): Promise<GenerateOutfitImageOutput> {
  const validatedInput = GenerateOutfitImageInputSchema.parse(input);

  let personaDescription = "一位模特";
  if (validatedInput.userGender) {
    personaDescription = `一位${validatedInput.userGender}模特`;
  }
  if (validatedInput.userAge) {
    personaDescription += `，年龄大约${validatedInput.userAge}岁`;
  }
  if (validatedInput.userSkinTone) {
    personaDescription += `，肤色为${validatedInput.userSkinTone}`;
  }
  if (validatedInput.userWeightDescription) {
    personaDescription += `，体型${validatedInput.userWeightDescription}`;
  }
  
  // SiliconFlow/Kolors expects more direct prompting.
  // Let's try a template that emphasizes the clothing on the described persona.
  const imagePrompt = `${personaDescription}，穿着：${validatedInput.outfitDescription}。风格时尚，照片级真实感，全身或半身像，背景简洁。`;
  // Alternative simpler prompt:
  // const imagePrompt = `时尚模特图：${personaDescription} 穿着 ${validatedInput.outfitDescription}。`;


  console.log("Generating image with prompt:", imagePrompt);

  try {
    const apiResponse = await fetch(`${SILICONFLOW_API_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "Alibaba-Tongyi/pai-diffusion-artist-xl-uhd-v1.0", // Using a recommended artist model
        prompt: imagePrompt,
        n: 1, // Number of images to generate
        size: '1024x1024', // Or '512x512' for faster generation
        response_format: 'url', 
        // Additional parameters for Kolors/SiliconFlow if available and relevant:
        // style_preset: "photographic", // Example, check API docs for actual presets
        // negative_prompt: "cartoon, anime, (deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck",
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('SiliconFlow Image API Error:', apiResponse.status, errorBody);
      // Check for safety filter related errors specifically
      if (errorBody.includes("SAFETY_FILTER_TRIGGERED") || errorBody.includes("prompt violates safety policy")) {
         throw new Error(`图片生成失败，提示词可能触发了内容安全策略。请尝试调整描述。原始错误: ${errorBody}`);
      }
      throw new Error(`Image API request failed with status ${apiResponse.status}: ${errorBody}`);
    }

    const responseData = await apiResponse.json();

    if (!responseData.images || responseData.images.length === 0 || !responseData.images[0].url) {
      console.error('Invalid response structure from SiliconFlow Image API (missing URL):', responseData);
      throw new Error('Invalid image response structure from API (missing URL)');
    }

    const imageUrl = responseData.images[0].url;

    const imageContentResponse = await fetch(imageUrl);
    if (!imageContentResponse.ok) {
      const errorBody = await imageContentResponse.text();
      console.error('Failed to fetch image from URL:', imageContentResponse.status, errorBody);
      throw new Error(`Failed to fetch image from URL ${imageUrl}: ${imageContentResponse.status}`);
    }

    const imageArrayBuffer = await imageContentResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
    const imageMimeType = imageContentResponse.headers.get('content-type') || 'image/png'; // Fallback to image/png
    const imageDataUri = `data:${imageMimeType};base64,${imageBase64}`;
    
    const result = GenerateOutfitImageOutputSchema.parse({ imageDataUri });
    return result;

  } catch (error) {
    console.error('Error in generateOutfitImage:', error);
    throw error;
  }
}
