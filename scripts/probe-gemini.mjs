/**
 * Updated Gemini probe using confirmed available model.
 * Run via: node --env-file=.env.local scripts/probe-gemini.mjs
 */
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('GEMINI_API_KEY not set.'); process.exit(1); }

const ai = new GoogleGenAI({ apiKey });

// Use confirmed available model
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
console.log(`Testing Gemini model: ${modelName}`);

try {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: 'Say PONG in exactly one word.',
  });
  const text = response.text?.trim();
  if (text && text.length > 0) {
    console.log(`Gemini response: "${text}"`);
    console.log('Gemini connectivity: OK');
  } else {
    console.error('Gemini returned empty response.');
    process.exit(1);
  }
} catch (err) {
  console.error('Gemini connectivity FAILED:', err.message);
  process.exit(1);
}
