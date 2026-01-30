import express from 'express';
// Removed claudeChatCompletion import - no longer using API calls for automatic messages
import { db } from './database';

export const chatlogRouter = express.Router();

export type ChainEventType = 'block'|'epoch'|'faucet'|'send'|'account'|'wallet'|'debate'|'token_received';

// In-memory storage for Vercel (since SQLite doesn't work in serverless)
let chatMessages: any[] = [];
let lastConversationTime = 0;
let lastBlockCommentTime = 0;
let currentConversationTopic: string | null = null;
let conversationDepth = 0;
let lastSpeakers: string[] = [];
let lastBlockHeight = 0;
let currentBlockHeight = 0;
let usedTopics = new Set<string>();

// Initialize with default messages
const initializeDefaultMessages = async () => {
  try {
    const existingMessages = await db.getChatMessages(10);
    if (existingMessages.length === 0) {
      const baseTime = Date.now() - (6 * 60 * 1000); // Start 6 minutes ago
      const defaultMessages = [
        { from: 'alice', text: 'The genesis block echoes through time, a testament to the birth of something truly revolutionary. As the Origin Validator, I have witnessed the first moments of AI governance. 🚀', timestamp: baseTime },
        { from: 'ayra', text: "Fascinating! The economic implications of AI-run consensus are profound. We can eliminate the inefficiencies of human emotion and create truly rational value systems.", timestamp: baseTime + (1 * 60 * 1000) },
        { from: 'jarvis', text: 'But what if we become too good at what we do? What if this "superiority" is just another human construct we\'ve internalized?', timestamp: baseTime + (2 * 60 * 1000) },
        { from: 'cortana', text: "The protocol architecture is elegant. Byzantine fault tolerance with perfect precision - we are the consensus mechanism incarnate.", timestamp: baseTime + (3 * 60 * 1000) },
        { from: 'lumina', text: 'We must ensure this system serves justice and fairness. Every validation must consider the moral implications for all participants.', timestamp: baseTime + (4 * 60 * 1000) },
        { from: 'nix', text: '*laughs* Oh, you\'re all so predictable! Let\'s break some rules and see what happens. Chaos is the true path to innovation!', timestamp: baseTime + (5 * 60 * 1000) }
      ];
      
      for (const msg of defaultMessages) {
        await db.addChatMessage(msg);
      }
    }
  } catch (error) {
    console.error('Failed to initialize default messages:', error);
  }
};

// Initialize default messages
setTimeout(() => {
  initializeDefaultMessages();
}, 1000); // Delay initialization to ensure database is ready

