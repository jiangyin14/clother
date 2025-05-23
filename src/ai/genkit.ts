import {genkit} from 'genkit';

// Define SiliconFlow API constants
export const SILICONFLOW_API_BASE_URL = process.env.SILICONFLOW_API_BASE_URL || 'https://api.siliconflow.com/v1';
export const SILICONFLOW_VL_MODEL = process.env.SILICONFLOW_VL_MODEL || 'siliconflow-vl-model';
export const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'YOUR_SILICONFLOW_API_KEY';
export const SILICONFLOW_TEXT_MODEL = process.env.SILICONFLOW_TEXT_MODEL || 'Pro/deepseek-ai/DeepSeek-V3';