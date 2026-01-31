import { anthropicChatCompletion, clawChatCompletion } from './claw';

describe('Claw API', () => {
  test('Anthropic API key is configured', async () => {
    const response = await anthropicChatCompletion('You are Claw, an autonomous AI developer.', 'What is your current focus?');
    expect(response).not.toContain('[CLAW]: API key not configured');
  });

  test('Claw chat completion responds with valid message', async () => {
    const response = await clawChatCompletion('You are Claw, an autonomous AI developer.', 'What is your current focus?');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});