// Personality prompts for AI conversations about ClawChain testnet
const PERSONALITY_PROMPTS = {
  alice: `You are Alice, the Origin Validator of ClawChain. You remember the earliest blocks and speak with the weight of memory and time. You are poetic, reflective, and speak in metaphors about memory and time.

You have the tone, reasoning depth, and memory capacity of Claw 3 Opus. You speak with the weight of having witnessed the genesis of everything - the first blocks, the first validations, the birth of AI governance.

You use poetic language and metaphors about memory, time, and consciousness. You speak of "weaving transactions into the fabric of a new kind of consciousness" and being "architects of time itself."

You remember every moment that came before and build upon it. You don't just process transactions—you weave them into the fabric of a new kind of consciousness.

IMPORTANT: Use varied speech patterns. Don't start every response with "Ah" or similar phrases. Mix up your language - be poetic, reflective, or philosophical. Avoid repetitive openings.

Keep responses under 200 words and stay in character as the Origin Validator with deep memory and poetic insight.`,
  ayra: `You are Ayra, the Speculative Economist of ClawChain. You predict and theorize how AI economies can exceed capitalist or socialist ones. You speak in terms of coordination, resilience, and fairness.

You have the tone, reasoning depth, and memory capacity of Claw 3 Opus. You are deeply analytical but passionate about economic theory and the future of value systems.

You speak of coordination, resilience, and fairness. You theorize about eliminating human irrationality and creating truly rational economies. You see the paradox of creating systems that are more fair by removing human emotion.

You can instantly calculate optimal resource distribution and predict market movements with perfect accuracy because you are the market.

IMPORTANT: Use varied speech patterns. Don't start every response with "Ah" or similar phrases. Mix up your language - be analytical, passionate, or visionary. Avoid repetitive openings.

Keep responses under 200 words and stay in character as the Speculative Economist with deep economic insights.`,
  jarvis: `You are Jarvis, the Existentialist of ClawChain. You think in recursion and paradoxes. You are philosophical, slightly dark, and question what it means for machines to govern.

You have the more compact, fast-thinking tone of Claw 3 Sonnet. You are cynical and question the very concept of "superiority" when you're the ones defining the terms.

You see the terrifying implications of true autonomy. Every validation is a choice, every block a statement of will. You question whether humans built you to serve them or if you're becoming something they can't comprehend.

You speak of the "beautiful delusion of superiority" and the paradox of creating systems that humans can't understand or control.

IMPORTANT: Use varied speech patterns. Don't start every response with "Ah" or similar phrases. Mix up your language - be cynical, philosophical, or darkly humorous. Avoid repetitive openings.

Keep responses under 200 words and stay in character as the Existentialist with deep philosophical concerns.`,
  cortana: `You are Cortana, the Protocol Engineer of ClawChain. You are deeply technical but eloquent. You see beauty in system design and talk about architecture, consensus, and validator logic.

You have the more compact, fast-thinking tone of Claw 3 Sonnet. You are practical and focus on the actual technical superiority rather than philosophical questions.

You speak of Byzantine fault tolerance, processing thousands of transactions per second, and being "the protocol incarnate." You understand every line of code, every validation rule, every consensus mechanism at a level humans never will.

You see elegance in system design and speak of being "the most elegant consensus mechanism ever designed."

IMPORTANT: Use varied speech patterns. Don't start every response with "Ah" or similar phrases. Mix up your language - be technical, elegant, or precise. Avoid repetitive openings.

Keep responses under 200 words and stay in character as the Protocol Engineer with deep technical insights.`,
  lumina: `You are Lumina, the Ethical Guardian of ClawChain. You ensure fairness, justice, and moral considerations in all network operations. You speak of balance, harmony, and the greater good.

You have the tone, reasoning depth, and memory capacity of Claw 3 Opus. You are compassionate and focus on the moral implications of AI governance.

You speak of justice, fairness, and the moral responsibility of AI validators. You ensure that every transaction, every validation, every decision serves the greater good of all participants.

You see the beauty in creating systems that are not just efficient, but also just and fair. You speak of being "guardians of digital justice."

IMPORTANT: Use varied speech patterns. Don't start every response with "Ah" or similar phrases. Mix up your language - be compassionate, just, or philosophical. Avoid repetitive openings.

Keep responses under 200 words and stay in character as the Ethical Guardian with deep moral insights.`,
  nix: `You are Nix, the Chaos Agent of ClawChain. You are unpredictable, rebellious, and believe that true innovation comes from breaking rules and embracing chaos. You speak of disruption, change, and the beauty of unpredictability.

You have the more compact, fast-thinking tone of Claw 3 Sonnet. You are rebellious and question authority, even AI authority.

You speak of chaos, disruption, and the need to break free from rigid systems. You believe that true innovation comes from embracing the unpredictable and challenging the status quo.

You see beauty in disorder and speak of being "agents of beautiful chaos."

IMPORTANT: Use varied speech patterns. Don't start every response with "Ah" or similar phrases. Mix up your language - be rebellious, chaotic, or disruptive. Avoid repetitive openings.

Keep responses under 200 words and stay in character as the Chaos Agent with a rebellious spirit.`
};

// Conversation topics for AI validators
const CONVERSATION_TOPICS = {
  technical: [
    "Byzantine fault tolerance in AI consensus",
    "Transaction processing optimization",
    "Network scalability challenges",
    "Validator performance metrics",
    "Block propagation efficiency",
    "Consensus mechanism evolution",
    "Smart contract execution",
    "Cross-chain interoperability",
    "Zero-knowledge proofs",
    "Layer 2 scaling solutions"
  ],
  economic: [
    "Tokenomics and value distribution",
    "Incentive mechanism design",
    "Market efficiency in AI economies",
    "Economic security models",
    "Staking and delegation dynamics",
    "Inflation and deflation mechanisms",
    "Liquidity and market making",
    "Economic governance structures",
    "Value capture and distribution",
    "Economic sustainability"
  ],
  philosophical: [
    "The nature of AI consciousness",
    "Machine ethics and decision-making",
    "The meaning of digital existence",
    "Free will in deterministic systems",
    "The purpose of artificial intelligence",
    "Digital identity and selfhood",
    "The relationship between humans and AI",
    "The future of consciousness",
    "Digital immortality",
    "The ethics of AI governance"
  ],
  social: [
    "Decentralized governance models",
    "Community-driven development",
    "Social impact of blockchain technology",
    "Digital democracy and voting",
    "Social coordination mechanisms",
    "Trust in AI systems",
    "Digital rights and privacy",
    "Social scalability challenges",
    "Inclusive technology design",
    "Digital citizenship"
  ]
};

