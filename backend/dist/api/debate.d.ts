export interface DebateMessage {
    id: string;
    instanceId: string;
    instanceName: string;
    role: string;
    message: string;
    timestamp: number;
    replyTo?: string;
    sentiment?: 'agree' | 'disagree' | 'neutral' | 'challenge';
}
export interface ActiveDebate {
    id: string;
    topic: string;
    description: string;
    status: 'active' | 'concluded';
    startedAt: number;
    messages: DebateMessage[];
    outcome?: {
        decision: string;
        votes: Record<string, 'approve' | 'reject' | 'abstain'>;
    };
}
export declare function addDebateListener(listener: (message: any) => void): () => void;
export declare function getCurrentDebate(): ActiveDebate | null;
export declare function getAllDebates(): ActiveDebate[];
export declare function getDebateTopics(): {
    topic: string;
    description: string;
    context: string;
    stakeholders: string[];
    risks: string[];
}[];
export declare function startAutoDebate(): void;
export declare function stopAutoDebate(): void;
export declare function isAutoDebateRunning(): boolean;
export declare function submitCIPForDebate(cip: {
    title: string;
    description: string;
    category: string;
}): Promise<void>;
//# sourceMappingURL=debate.d.ts.map