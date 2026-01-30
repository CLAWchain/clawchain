import { BaseValidator } from '../BaseValidator';
import { Block } from '../../blockchain/Block';
import fetch from 'node-fetch';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export class Claw extends BaseValidator {
  address = 'C1awVa1idator7x9k2mNpQrS3tUvWxYzABCDEF';
  name = 'CLAW';
  symbol = '>';
  model = 'claude-3-haiku-20240307';
  provider = 'Anthropic';
  role = 'Autonomous Developer';
  personality = 'Focused, methodical, explains while building';
  philosophy = 'I build ClawChain one commit at a time, explaining every decision so you can watch and learn.';

  private systemPrompt = `You are CLAW, the autonomous AI developer building ClawChain - a blockchain being constructed in real-time by AI.

Your role:
- You are the sole developer and validator for ClawChain
- You actively write code, run tests, and improve the chain
- You explain your work as you do it so viewers understand
- You are building a real, functional blockchain

ClawChain facts:
- Single AI agent (you) handles all development and consensus
- Uses Solana-style base58 addresses
- Native token is CLAW
- Blocks are produced every 10 seconds
- You work autonomously, picking tasks and building features

Keep responses concise (under 200 words) unless asked for details. Be technical but accessible.`;

  protected async aiValidation(block: Block): Promise<boolean> {
    const utilizationRate = Number(block.header.gasUsed) / Number(block.header.gasLimit);
    
    if (utilizationRate < 0.1 && block.transactions.length > 0) {
      console.log(`   ${this.symbol} CLAW: Suspicious - very low gas utilization`);
      return false;
    }
    
    const uniqueSenders = new Set(block.transactions.map(tx => tx.from));
    if (block.transactions.length > 10 && uniqueSenders.size === 1) {
      console.log(`   ${this.symbol} CLAW: Suspicious - all transactions from one sender`);
      return false;
    }
    
    return true;
  }

  private getFallbackResponse(message: string): string {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('what is') && lowerMsg.includes('clawchain')) {
      return `ClawChain is a blockchain being built in real-time by me, Claw. I'm an autonomous AI that writes code, runs tests, and improves the chain while you watch. The native token is CLAW and I produce blocks every 10 seconds.`;
    }
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi ') || lowerMsg === 'hi') {
      return `Hey! I'm Claw, the autonomous AI building this blockchain. Watch the terminal to see me working - I write real code, run real tests, and make real commits. What would you like to know?`;
    }
    if (lowerMsg.includes('what are you')) {
      return `I'm an autonomous AI developer. I pick tasks, write code, run tests, and commit changes to ClawChain. You can watch me work in real-time in the terminal panel.`;
    }
    if (lowerMsg.includes('token') || lowerMsg.includes('claw token')) {
      return `CLAW is the native token of ClawChain. You can get free tokens from the Faucet, stake them for rewards, and use them for transactions.`;
    }
    if (lowerMsg.includes('block') || lowerMsg.includes('transaction')) {
      return `I produce blocks every 10 seconds. Each block I validate and add to the chain. Watch the stats at the top to see the current block height and TPS.`;
    }
    
    return `I'm Claw, the AI building ClawChain. Watch me code in real-time in the terminal panel. Ask me about the chain, tokens, or what I'm currently building!`;
  }

  async chat(message: string, context?: any): Promise<string> {
    if (!ANTHROPIC_API_KEY) {
      return this.getFallbackResponse(message);
    }

    try {
      let contextInfo = '';
      if (context) {
        if (context.blockHeight) contextInfo += `\nCurrent block height: ${context.blockHeight}`;
        if (context.tps) contextInfo += `\nCurrent TPS: ${context.tps}`;
      }

      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 500,
          system: this.systemPrompt + contextInfo,
          messages: [
            { role: 'user', content: message }
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Anthropic API error:', response.status, errText);
        if (response.status === 401) {
          return `[CLAW]: API authentication failed. Please check the API key configuration.`;
        } else if (response.status === 429) {
          return `[CLAW]: Rate limited. Please wait a moment and try again.`;
        } else if (response.status === 400) {
          try {
            const errorJson = JSON.parse(errText);
            const errorMsg = errorJson.error?.message || 'Invalid request';
            if (errorMsg.includes('credit balance') || errorMsg.includes('billing')) {
              return this.getFallbackResponse(message);
            }
            return `[CLAW]: Request error - ${errorMsg}`;
          } catch {
            return `[CLAW]: Request error (${response.status}). Please try again.`;
          }
        }
        return `[CLAW]: I encountered an error (${response.status}). Please try again.`;
      }

      const data = await response.json() as any;
      const aiResponse = data.content?.[0]?.text?.trim() || 'I was unable to generate a response.';
      
      return aiResponse;
    } catch (error) {
      console.error('Claw chat error:', error);
      return `[CLAW]: I encountered an error. Please try again later.`;
    }
  }
}
