
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
} from '@/ai/genkit';

const GenerateOutfitImageInputSchema = z.object({
  outfitDescription: z.string().describe('仅包含服装的详细文字描述 (中文)，例如："一件宽松的白色亚麻衬衫，搭配一条深蓝色高腰阔腿牛仔裤"。'),
  userGender: z.string().optional().describe('模特性别，例如：男性，女性，中性。'),
  userAge: z.number().int().positive().optional().describe('模特大致年龄。'),
  userWeightDescription: z.string().optional().describe('模特大致体重或体型描述，例如：约60公斤，中等身材，健硕。'),
  userSkinTone: z.string().optional().describe('模特肤色，例如：白皙，自然，健康小麦色，深色。'),
  userHeightDescription: z.string().optional().describe('模特大致身高描述，例如：约175厘米，高挑。'),
});
export type GenerateOutfitImageInput = z.infer<typeof GenerateOutfitImageInputSchema>;

const GenerateOutfitImageOutputSchema = z.object({
  imageDataUri: z.string().describe("生成的服装图片，作为数据URI。格式: 'data:image/png;base64,<encoded_data>'"),
});
export type GenerateOutfitImageOutput = z.infer<typeof GenerateOutfitImageOutputSchema>;

export async function generateOutfitImage(input: GenerateOutfitImageInput): Promise<GenerateOutfitImageOutput> {
  const validatedInput = GenerateOutfitImageInputSchema.parse(input);

  if (!SILICONFLOW_API_KEY || SILICONFLOW_API_KEY === 'YOUR_SILICONFLOW_API_KEY') {
    console.error('SiliconFlow API Key is not configured or is a placeholder.');
    throw new Error('图片生成服务API Key配置不正确。');
  }
  if (!SILICONFLOW_API_BASE_URL) {
    console.error('SiliconFlow API Base URL is not configured.');
    throw new Error('图片生成服务API基础URL配置不正确。');
  }

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
  if (validatedInput.userHeightDescription) {
    personaDescription += `，${validatedInput.userHeightDescription}`;
  }
  
  const imagePrompt = `${personaDescription}，穿着：${validatedInput.outfitDescription}。风格时尚，照片级真实感，全身或半身像，背景简洁。`;
  
  console.log("Generating image with prompt:", imagePrompt);

  try {
    const apiResponse = await fetch(`${SILICONFLOW_API_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "Alibaba-Tongyi/pai-diffusion-artist-xl-uhd-v1.0", 
        prompt: imagePrompt,
        n: 1, 
        size: '1024x1024', 
        response_format: 'url', 
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('SiliconFlow Image API Error:', apiResponse.status, errorBody);
      if (errorBody.includes("SAFETY_FILTER_TRIGGERED") || errorBody.includes("prompt violates safety policy")) {
         throw new Error(`图片生成失败，提示词可能触发了内容安全策略。请尝试调整描述。原始错误: ${errorBody}`);
      }
      throw new Error(`图像API请求失败，状态码 ${apiResponse.status}: ${errorBody}`);
    }

    const responseData = await apiResponse.json();

    const imageUrl = responseData.images?.[0]?.url;
    if (!imageUrl) {
      console.error('Invalid response structure from SiliconFlow Image API (missing URL):', responseData);
      throw new Error('从图像 API 返回的图像 URL 无效或缺失。');
    }

    console.log(`Fetching image content from SiliconFlow URL: ${imageUrl}`);
    // Use { cache: 'no-store' } to prevent caching issues, especially in server environments.
    const imageContentResponse = await fetch(imageUrl, { cache: 'no-store' });
    if (!imageContentResponse.ok) {
      const errorBody = await imageContentResponse.text();
      console.error(`Failed to fetch image from URL: ${imageUrl}. Status: ${imageContentResponse.status}. Body: ${errorBody}`);
      throw new Error(`从 URL ${imageUrl} 获取图像内容失败，状态码: ${imageContentResponse.status}`);
    }

    const imageArrayBuffer = await imageContentResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
    const imageMimeType = imageContentResponse.headers.get('content-type') || 'image/png'; 
    const imageDataUri = `data:${imageMimeType};base64,${imageBase64}`;
    
    const result = GenerateOutfitImageOutputSchema.parse({ imageDataUri });
    return result;

  } catch (error) {
    console.error('Error in generateOutfitImage:', error);
    if (error instanceof Error) {
        // Re-throw with a potentially more generic message or a specific one based on type
         if (error.message.includes('API Key') || error.message.includes('API基础URL')) {
            throw error; // Keep specific config errors
         }
         throw new Error(`图片生成过程中发生错误: ${error.message}`);
    }
    throw new Error('图片生成过程中发生未知错误。');
  }
}

