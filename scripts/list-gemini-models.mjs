/**
 * Discover available Gemini models — run via: node --env-file=.env.local scripts/list-gemini-models.mjs
 */
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('GEMINI_API_KEY not set'); process.exit(1); }

const ai = new GoogleGenAI({ apiKey });

console.log('Listing available Gemini models that support generateContent...\n');

try {
  const pager = await ai.models.list();
  const generateModels = [];
  for await (const model of pager) {
    if (model.supportedActions?.includes('generateContent')) {
      generateModels.push(model.name);
    }
  }
  if (generateModels.length === 0) {
    console.log('No generateContent models found. Raw listing:');
    const pager2 = await ai.models.list();
    for await (const m of pager2) {
      console.log(' -', m.name, '|', m.supportedActions?.join(', '));
    }
  } else {
    console.log('Models supporting generateContent:');
    generateModels.forEach(m => console.log(' -', m));
  }
} catch (err) {
  console.error('Failed to list models:', err.message);
  process.exit(1);
}

