// src/ai/flows/recommend-clothing-based-on-mood-and-weather.ts
'use server';

/**
 * @fileOverview Recommends clothing combinations based on mood and weather.
 *
 * - recommendClothing - A function that recommends clothing combinations.
 * - RecommendClothingInput - The input type for the recommendClothing function.
 * - RecommendClothingOutput - The return type for the recommendClothing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendClothingInputSchema = z.object({
  moodKeywords: z.string().describe('描述用户心情的关键词 (例如：轻松、活力、正式)。'),
  weatherInformation: z.string().describe('当前天气信息 (例如：晴朗、下雨、寒冷)。'),
  clothingKeywords: z.array(z.string()).describe('描述可选衣物的关键词 (中文)。'),
});
export type RecommendClothingInput = z.infer<typeof RecommendClothingInputSchema>;

const RecommendClothingOutputSchema = z.object({
  recommendedOutfit: z.string().describe('推荐的服装组合描述 (中文)。'),
});
export type RecommendClothingOutput = z.infer<typeof RecommendClothingOutputSchema>;

export async function recommendClothing(input: RecommendClothingInput): Promise<RecommendClothingOutput> {
  return recommendClothingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendClothingPrompt',
  input: {schema: RecommendClothingInputSchema},
  output: {schema: RecommendClothingOutputSchema},
  prompt: `请根据用户的心情和当前的天气状况，从以下可选衣物中推荐一个服装组合。

心情: {{{moodKeywords}}}
天气: {{{weatherInformation}}}
可选衣物: {{#each clothingKeywords}}{{{this}}} {{/each}}

请综合考虑心情和天气，推荐最合适的搭配。请用几句话解释你的理由。
请用中文提供推荐和理由。
`,
});

const recommendClothingFlow = ai.defineFlow(
  {
    name: 'recommendClothingFlow',
    inputSchema: RecommendClothingInputSchema,
    outputSchema: RecommendClothingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
