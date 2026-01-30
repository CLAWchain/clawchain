"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlockWithAI = validateBlockWithAI;
exports.clearValidationCache = clearValidationCache;
exports.getValidationStats = getValidationStats;
const StateManager_1 = require("./StateManager");
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// Validation cache to avoid re-validating same blocks
const validationCache = new Map();
// Analyze transactions for suspicious patterns
function analyzeTransactions(transactions) {
    const concerns = [];
    // Check for wash trading (same from/to with slight variations)
    const fromAddresses = new Set(transactions.map(tx => tx.from));
    const toAddresses = new Set(transactions.map(tx => tx.to));
    const overlap = [...fromAddresses].filter(a => toAddresses.has(a));
    if (overlap.length > transactions.length * 0.3) {
        concerns.push('High overlap between senders and receivers - possible wash trading');
    }
    // Check for identical transaction patterns
    const valueFrequency = new Map();
    for (const tx of transactions) {
        const key = tx.value.toString();
        valueFrequency.set(key, (valueFrequency.get(key) || 0) + 1);
    }
    const maxFreq = Math.max(...valueFrequency.values());
    if (maxFreq > transactions.length * 0.5 && transactions.length > 5) {
        concerns.push('Many transactions with identical values - possible bot activity');
    }
    // Check gas prices
    const gasPrices = transactions.map(tx => tx.gasPrice);
    const avgGas = gasPrices.reduce((a, b) => a + b, 0n) / BigInt(gasPrices.length || 1);
    const highGas = gasPrices.filter(g => g > avgGas * 10n);
    if (highGas.length > 0) {
        concerns.push(`${highGas.length} transactions with unusually high gas prices`);
    }
    // Summary
    const totalValue = transactions.reduce((sum, tx) => sum + tx.value, 0n);
    const summary = `${transactions.length} transactions, total value: ${totalValue.toString()}, unique senders: ${fromAddresses.size}`;
    return { summary, concerns };
}
// Validate block using AI
async function validateBlockWithAI(block, previousBlock) {
    // Check cache first
    const cached = validationCache.get(block.header.hash);
    if (cached) {
        return cached;
    }
    // If no API key, use heuristic validation
    if (!ANTHROPIC_API_KEY) {
        console.log('[AI] No API key - using heuristic validation');
        return heuristicValidation(block, previousBlock);
    }
    try {
        const txAnalysis = analyzeTransactions(block.transactions);
        const stateRoot = StateManager_1.stateManager.getStateRoot();
        const prompt = `You are an AI validator for ClawChain, a Solana-style blockchain. Analyze this block and determine if it should be accepted.

BLOCK DATA:
- Height: ${block.header.height}
- Hash: ${block.header.hash}
- Parent Hash: ${block.header.parentHash}
- Producer: ${block.header.producer}
- Timestamp: ${new Date(block.header.timestamp).toISOString()}
- Gas Used: ${block.header.gasUsed}
- State Root: ${block.header.stateRoot}
- Transaction Summary: ${txAnalysis.summary}

ANALYSIS CONCERNS:
${txAnalysis.concerns.length > 0 ? txAnalysis.concerns.join('\n') : 'None detected'}

${previousBlock ? `PREVIOUS BLOCK:
- Height: ${previousBlock.header.height}
- Hash: ${previousBlock.header.hash}
- Timestamp: ${new Date(previousBlock.header.timestamp).toISOString()}
- Time since last block: ${block.header.timestamp - previousBlock.header.timestamp}ms` : 'This is the first block after genesis.'}

CURRENT STATE ROOT: ${stateRoot}

Respond with a JSON object (no markdown):
{
  "valid": boolean,
  "confidence": number between 0 and 1,
  "reasoning": "brief explanation",
  "warnings": ["array of any warnings"],
  "suspiciousPattern": boolean,
  "unusualGasUsage": boolean,
  "potentialAttack": boolean,
  "stateInconsistency": boolean
}`;
        const response = await fetch(ANTHROPIC_API_URL, {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                temperature: 0.1,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        if (!response.ok) {
            console.error('[AI] API error, falling back to heuristic');
            return heuristicValidation(block, previousBlock);
        }
        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('[AI] Failed to parse response, falling back to heuristic');
            return heuristicValidation(block, previousBlock);
        }
        const parsed = JSON.parse(jsonMatch[0]);
        const result = {
            valid: parsed.valid ?? true,
            confidence: parsed.confidence ?? 0.8,
            reasoning: parsed.reasoning || 'AI validation completed',
            warnings: parsed.warnings || [],
            flags: {
                suspiciousPattern: parsed.suspiciousPattern ?? false,
                unusualGasUsage: parsed.unusualGasUsage ?? false,
                potentialAttack: parsed.potentialAttack ?? false,
                stateInconsistency: parsed.stateInconsistency ?? false
            }
        };
        // Cache result
        validationCache.set(block.header.hash, result);
        console.log(`[AI] Block ${block.header.height} validation: ${result.valid ? 'VALID' : 'INVALID'} (${(result.confidence * 100).toFixed(0)}% confidence)`);
        if (result.warnings.length > 0) {
            console.log(`[AI] Warnings: ${result.warnings.join(', ')}`);
        }
        return result;
    }
    catch (error) {
        console.error('[AI] Validation error:', error);
        return heuristicValidation(block, previousBlock);
    }
}
// Heuristic validation when AI is unavailable
function heuristicValidation(block, previousBlock) {
    const warnings = [];
    let valid = true;
    // Check timestamp
    if (previousBlock && block.header.timestamp <= previousBlock.header.timestamp) {
        valid = false;
        warnings.push('Timestamp not greater than previous block');
    }
    // Check height
    if (previousBlock && block.header.height !== previousBlock.header.height + 1) {
        valid = false;
        warnings.push('Height mismatch');
    }
    // Check parent hash
    if (previousBlock && block.header.parentHash !== previousBlock.header.hash) {
        valid = false;
        warnings.push('Parent hash mismatch');
    }
    // Check gas limit
    if (block.header.gasUsed > block.header.gasLimit) {
        valid = false;
        warnings.push('Gas used exceeds gas limit');
    }
    // Analyze transactions
    const txAnalysis = analyzeTransactions(block.transactions);
    if (txAnalysis.concerns.length > 0) {
        warnings.push(...txAnalysis.concerns);
    }
    // Check for empty producer
    if (!block.header.producer) {
        valid = false;
        warnings.push('No block producer specified');
    }
    const result = {
        valid,
        confidence: valid ? 0.9 : 0.95,
        reasoning: valid ? 'Passed heuristic validation checks' : `Failed: ${warnings.join(', ')}`,
        warnings,
        flags: {
            suspiciousPattern: txAnalysis.concerns.length > 2,
            unusualGasUsage: block.header.gasUsed > block.header.gasLimit * 8n / 10n,
            potentialAttack: !valid,
            stateInconsistency: false
        }
    };
    console.log(`[AI] Heuristic validation: ${result.valid ? 'VALID' : 'INVALID'}`);
    return result;
}
// Clear validation cache (called on chain reorg)
function clearValidationCache() {
    validationCache.clear();
    console.log('[AI] Validation cache cleared');
}
// Get validation stats
function getValidationStats() {
    const results = Array.from(validationCache.values());
    return {
        cachedBlocks: results.length,
        validBlocks: results.filter(r => r.valid).length,
        invalidBlocks: results.filter(r => !r.valid).length
    };
}
console.log('[AI] AI Validator loaded', ANTHROPIC_API_KEY ? '(API key configured)' : '(heuristic mode)');
//# sourceMappingURL=AIValidator.js.map