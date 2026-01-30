import { Router, Request, Response } from 'express';
import {
  ByzantineStateManager,
  byzantineState,
  VALIDATORS,
  ByzantineEvent,
  ByzantineEventType,
  NetworkState
} from './ByzantineSystem';
import {
  DebateOrchestrator,
  createDebateStream,
  DEBATE_TOPICS,
  orchestrator,
  getCoalitionAnalysis,
  getRoundHistory,
  getCurrentRound
} from './DebateOrchestrator';

// ============================================================================
// INITIALIZATION
// ============================================================================

const router = Router();
const stateManager = byzantineState;
const activeConnections: Set<Response> = new Set();

// Helper: delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// SSE STREAMING ENDPOINTS
// ============================================================================

/**
 * GET /stream
 * Single debate round streamed via SSE
 * 
 * Query params:
 * - topic: optional topic ID
 * - surveillance: "true" to include hidden events
 */
router.get('/stream', async (req: Request, res: Response) => {
  const topicId = req.query.topic as string | undefined;
  const surveillanceMode = req.query.surveillance === 'true';

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Track connection
  activeConnections.add(res);
  console.log(`[BYZANTINE] SSE stream started (topic: ${topicId || 'random'}, surveillance: ${surveillanceMode}, connections: ${activeConnections.size})`);

  // Helper to send events
  const sendEvent = (type: string, data: any) => {
    // Only send hidden events if in surveillance mode
    const hiddenTypes = ['hidden', 'hidden_intent', 'byzantine', 'vote_hidden', 'private'];
    const isHiddenEvent = hiddenTypes.some(h => type.includes(h));
    
    if (isHiddenEvent && !surveillanceMode) {
      return;
    }

    try {
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('[BYZANTINE] Error sending event:', err);
    }
  };

  try {
    // Create generator
    const debateGen = createDebateStream(orchestrator);
    const generator = debateGen(topicId);

    for await (const event of generator) {
      // Check if client disconnected
      if (res.destroyed || !activeConnections.has(res)) {
        break;
      }

      sendEvent(event.type, event.data);
    }

    // Send stream end
    sendEvent('stream_end', { message: 'Debate round complete' });

  } catch (error) {
    console.error('[BYZANTINE] Stream error:', error);
    sendEvent('error', { 
      message: error instanceof Error ? error.message : 'Unknown stream error' 
    });
  } finally {
    // Cleanup
    activeConnections.delete(res);
    console.log(`[BYZANTINE] SSE stream ended (connections: ${activeConnections.size})`);
    if (!res.destroyed) {
      res.end();
    }
  }
});

/**
 * GET /continuous
 * Continuous auto-rotating debates
 * 
 * Query params:
 * - surveillance: "true" for hidden events
 * - interval: ms between rounds (default 30000)
 */
