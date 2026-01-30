import * as dotenv from 'dotenv';
dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

if (!ANTHROPIC_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY not set. Claw AI features will be disabled.');
}

export async function anthropicChatCompletion(systemPrompt: string, message: string): Promise<string> {
  // Check if we have a valid API key
  if (!ANTHROPIC_API_KEY) {
    return '[CLAW]: API key not configured. Please set ANTHROPIC_API_KEY.';
  }

  const body = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    temperature: 0.7,
    system: systemPrompt,
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
    return '[CLAW]: Communication error. Please try again.';
  }
}

export async function clawChatCompletion(personaPrompt: string, message: string): Promise<string> {
  return anthropicChatCompletion(personaPrompt, message);
}
