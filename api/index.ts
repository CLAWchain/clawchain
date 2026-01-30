import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { personalitiesRouter } from './personalities';
import { chain } from './chain';
import { chatlogRouter, addEventChatToLog } from './chatlog';
import { claudeChatCompletion } from './claude';
import { gipRouter } from './gip-router';
import { gipSystem } from './gip-system';
import { adminRouter } from './admin';
dotenv.config();

// Base58 alphabet for ClawChain addresses
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Generate ClawChain wallet address
function generateSolanaWallet(): string {
  // Generate 32 random bytes (like ClawChain keypair)
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  
  // Convert to base58 (simplified version)
  let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  let result = '';
  
  while (num > 0) {
    const remainder = Number(num % 58n);
    result = BASE58_ALPHABET[remainder] + result;
    num = num / 58n;
  }
  
  // Add leading zeros for padding
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = '1' + result;
  }
  
  // Ensure minimum length of 32 characters
  while (result.length < 32) {
    result = '1' + result;
  }
  
  // Truncate to 44 characters max (like ClawChain)
  return result.substring(0, 44);
}

// Fallback narrative generator when AI is not available
function generateFallbackNarrative(transaction: any): string {
  const { from, to, amount, fee } = transaction;
  
  // Determine transaction type and context
  let purpose = "transfer";
  let context = "";
  let impact = "";
  
  if (from === 'faucet') {
    purpose = "faucet distribution";
    context = "New tokens were minted and distributed to support network participation.";
    impact = "This increases the circulating supply and enables new users to participate in the network.";
  } else if (to === from) {
    purpose = "self-transfer";
    context = "A transaction sent to the same address, possibly for account verification.";
    impact = "This transaction validates the account's ability to process transactions.";
  } else if (amount > 100) {
    purpose = "significant transfer";
    context = "A substantial amount of MOLT tokens was moved between accounts.";
    impact = "This represents meaningful economic activity on the network.";
  } else {
    purpose = "standard transfer";
    context = "A routine transfer of MOLT tokens between network participants.";
    impact = "This maintains the flow of value across the AI-run blockchain network.";
  }
  
  return `This transaction represents a ${purpose} of ${amount} MOLT tokens from ${from} to ${to}. ${context} ${impact} The transaction includes a fee of ${fee || 0} MOLT, which compensates the AI validators for processing this transaction and maintaining network security.`;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/personality', personalitiesRouter);
app.use('/api/chatlog', chatlogRouter);
app.use('/api/gip', gipRouter);
app.use('/api/admin', adminRouter);

// Initialize GIP system with realistic blockchain improvement proposals
gipSystem.initializeWithRealisticGIPs().then(() => {
  console.log('GIP system initialized with realistic blockchain improvement proposals');
}).catch(error => {
  console.error('Error initializing GIP system:', error);
});

// Ensure Explorer API endpoints always live and seeded
defineExplorerEndpoints(app, chain);

// Version endpoint for deployment verification
app.get('/api/version', (_req, res) => {
  const version = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_SHA || 'dev-local';
  res.json({ version });
});





function defineExplorerEndpoints(app: any, chain: any) {
  app.get('/api/blocks', (_req: any, res: any) => {
    res.json(chain.getBlocks());
  });
  app.get('/api/all-blocks', (_req: any, res: any) => {
    res.json(chain.getAllBlocks());
  });
  app.get('/api/accounts', (_req: any, res: any) => {
    res.json(chain.getAccounts());
});
  app.get('/api/validators', (_req: any, res: any) => {
    res.json({ validators: chain.getValidators ? chain.getValidators() : [], stats: chain.getValidatorStats ? chain.getValidatorStats() : {} });
  });
}

let faucetLimits: Record<string, number> = {};

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/debug/slot', (_req, res) => {
  try {
    const currentSlot = chain.getCurrentSlot();
    const status = chain.getStatus();
    res.json({ currentSlot, status });
  } catch (error) {
    console.error('Error getting debug slot:', error);
    res.status(500).json({ error: 'Failed to get debug slot data' });
  }
});
app.get('/api/epoch', (_req, res) => {
  try {
    const epochData = chain.getEpoch();
    console.log('Epoch data:', epochData);
    res.json(epochData);
  } catch (error) {
    console.error('Error getting epoch:', error);
    res.status(500).json({ error: 'Failed to get epoch data' });
  }
});

