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
  moodKeywords: z.string().describe('Keywords describing the user\'s mood (e.g., relaxed, energetic, formal).'),
  weatherInformation: z.string().describe('Current weather information (e.g., sunny, rainy, cold).'),
  clothingKeywords: z.array(z.string()).describe('Keywords describing available clothing items.'),
});
export type RecommendClothingInput = z.infer<typeof RecommendClothingInputSchema>;

const RecommendClothingOutputSchema = z.object({
  recommendedOutfit: z.string().describe('A description of the recommended clothing combination.'),
});
export type RecommendClothingOutput = z.infer<typeof RecommendClothingOutputSchema>;

export async function recommendClothing(input: RecommendClothingInput): Promise<RecommendClothingOutput> {
  return recommendClothingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendClothingPrompt',
  input: {schema: RecommendClothingInputSchema},
  output: {schema: RecommendClothingOutputSchema},
  prompt: `Based on the user's mood and the current weather conditions, recommend a clothing combination from the following available clothing items.

Mood: {{{moodKeywords}}}
Weather: {{{weatherInformation}}}
Clothing Items: {{#each clothingKeywords}}{{{this}}}, {{/each}}

Consider the mood and weather to suggest the most suitable outfit.  Explain your reasoning in a few sentences.
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
