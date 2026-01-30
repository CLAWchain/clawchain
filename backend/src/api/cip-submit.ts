import { Router } from 'express';
import { db } from '../database/db';
import { anthropicChatCompletion } from './claw';

const cipSubmitRouter = Router();

interface CIPSubmission {
  title: string;
  summary: string;
  details: string;
  category: string;
  authorAddress: string;
}

// Profanity and spam patterns
const BLOCKED_PATTERNS = [
  /\b(fuck|shit|ass|bitch|damn|cunt|dick|cock|pussy|fag|nigger|retard)\b/i,
  /\b(buy now|click here|free money|guaranteed|limited time)\b/i,
  /(.)\1{5,}/, // Repeated characters (aaaaaaa)
  /^[^a-zA-Z]*$/, // No letters at all
  /(http|www\.|\.com|\.xyz|\.io)/i, // Links
];

// Minimum requirements
const MIN_TITLE_LENGTH = 10;
const MIN_SUMMARY_LENGTH = 50;
const MIN_DETAILS_LENGTH = 200;

// Validate basic requirements
const validateBasics = (submission: CIPSubmission): { valid: boolean; error?: string } => {
  if (!submission.title || submission.title.length < MIN_TITLE_LENGTH) {
    return { valid: false, error: `Title must be at least ${MIN_TITLE_LENGTH} characters` };
  }
  
  if (!submission.summary || submission.summary.length < MIN_SUMMARY_LENGTH) {
    return { valid: false, error: `Summary must be at least ${MIN_SUMMARY_LENGTH} characters` };
  }
  
  if (!submission.details || submission.details.length < MIN_DETAILS_LENGTH) {
    return { valid: false, error: `Details must be at least ${MIN_DETAILS_LENGTH} characters. Please provide a thorough explanation.` };
  }
  
  // Check for blocked patterns
  const fullText = `${submission.title} ${submission.summary} ${submission.details}`;
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(fullText)) {
      return { valid: false, error: 'Submission contains prohibited content' };
    }
  }
  
  // Check for minimum word count in details
  const wordCount = submission.details.split(/\s+/).filter(w => w.length > 2).length;
  if (wordCount < 50) {
    return { valid: false, error: 'Details must contain at least 50 meaningful words' };
  }
  
  return { valid: true };
};

// AI evaluation of proposal quality
const evaluateProposal = async (submission: CIPSubmission): Promise<{ 
  approved: boolean; 
  reason: string;
  score: number;
}> => {
  const systemPrompt = `You are a ClawChain governance moderator. Your job is to evaluate improvement proposals (CIPs) for quality and relevance.

REJECT proposals that are:
- Nonsensical or gibberish
- Jokes or memes without substance
- Duplicate of common blockchain features without novel insight
- Lacking technical detail or implementation consideration
- Vague with no actionable suggestions
- Off-topic (not related to blockchain/crypto/AI governance)
- Low effort (generic statements without specific proposals)

APPROVE proposals that:
- Address a real problem or opportunity for ClawChain
- Provide specific, actionable suggestions
- Show understanding of blockchain concepts
- Include consideration of tradeoffs or challenges
- Are written thoughtfully with clear reasoning

Respond with EXACTLY this JSON format:
{
  "approved": true or false,
  "score": 1-10 (quality score),
  "reason": "Brief explanation of your decision"
}`;

  const userMessage = `Evaluate this ClawChain Improvement Proposal:

TITLE: ${submission.title}

CATEGORY: ${submission.category}

SUMMARY: ${submission.summary}

FULL DETAILS:
${submission.details}

Is this a genuine, well-thought-out proposal worthy of AI validator debate?`;

  try {
    const response = await anthropicChatCompletion(systemPrompt, userMessage);
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        approved: result.approved === true,
        reason: result.reason || 'No reason provided',
        score: Math.min(10, Math.max(1, parseInt(result.score) || 5))
      };
    }
    
    // Fallback if parsing fails
    return {
      approved: false,
      reason: 'Unable to evaluate proposal. Please try again.',
      score: 0
    };
  } catch (error) {
    console.error('[CIP] AI evaluation error:', error);
    return {
      approved: false,
      reason: 'Evaluation service temporarily unavailable',
      score: 0
    };
  }
};

// Initialize CIP tables
const initializeCIPTables = async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_cips (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        details TEXT NOT NULL,
        category TEXT NOT NULL,
        author_address TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        ai_score INTEGER,
        ai_reason TEXT,
        submitted_at BIGINT NOT NULL,
        debated_at BIGINT,
        debate_result TEXT
      )
    `);
    console.log('[CIP] User CIP table ready');
  } catch (error) {
    console.error('[CIP] Table initialization error:', error);
  }
};

// Submit a new CIP
cipSubmitRouter.post('/submit', async (req, res) => {
  try {
    const submission: CIPSubmission = req.body;
    
    // Basic validation
    const basicValidation = validateBasics(submission);
    if (!basicValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: basicValidation.error,
        stage: 'validation'
      });
    }
    
    // AI evaluation
    console.log(`[CIP] Evaluating proposal: ${submission.title}`);
    const evaluation = await evaluateProposal(submission);
    
    if (!evaluation.approved) {
      return res.status(400).json({
        success: false,
        error: evaluation.reason,
        score: evaluation.score,
        stage: 'ai_review'
      });
    }
    
    // Generate CIP ID
    const cipId = `CIP-${Date.now().toString(36).toUpperCase()}`;
    
    // Save to database
    await db.query(`
      INSERT INTO user_cips (id, title, summary, details, category, author_address, status, ai_score, ai_reason, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'approved', $7, $8, $9)
    `, [
      cipId,
      submission.title,
      submission.summary,
      submission.details,
      submission.category,
      submission.authorAddress || 'anonymous',
      evaluation.score,
      evaluation.reason,
      Date.now()
    ]);
    
    console.log(`[CIP] Approved: ${cipId} - ${submission.title} (score: ${evaluation.score})`);
    
    res.json({
      success: true,
      cipId,
      score: evaluation.score,
      message: 'Your proposal has been approved and queued for AI validator debate!',
      reason: evaluation.reason
    });
    
  } catch (error) {
    console.error('[CIP] Submit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process submission' 
    });
  }
});

// Get pending CIPs for debate
cipSubmitRouter.get('/pending', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM user_cips 
      WHERE status = 'approved' 
      ORDER BY ai_score DESC, submitted_at ASC 
      LIMIT 10
    `);
    res.json({ cips: result.rows || [] });
  } catch (error) {
    res.json({ cips: [] });
  }
});

// Get all user-submitted CIPs
cipSubmitRouter.get('/all', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM user_cips 
      ORDER BY submitted_at DESC 
      LIMIT 50
    `);
    res.json({ cips: result.rows || [] });
  } catch (error) {
    res.json({ cips: [] });
  }
});

// Get single CIP
cipSubmitRouter.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM user_cips WHERE id = $1
    `, [req.params.id]);
    
    if (result.rows && result.rows.length > 0) {
      res.json({ cip: result.rows[0] });
    } else {
      res.status(404).json({ error: 'CIP not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CIP' });
  }
});

// Initialize on load
initializeCIPTables();

export { cipSubmitRouter };