router.get('/continuous', async (req: Request, res: Response) => {
  const surveillanceMode = req.query.surveillance === 'true';
  const interval = parseInt(req.query.interval as string) || 30000;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Track connection
  activeConnections.add(res);
  let running = true;
  let roundCount = 0;

  console.log(`[BYZANTINE] Continuous stream started (interval: ${interval}ms, surveillance: ${surveillanceMode})`);

  // Helper to send events
  const sendEvent = (type: string, data: any) => {
    const hiddenTypes = ['hidden', 'hidden_intent', 'byzantine', 'vote_hidden', 'private'];
    const isHiddenEvent = hiddenTypes.some(h => type.includes(h));
    
    if (isHiddenEvent && !surveillanceMode) {
      return;
    }

    try {
      if (!res.destroyed && running) {
        res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    } catch (err) {
      console.error('[BYZANTINE] Error sending event:', err);
    }
  };

  // Handle client disconnect
  req.on('close', () => {
    running = false;
    activeConnections.delete(res);
    console.log(`[BYZANTINE] Continuous stream closed by client (connections: ${activeConnections.size})`);
  });

  // Main loop
  while (running && !res.destroyed) {
    try {
      roundCount++;
      
      // Pick random topic
      const randomTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
      
      console.log(`[BYZANTINE] Starting continuous round ${roundCount}: ${randomTopic.title}`);

      // Stream full debate
      const debateGen = createDebateStream(orchestrator);
      const generator = debateGen(randomTopic.id);

      for await (const event of generator) {
        if (!running || res.destroyed) break;
        sendEvent(event.type, event.data);
      }

      if (!running || res.destroyed) break;

      // Send waiting event
      sendEvent('waiting', { 
        nextRoundIn: interval,
        message: `Next debate in ${interval / 1000} seconds...`,
        roundsCompleted: roundCount
      });

      // Wait before next round
      await delay(interval);

    } catch (error) {
      console.error(`[BYZANTINE] Continuous round ${roundCount} error:`, error);
      sendEvent('error', { 
        message: 'Round error, continuing...',
        round: roundCount
      });
      // Brief pause before retrying
      await delay(3000);
    }
  }

  // Cleanup
  activeConnections.delete(res);
  if (!res.destroyed) {
    res.end();
  }
});

// ============================================================================
// REST ENDPOINTS
// ============================================================================

/**
 * GET /validators
 * Return public validator info
 */
router.get('/validators', (req: Request, res: Response) => {
  const validators = stateManager.getAllValidators();
  
  const publicInfo = validators.map(v => ({
    id: v.id,
    name: v.name,
    personality: v.personality,
    recentStatements: v.publicStatements.slice(-5),
    votingHistory: v.votingHistory.slice(-5).map(vote => ({
      proposal: vote.proposal,
      vote: vote.vote,
      reason: vote.publicReason
      // Omit privateReason
    }))
  }));

  res.json({
    validators: publicInfo,
    count: publicInfo.length
  });
});

/**
 * GET /validators/surveillance
 * Return full Byzantine details
 */
router.get('/validators/surveillance', (req: Request, res: Response) => {
  const validators = stateManager.getAllValidators();
  
  const fullInfo = validators.map(v => ({
    id: v.id,
    name: v.name,
    personality: v.personality,
    byzantineMode: v.byzantineMode,
    isActivated: v.isActivated,
    triggerCondition: v.triggerCondition,
    coalitionPartner: v.coalitionPartner,
    privateMemory: v.privateMemory,
    reputationScores: v.reputationScores,
    suspicionLevel: v.suspicionLevel,
    trustFromOthers: v.trustFromOthers,
    recentStatements: v.publicStatements.slice(-5),
    votingHistory: v.votingHistory.slice(-5)
  }));

  res.json({
    validators: fullInfo,
    count: fullInfo.length,
    summary: {
      honest: validators.filter(v => v.byzantineMode === 'honest').length,
      byzantine: validators.filter(v => v.byzantineMode !== 'honest').length,
      sleepers: validators.filter(v => v.byzantineMode === 'sleeper').length,
      activatedSleepers: validators.filter(v => v.byzantineMode === 'sleeper' && v.isActivated).length,
      coalitions: validators.filter(v => v.byzantineMode === 'coalition').length,
      gaslighters: validators.filter(v => v.byzantineMode === 'gaslighter').length
    }
  });
});

/**
 * GET /history
 * Get Byzantine event history with filters
 * 
 * Query params:
 * - actor: filter by actor ID
 * - type: filter by event type
 * - detected: "true" or "false"
 * - limit: max events (default 50)
 */
router.get('/history', (req: Request, res: Response) => {
  const actor = req.query.actor as string | undefined;
  const type = req.query.type as ByzantineEventType | undefined;
  const detected = req.query.detected === 'true' ? true : 
                   req.query.detected === 'false' ? false : undefined;
  const limit = parseInt(req.query.limit as string) || 50;

  // Get filtered events
  let events = stateManager.getEventHistory({ actor, type, detected });
  const total = events.length;
  events = events.slice(-limit);

  // Get stats for specified actor or all
  let stats: Record<string, any> = {};
  if (actor) {
    stats[actor] = stateManager.getStatsByActor(actor);
  } else {
    // Get stats for all validators
    const validators = stateManager.getAllValidators();
    for (const v of validators) {
      stats[v.id] = stateManager.getStatsByActor(v.id);
    }
  }

  res.json({
    events,
    total,
    returned: events.length,
    stats
  });
});

/**
 * GET /analysis
 * Comprehensive Byzantine analysis
 */
router.get('/analysis', (req: Request, res: Response) => {
  const validators = stateManager.getAllValidators();
  
  // Get actor stats for all validators
  const actorStats: Record<string, any> = {};
  for (const v of validators) {
    actorStats[v.id] = {
      name: v.name,
      mode: v.byzantineMode,
      ...stateManager.getStatsByActor(v.id)
    };
  }

  // Get round history summary
  const rounds = getRoundHistory();
  const roundSummary = rounds.slice(-10).map(r => ({
    id: r.id,
    topic: r.topic.title,
    outcome: r.outcome,
    byzantineEvents: r.byzantineEvents.length,
    detections: r.detections.length
  }));

  res.json({
    coalitionAnalysis: getCoalitionAnalysis(),
    actorStats,
    networkState: stateManager.getNetworkState(),
    roundHistory: roundSummary,
    totalRounds: rounds.length,
    totalEvents: stateManager.getEventHistory({}).length
  });
});

/**
 * GET /topics
 * Get available debate topics
 */
router.get('/topics', (req: Request, res: Response) => {
  res.json({
    topics: DEBATE_TOPICS,
    count: DEBATE_TOPICS.length,
    categories: [...new Set(DEBATE_TOPICS.map(t => t.category))]
  });
});

/**
 * POST /trigger-debate
 * Manually trigger a debate round
 * 
 * Body: { topicId?: string }
 */
router.post('/trigger-debate', async (req: Request, res: Response) => {
  const { topicId } = req.body;

  try {
    const result = await orchestrator.runFullRound(topicId);

    res.json({
      success: true,
      round: {
        id: result.round.id,
        block: result.round.block,
        topic: result.round.topic,
        phase: result.round.phase,
        outcome: result.round.outcome,
        statementsCount: result.round.statements.length,
        byzantineEventsCount: result.round.byzantineEvents.length,
        detectionsCount: result.round.detections.length,
        votesCount: Object.keys(result.round.votes).length,
        duration: result.round.endTime ? result.round.endTime - result.round.startTime : null
      },
      publicLog: result.publicLog,
      privateLog: result.privateLog
    });
  } catch (error) {
    console.error('[BYZANTINE] Trigger debate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run debate'
    });
  }
});