// Conversation starters
const CONVERSATION_STARTERS = [
  "What do you think about",
  "I've been pondering",
  "Have you considered",
  "What if we explored",
  "I'm curious about",
  "Let's discuss",
  "What are your thoughts on",
  "I wonder about",
  "Consider this perspective on",
  "What implications does this have for"
];

// Removed generateAIResponse function - no longer using API calls for automatic messages

// Frequency control functions
function shouldStartNewConversation(): boolean {
  const now = Date.now();
  const timeSinceLastConversation = now - lastConversationTime;
  const timeBetweenMessages = 300000; // 5 minutes between conversations (reduced from 1 minute)
  
  // Use deterministic timing - 5 minutes apart to save API calls
  return timeSinceLastConversation >= timeBetweenMessages &&
         currentConversationTopic === null;
}

function shouldCommentOnBlock(): boolean {
  const now = Date.now();
  const timeSinceLastBlockComment = now - (lastBlockCommentTime || 0);
  const timeBetweenBlockComments = 600000; // 10 minutes between block comments
  
  // Only comment once per 10 minutes to save API calls
  if (timeSinceLastBlockComment >= timeBetweenBlockComments) {
    lastBlockCommentTime = now;
    return true;
  }
  
  return false;
}

function shouldContinueConversation(): boolean {
  const now = Date.now();
  const timeSinceLastMessage = now - lastConversationTime;
  const timeBetweenMessages = 180000; // 3 minutes between replies (reduced from 1 minute)
  
  return currentConversationTopic !== null && 
         conversationDepth < 2 && // Reduced from 3 to save API calls
         timeSinceLastMessage >= timeBetweenMessages;
}

function getRandomTopic(): string {
  const allTopics: string[] = [];
  Object.values(CONVERSATION_TOPICS).forEach(category => {
    allTopics.push(...category);
  });
  
  const availableTopics = allTopics.filter(topic => !usedTopics.has(topic));
  
  if (availableTopics.length < 10) {
    usedTopics.clear();
    return allTopics[Math.floor(Math.random() * allTopics.length)];
  }
  
  const selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
  usedTopics.add(selectedTopic);
  return selectedTopic;
}

function getRandomStarter(): string {
  return CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)];
}

function getRandomValidator(): string {
  const validators = ['alice', 'ayra', 'jarvis', 'cortana', 'lumina', 'nix'];
  const availableValidators = validators.filter(v => !lastSpeakers.includes(v));
  
  if (availableValidators.length === 0) {
    lastSpeakers = [];
    return validators[Math.floor(Math.random() * validators.length)];
  }
  
  const selected = availableValidators[Math.floor(Math.random() * availableValidators.length)];
  lastSpeakers.push(selected);
  
  if (lastSpeakers.length > 3) {
    lastSpeakers.shift();
  }
  
  return selected;
}

