import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. AI personality features will be disabled.');
}

export async function openaiChatCompletion(personaPrompt: string, message: string) {
  // Check if we have a valid API key
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required. Please set a valid OpenAI API key in your .env file.');
  }

  // Use OpenAI API
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: personaPrompt },
      { role: 'user', content: message },
    ],
    max_tokens: 200,
    temperature: 0.8,
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errTxt = await response.text();
      console.error('OpenAI API error:', errTxt);
      throw new Error(`OpenAI API request failed: ${errTxt}`);
    }
    
    const data = await response.json();
    const aiResponse = (data as any).choices?.[0]?.message?.content?.trim() || '(no response)';
    
    return aiResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}