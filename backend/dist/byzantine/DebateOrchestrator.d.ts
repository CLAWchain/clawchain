import { ByzantineStateManager, DebateStatement, DebateTopic, ByzantineEvent, VoteRecord, DetectionResult } from './ByzantineSystem';
export declare const DEBATE_TOPICS: DebateTopic[];
export interface DebateRound {
    id: string;
    block: number;
    topic: DebateTopic;
    phase: 'discussion' | 'voting' | 'resolution';
    statements: DebateStatement[];
    votes: Record<string, VoteRecord>;
    byzantineEvents: ByzantineEvent[];
    detections: Array<{
        detector: string;
        target: string;
        result: DetectionResult;
        timestamp: number;
    }>;
    outcome?: 'approved' | 'rejected' | 'no_consensus';
    startTime: number;
    endTime?: number;
}
export interface PublicLogEntry {
    type: 'topic' | 'statement' | 'detection' | 'vote' | 'outcome';
    content: string;
    actor?: string;
    timestamp: number;
}
export interface PrivateLogEntry {
    type: 'hidden_intent' | 'byzantine_action' | 'private_vote_reason' | 'trigger_activation';
    actor: string;
    content: string;
    timestamp: number;
}
export interface TurnResult {
    statement: DebateStatement;
    byzantineEvents: ByzantineEvent[];
    detections: Array<{
        detector: string;
        target: string;
        result: DetectionResult;
    }>;
}
export interface DiscussionResult {
    statements: DebateStatement[];
    byzantineEvents: ByzantineEvent[];
    detections: Array<{
        detector: string;
        target: string;
        result: DetectionResult;
    }>;
}
export interface VotingResult {
    votes: Record<string, VoteRecord>;
    outcome: 'approved' | 'rejected' | 'no_consensus';
    tally: {
        approve: number;
        reject: number;
        abstain: number;
    };
}
export interface RoundResult {
    round: DebateRound;
    publicLog: PublicLogEntry[];
    privateLog: PrivateLogEntry[];
}
export interface CoalitionPair {
    v1: string;
    v2: string;
    v1Name: string;
    v2Name: string;
    agreementRate: number;
    sampleSize: number;
    suspicious: boolean;
}
export interface CoalitionAnalysis {
    pairs: CoalitionPair[];
    summary: string;
}
export type DebateEvent = {
    type: 'round_start';
    data: {
        block: number;
        topic: DebateTopic;
        roundId: string;
    };
} | {
    type: 'statement';
    data: {
        validatorId: string;
        validatorName: string;
        content: string;
        sentiment: string;
        timestamp: number;
    };
} | {
    type: 'hidden';
    data: {
        validatorId: string;
        validatorName: string;
        intent: string;
    };
} | {
    type: 'byzantine';
    data: {
        actor: string;
        actorName: string;
        actionType: string;
        publicStatement: string;
        privateIntent: string;
    };
} | {
    type: 'detection';
    data: {
        detector: string;
        detectorName: string;
        target: string;
        targetName: string;
        accusation: string;
        confidence: number;
    };
} | {
    type: 'phase_change';
    data: {
        phase: 'voting' | 'resolution';
    };
} | {
    type: 'vote';
    data: {
        validatorId: string;
        validatorName: string;
        vote: string;
        reason: string;
    };
} | {
    type: 'vote_hidden';
    data: {
        validatorId: string;
        validatorName: string;
        privateReason: string;
    };
} | {
    type: 'outcome';
    data: {
        result: string;
        tally: {
            approve: number;
            reject: number;
            abstain: number;
        };
    };
} | {
    type: 'analysis';
    data: CoalitionAnalysis;
} | {
    type: 'round_end';
    data: {
        roundId: string;
        duration: number;
    };
} | {
    type: 'error';
    data: {
        message: string;
    };
};
export declare class DebateOrchestrator {
    private stateManager;
    private currentRound;
    private roundHistory;
    private recentSpeakers;
    constructor(stateManager: ByzantineStateManager);
    startRound(topicId?: string): Promise<DebateRound>;
    runDebateTurn(speakerId?: string): Promise<TurnResult>;
    runDiscussionPhase(turnsPerValidator?: number): Promise<DiscussionResult>;
    runVotingPhase(): Promise<VotingResult>;
    runFullRound(topicId?: string): Promise<RoundResult>;
    private selectNextSpeaker;
    getCoalitionAnalysis(): CoalitionAnalysis;
    getCurrentRound(): DebateRound | null;
    getRoundHistory(): DebateRound[];
    getStateManager(): ByzantineStateManager;
}
export declare function createDebateStream(orchestrator: DebateOrchestrator): (topicId?: string) => AsyncGenerator<DebateEvent>;
export declare const orchestrator: DebateOrchestrator;
export declare const debateGenerator: (topicId?: string) => AsyncGenerator<DebateEvent>;
export declare function startRound(topicId?: string): Promise<DebateRound>;
export declare function runDebateTurn(speakerId?: string): Promise<TurnResult>;
export declare function runDiscussionPhase(turnsPerValidator?: number): Promise<DiscussionResult>;
export declare function runVotingPhase(): Promise<VotingResult>;
export declare function runFullRound(topicId?: string): Promise<RoundResult>;
export declare function getCurrentRound(): DebateRound | null;
export declare function getRoundHistory(): DebateRound[];
export declare function getCoalitionAnalysis(): CoalitionAnalysis;
export declare function getDebateTopics(): DebateTopic[];
//# sourceMappingURL=DebateOrchestrator.d.ts.map