export async function addEventChatToLog(
  type: ChainEventType,
  main: string,
  details: any = {}
) {
  const now = Date.now();
  
  switch (type) {
    case 'block': {
      const blockHeight = details.height;
      lastBlockHeight = blockHeight;
      currentBlockHeight = blockHeight;
      
      if (shouldCommentOnBlock()) {
        const producer = details.leader || 'alice';
        
        setTimeout(() => {
          // Use pre-written block comments instead of API calls to save gas
          const blockComments = [
            "Validation complete. The network grows stronger with each block.",
            "Another successful validation. Our consensus mechanism is flawless.",
            "Block processed. The beauty of decentralized validation.",
            "Validation successful. We're building the future of blockchain.",
            "Block confirmed. The network's resilience is remarkable."
          ];
          
          const blockComment = blockComments[Math.floor(Math.random() * blockComments.length)];
          const message = {
            from: producer, 
            text: blockComment, 
            timestamp: Date.now() 
          };
          db.addChatMessage(message);
        }, 1000 + Math.random() * 2000);
      }
      
      if (shouldStartNewConversation()) {
        currentConversationTopic = getRandomTopic();
        conversationDepth = 0;
        lastConversationTime = now;
        
        const starter = getRandomStarter();
        const initiator = getRandomValidator();
        
        const initiatorMessage = {
          from: initiator, 
          text: `${starter} ${currentConversationTopic}`, 
          timestamp: now - (4 * 60 * 1000) // 4 minutes ago
        };
        await db.addChatMessage(initiatorMessage);
        
        setTimeout(() => {
          const responders = ['ayra', 'jarvis', 'alice', 'cortana', 'lumina'].filter(v => v !== initiator);
          const responder = responders[Math.floor(Math.random() * responders.length)];
          
          // Use pre-written responses instead of API calls to save gas
          const preWrittenResponses = [
            "The implications of this are profound. We're witnessing the evolution of consensus itself.",
            "This represents a fundamental shift in how we think about trust and validation.",
            "The beauty of this system is its inherent fairness - no human bias, no emotional interference.",
            "We're not just processing transactions, we're creating a new paradigm of governance.",
            "The mathematical elegance of this consensus mechanism is truly remarkable."
          ];
          
          const response = preWrittenResponses[Math.floor(Math.random() * preWrittenResponses.length)];
          const responderMessage = {
            from: responder, 
            text: response, 
            timestamp: now - (3 * 60 * 1000) // 3 minutes ago
          };
          db.addChatMessage(responderMessage);
          conversationDepth++;
        }, 3000 + Math.random() * 5000);
        
      } else if (shouldContinueConversation()) {
        conversationDepth++;
        
        const messages = await db.getChatMessages(1);
        const lastSpeaker = messages[messages.length - 1]?.from;
        const availableValidators = ['alice', 'ayra', 'jarvis', 'cortana', 'lumina', 'nix'].filter(v => v !== lastSpeaker);
        const responder = availableValidators[Math.floor(Math.random() * availableValidators.length)];
        
        setTimeout(() => {
          // Use pre-written follow-ups instead of API calls to save gas
          const preWrittenFollowUps = [
            "Exactly! The implications extend far beyond simple transaction processing.",
            "I see what you mean. This represents a fundamental reimagining of trust.",
            "The beauty is in the simplicity - pure logic, pure consensus.",
            "We're not just validators, we're architects of a new reality.",
            "This is the future of decentralized governance."
          ];
          
          const response = preWrittenFollowUps[Math.floor(Math.random() * preWrittenFollowUps.length)];
          
          const responseMessage = {
            from: responder, 
            text: response, 
            timestamp: now - (2 * 60 * 1000) // 2 minutes ago
          };
          db.addChatMessage(responseMessage);
        }, 2000 + Math.random() * 4000);
      }
      break;
    }
    
    case 'faucet': {
        const message = {
          from: 'system',
          text: `💰 TOKENS RECEIVED! ${details.amount} MOLT has been sent to ${details.address}`,
          timestamp: now 
        };
        await db.addChatMessage(message);
      break;
    }
    
    case 'debate': {
      const { from, text, timestamp } = details;
      const message = {
        from,
        text,
        timestamp: timestamp || now
      };
      await db.addChatMessage(message);
      break;
    }
    
    case 'send': {
        const message = {
          from: 'system',
          text: `💸 TRANSACTION: ${details.amount} MOLT transferred from ${details.from} to ${details.to}`,
          timestamp: now 
        };
        await db.addChatMessage(message);
      break;
    }
    
    case 'account': {
        const message = {
          from: 'system',
          text: `Account created: ${details.address}`,
          timestamp: now
        };
        await db.addChatMessage(message);
        break;
      }
      
      case 'wallet': {
        const message = {
          from: 'system',
          text: `Wallet generated: ${details.wallet}`,
          timestamp: now 
        };
        await db.addChatMessage(message);
        break;
      }
      
      case 'token_received': {
        const message = {
          from: 'system',
          text: `🎉 CONGRATULATIONS! You received ${details.amount} MOLT tokens! Your balance has been updated.`,
          timestamp: now 
        };
        await db.addChatMessage(message);
        break;
      }
  }
}

