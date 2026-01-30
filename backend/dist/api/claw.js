"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.anthropicChatCompletion = anthropicChatCompletion;
exports.clawChatCompletion = clawChatCompletion;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
if (!ANTHROPIC_API_KEY) {
    console.warn('Warning: ANTHROPIC_API_KEY not set. Claw AI features will be disabled.');
}
async function anthropicChatCompletion(systemPrompt, message) {
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
        const aiResponse = data.content?.[0]?.text?.trim() || '(no response)';
        return aiResponse;
    }
    catch (error) {
        console.error('Anthropic API error:', error);
        return '[CLAW]: Communication error. Please try again.';
    }
}
async function clawChatCompletion(personaPrompt, message) {
    return anthropicChatCompletion(personaPrompt, message);
}
//# sourceMappingURL=claw.js.map