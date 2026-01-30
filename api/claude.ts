import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

if (!ANTHROPIC_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY not set. Claude AI features will be disabled.');
}

export async function claudeChatCompletion(personaPrompt: string, message: string) {
  // Check if we have a valid API key
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required. Please set a valid Anthropic API key in your .env file.');
  }
  
  const body = {
    model: 'claude-3-opus-20240229',
    max_tokens: 200,
    system: personaPrompt,
    messages: [
      { role: 'user', content: message },
    ],
  };

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errTxt = await response.text();
      console.error('Anthropic API error:', errTxt);
      throw new Error(`Anthropic API request failed: ${errTxt}`);
    }
    
    const data = await response.json();
    const aiResponse = (data as any).content?.[0]?.text?.trim() || '(no response)';
    
    return aiResponse;
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
}
