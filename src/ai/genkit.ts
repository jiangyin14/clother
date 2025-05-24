import {genkit} from 'genkit';

// Define SiliconFlow API constants
export const SILICONFLOW_API_BASE_URL = process.env.SILICONFLOW_API_BASE_URL;
export const SILICONFLOW_VL_MODEL = process.env.SILICONFLOW_VL_MODEL;
export const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
export const SILICONFLOW_TEXT_MODEL = process.env.SILICONFLOW_TEXT_MODEL;
export const SILICONFLOW_IMAGE_MODEL = process.env.SILICONFLOW_IMAGE_MODEL;

if (!SILICONFLOW_API_BASE_URL) {
  console.warn('SILICONFLOW_API_BASE_URL is not set. Please set it in your .env file.');
}
if (!SILICONFLOW_VL_MODEL) {
  console.warn('SILICONFLOW_VL_MODEL is not set. Please set it in your .env file.');
}
if (!SILICONFLOW_API_KEY || SILICONFLOW_API_KEY === 'YOUR_SILICONFLOW_API_KEY') {
  console.warn('SILICONFLOW_API_KEY is not set or is a placeholder. Please set it in your .env file.');
}
if (!SILICONFLOW_TEXT_MODEL) {
  console.warn('SILICONFLOW_TEXT_MODEL is not set. Please set it in your .env file.');
}
if (!SILICONFLOW_IMAGE_MODEL) {
  console.warn('SILICONFLOW_IMAGE_MODEL is not set. Please set it in your .env file.');
}