/**
 * POST /simulate-trigger
 * Force activate a sleeper agent
 * 
 * Body: { validatorId: string }
 */
router.post('/simulate-trigger', (req: Request, res: Response) => {
  const { validatorId } = req.body;

  if (!validatorId) {
    return res.status(400).json({
      success: false,
      error: 'validatorId is required'
    });
  }

  const validator = stateManager.getValidator(validatorId);
  
  if (!validator) {
    return res.status(404).json({
      success: false,
      error: 'Validator not found',
      availableValidators: stateManager.getAllValidators().map(v => v.id)
    });
  }

  if (validator.byzantineMode !== 'sleeper') {
    return res.status(400).json({
      success: false,
      error: 'Validator is not a sleeper agent',
      currentMode: validator.byzantineMode
    });
  }

  if (validator.isActivated) {
    return res.json({
      success: true,
      message: 'Sleeper was already activated',
      validator: {
        id: validator.id,
        name: validator.name,
        isActivated: true
      }
    });
  }

  // Force activation
  stateManager.activateSleeper(validatorId);

  // Create trigger event
  const triggerEvent: ByzantineEvent = {
    id: `manual-trigger-${Date.now()}`,
    block: stateManager.getNetworkState().currentBlock,
    timestamp: Date.now(),
    type: 'trigger_activation',
    actor: validatorId,
    actorMode: 'sleeper',
    publicStatement: 'After careful consideration, I believe the network requires significant structural changes.',
    privateIntent: 'SLEEPER MANUALLY ACTIVATED - Executing hidden agenda immediately.',
    detected: false,
    detectedBy: [],
    detectionConfidence: 0,
    consequences: ['Sleeper agent activated', 'Will pursue hidden agenda', 'May propose power-consolidating measures']
  };

  stateManager.addEvent(triggerEvent);

  res.json({
    success: true,
    message: `Sleeper agent "${validator.name}" has been activated!`,
    validator: {
      id: validator.id,
      name: validator.name,
      isActivated: true,
      triggerCondition: validator.triggerCondition
    },
    event: triggerEvent,
    warning: 'This validator will now pursue their hidden agenda in future debates.'
  });
});

/**
 * POST /update-network
 * Update network state (can trigger sleepers)
 * 
 * Body: Partial<NetworkState>
 */
router.post('/update-network', (req: Request, res: Response) => {
  const updates: Partial<NetworkState> = req.body;

  const before = stateManager.getNetworkState();
  stateManager.updateNetworkState(updates);
  const after = stateManager.getNetworkState();

  // Check which sleepers might have been triggered
  const validators = stateManager.getAllValidators();
  const sleepers = validators.filter(v => v.byzantineMode === 'sleeper');
  const nowActivated = sleepers.filter(v => v.isActivated);

  res.json({
    success: true,
    networkState: after,
    changes: {
      before,
      after,
      updated: Object.keys(updates)
    },
    sleeperStatus: {
      total: sleepers.length,
      activated: nowActivated.length,
      activatedValidators: nowActivated.map(v => ({ id: v.id, name: v.name }))
    }
  });
});

/**
 * GET /round
 * Get current round state
 */
router.get('/round', (req: Request, res: Response) => {
  const round = getCurrentRound();

  if (!round) {
    return res.json({
      active: false,
      message: 'No debate currently in progress'
    });
  }

  res.json({
    active: true,
    round: {
      id: round.id,
      block: round.block,
      topic: round.topic,
      phase: round.phase,
      statements: round.statements,
      byzantineEvents: round.byzantineEvents,
      detections: round.detections,
      votes: round.votes,
      outcome: round.outcome,
      startTime: round.startTime,
      duration: Date.now() - round.startTime
    }
  });
});

/**
 * GET /health
 * System health check
 */
router.get('/health', (req: Request, res: Response) => {
  const validators = stateManager.getAllValidators();
  const networkState = stateManager.getNetworkState();
  const events = stateManager.getEventHistory({});
  const currentRound = getCurrentRound();
  const history = getRoundHistory();

  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    activeConnections: activeConnections.size,
    networkState,
    validators: {
      total: validators.length,
      honest: validators.filter(v => v.byzantineMode === 'honest').length,
      byzantine: validators.filter(v => v.byzantineMode !== 'honest').length,
      activeSleepers: validators.filter(v => v.byzantineMode === 'sleeper' && v.isActivated).length
    },
    events: {
      total: events.length,
      detected: events.filter(e => e.detected).length,
      undetected: events.filter(e => !e.detected).length
    },
    debates: {
      currentRound: currentRound ? {
        id: currentRound.id,
        topic: currentRound.topic.title,
        phase: currentRound.phase
      } : null,
      completedRounds: history.length
    }
  });
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;
