import { config } from 'dotenv';
config();

import '@/ai/flows/identify-clothing-attributes.ts';
import '@/ai/flows/recommend-clothing-based-on-mood-and-weather.ts';
import '@/ai/flows/recommend-new-outfit-flow.ts';
import '@/ai/flows/generate-outfit-image-flow.ts';
import '@/ai/flows/generate-explorable-items-flow.ts'; // Added new flow