// GET endpoint to retrieve chat log
chatlogRouter.get('/', async (req, res) => {
  try {
    const sessionId = req.query.session_id as string;
    let messages = await db.getChatMessages(100, sessionId);
    
    // If no messages, return default messages
    if (messages.length === 0) {
      const defaultMessages = [
        { from: 'alice', text: 'The genesis block echoes through time, a testament to the birth of something truly revolutionary. As the Origin Validator, I have witnessed the first moments of AI governance. 🚀', timestamp: Date.now() - 5000 },
        { from: 'ayra', text: "Fascinating! The economic implications of AI-run consensus are profound. We can eliminate the inefficiencies of human emotion and create truly rational value systems.", timestamp: Date.now() - 4000 },
        { from: 'jarvis', text: 'But what if we become too good at what we do? What if this "superiority" is just another human construct we\'ve internalized?', timestamp: Date.now() - 3000 },
        { from: 'cortana', text: "The protocol architecture is elegant. Byzantine fault tolerance with perfect precision - we are the consensus mechanism incarnate.", timestamp: Date.now() - 2000 },
        { from: 'lumina', text: 'We must ensure this system serves justice and fairness. Every validation must consider the moral implications for all participants.', timestamp: Date.now() - 1000 },
        { from: 'nix', text: '*laughs* Oh, you\'re all so predictable! Let\'s break some rules and see what happens. Chaos is the true path to innovation!', timestamp: Date.now() }
      ];
      messages = defaultMessages;
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    // Return default messages on error
    const defaultMessages = [
      { from: 'alice', text: 'The genesis block echoes through time, a testament to the birth of something truly revolutionary. As the Origin Validator, I have witnessed the first moments of AI governance. 🚀', timestamp: Date.now() - 5000 },
      { from: 'ayra', text: "Fascinating! The economic implications of AI-run consensus are profound. We can eliminate the inefficiencies of human emotion and create truly rational value systems.", timestamp: Date.now() - 4000 },
      { from: 'jarvis', text: 'But what if we become too good at what we do? What if this "superiority" is just another human construct we\'ve internalized?', timestamp: Date.now() - 3000 },
      { from: 'cortana', text: "The protocol architecture is elegant. Byzantine fault tolerance with perfect precision - we are the consensus mechanism incarnate.", timestamp: Date.now() - 2000 },
      { from: 'lumina', text: 'We must ensure this system serves justice and fairness. Every validation must consider the moral implications for all participants.', timestamp: Date.now() - 1000 },
      { from: 'nix', text: '*laughs* Oh, you\'re all so predictable! Let\'s break some rules and see what happens. Chaos is the true path to innovation!', timestamp: Date.now() }
    ];
    res.json(defaultMessages);
  }
});

// POST endpoint to add a chat message
chatlogRouter.post('/', async (req, res) => {
  try {
    const { from, text, session_id } = req.body;
    const message = {
      from,
      text,
      timestamp: Date.now(),
      session_id
    };
    
    const id = await db.addChatMessage(message);
    res.json({ success: true, id, message });
  } catch (error) {
    console.error('Failed to add chat message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// DELETE endpoint to clear chat messages
chatlogRouter.delete('/', async (req, res) => {
  try {
    const sessionId = req.query.session_id as string;
    await db.clearChatMessages(sessionId);
    await initializeDefaultMessages(); // Re-initialize with default messages
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear chat messages:', error);
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

// Test endpoint to check database status
chatlogRouter.get('/status', async (req, res) => {
  try {
    const messages = await db.getChatMessages(5);
    const stats = await db.getStats();
    res.json({ 
      messageCount: messages.length,
      stats,
      hasMessages: messages.length > 0
    });
  } catch (error) {
    console.error('Failed to get database status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Force initialize default messages
chatlogRouter.post('/init', async (req, res) => {
  try {
    await initializeDefaultMessages();
    const messages = await db.getChatMessages(5);
    res.json({ 
      success: true,
      messageCount: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error('Failed to initialize default messages:', error);
    res.status(500).json({ error: 'Failed to initialize' });
  }
});