import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model configuration
export const GPT_MODEL = 'gpt-4-turbo-preview';
export const GPT_MODEL_FALLBACK = 'gpt-3.5-turbo';
export const MAX_TOKENS = 2000;
export const TEMPERATURE = 0.7;

// Cost per 1K tokens (approximate)
export const PRICING = {
  'gpt-4-turbo-preview': {
    input: 0.01,
    output: 0.03,
  },
  'gpt-3.5-turbo': {
    input: 0.0005,
    output: 0.0015,
  },
};