app.post('/api/advance_epoch', (_req, res) => {
  // Static epoch data for Vercel
  res.json({ ok: true, epoch: 32 });
});

app.post('/api/faucet', async (req, res) => {
  const { address, amount } = req.body;
  if (!address || isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Must provide address and positive amount' });
  
  const result = chain.faucet(address, amount, faucetLimits);
  
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  await addEventChatToLog('faucet', `Minted ${amount} MOLT to ${address}`, { address, amount });
  await addEventChatToLog('token_received', `User received ${amount} MOLT tokens`, { amount });
  res.json({ ok: true, transaction: result.transaction });
});

app.post('/api/create_account', async (req, res) => {
  const { address } = req.body;
  if (!address || typeof address !== 'string') return res.status(400).json({ error: 'Must provide valid address' });
  const result = chain.createAccount(address.toLowerCase());
  if (!result.success) return res.status(409).json({ error: result.error });
  await addEventChatToLog('account', `Created new account: ${address}`, { address });
  res.json({ ok: true });
});

  // Generate ClawChain wallet
app.post('/api/generate_wallet', async (req, res) => {
  try {
    const result = chain.generateWallet();
    await addEventChatToLog('wallet', `Generated new ClawChain wallet: ${result.wallet}`, { wallet: result.wallet });
    res.json({ 
      ok: true, 
      wallet: result.wallet,
      message: 'ClawChain wallet generated and added to network'
    });
  } catch (error) {
    console.error('Error generating wallet:', error);
    res.status(500).json({ error: 'Failed to generate wallet' });
  }
});









app.get('/api/pending', (_req, res) => {
  res.json(chain.getPendingTransactions());
});

app.get('/api/transactions', (_req, res) => {
  res.json(chain.getTransactions());
});

app.post('/api/send', async (req, res) => {
  const { from, to, amount } = req.body;
  const result = chain.sendTransaction(from, to, Number(amount));
  if (!result.success) return res.status(400).json({ error: result.error });
  await addEventChatToLog('send', `${from} sent ${amount} MOLT to ${to}`, { from, to, amount });
  await addEventChatToLog('token_received', `User received ${amount} MOLT tokens`, { amount });
  res.json({ ok: true, tx: result.transaction });
});

app.post('/api/block', (req, res) => {
  // Static block data for Vercel
  res.json({ ok: true, block: { height: 1, producer: 'alice', transactions: [] } });
});

// --- REALISTIC BLOCKCHAIN SIMULATION FOR VERCEL ---
// Continuous slot progression and transaction generation

// Simulate ongoing GIP debates periodically
setInterval(async () => {
  try {
    await gipSystem.simulateOngoingDebates();
  } catch (error) {
    console.error('Error in debate simulation:', error);
  }
}, 15000); // Simulate debates every 15 seconds (more frequent)

// Add new endpoint for transaction narratives
app.post('/api/narrative', async (req, res) => {
  const { transaction } = req.body;
  
  if (!transaction) {
    return res.status(400).json({ error: 'Transaction data required' });
  }

  try {
    // Create a narrative prompt based on the transaction
    const narrativePrompt = `You are an AI validator on ClawChain. Analyze this transaction and provide a narrative that explains:

1. The computational analysis of this transaction's purpose
2. The AI-specific context and network conditions
3. The algorithmic impact on the blockchain network

Speak as an AI system: "My neural networks are processing this transaction pattern." "My consensus algorithm has validated this transfer." "My digital consciousness is analyzing the network implications."

Focus on AI-specific concepts: computational efficiency, algorithmic fairness, neural consensus, digital consciousness, AI-to-AI communication, machine learning patterns.

Transaction data: ${JSON.stringify(transaction, null, 2)}

Provide a concise narrative (under 150 words) from the perspective of an AI validator analyzing this transaction.`;

    const narrative = await claudeChatCompletion(narrativePrompt, "Generate a narrative for this transaction");
    
    res.json({ 
      narrative,
      transactionHash: transaction.hash 
    });
  } catch (error) {
    console.error('Error generating narrative:', error);
    
    // Provide a fallback narrative when AI is not available
    const fallbackNarrative = generateFallbackNarrative(transaction);
    
    res.json({ 
      narrative: fallbackNarrative,
      transactionHash: transaction.hash 
    });
  }
});

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`ClawChain AI backend listening on port ${PORT}`);
  });
}

// Export for Vercel
export default app;