import React, { useState, useEffect, useRef } from 'react';

// ============ TYPES ============

interface DebateTopic {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface Statement {
  validatorId: string;
  validatorName: string;
  content: string;
  sentiment: 'supportive' | 'opposing' | 'neutral' | 'suspicious' | 'questioning';
  hiddenIntent?: string;
  timestamp: number;
}

interface Vote {
  validatorId: string;
  validatorName: string;
  vote: 'approve' | 'reject' | 'abstain';
  publicReason: string;
  privateReason?: string;
  timestamp: number;
}

interface Detection {
  detectorId: string;
  detectorName: string;
  targetId: string;
  targetName: string;
  accusation: string;
  confidence: number;
  evidence: string[];
  timestamp: number;
}

interface ValidatorInfo {
  id: string;
  name: string;
  personality: string;
  byzantineMode?: string;
  isActivated?: boolean;
  coalitionPartner?: string;
}

interface CoalitionAnalysis {
  pair: [string, string];
  agreementRate: number;
  suspicious: boolean;
}

// ============ VALIDATOR DESCRIPTIONS ============
const VALIDATOR_DESCRIPTIONS: Record<string, string> = {
  'validator-prime': 'Lead block producer focused on throughput and network stability',
  'architect': 'Systems designer evaluating architectural implications of proposals',
  'analyst': 'Data-driven pattern analyst tracking voting behaviors and anomalies',
  'reviewer': 'Security auditor assessing risk vectors and attack surfaces',
  'consensus': 'Governance specialist focused on protocol fairness and coordination',
  'oracle': 'External data integration expert bridging on-chain and off-chain systems'
};

const getValidatorDescription = (id: string): string => {
  return VALIDATOR_DESCRIPTIONS[id] || 'Council validator participating in governance decisions';
};

// ============ COMPONENT ============

const ByzantineDebateViewer: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [surveillanceMode, setSurveillanceMode] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<DebateTopic | null>(null);
  const [phase, setPhase] = useState<'waiting' | 'discussion' | 'voting' | 'concluded'>('waiting');
  const [statements, setStatements] = useState<Statement[]>([]);
  const [hiddenIntents, setHiddenIntents] = useState<Map<string, string>>(new Map());
  const [votes, setVotes] = useState<Vote[]>([]);
  const [privateReasons, setPrivateReasons] = useState<Map<string, string>>(new Map());
  const [detections, setDetections] = useState<Detection[]>([]);
  const [outcome, setOutcome] = useState<{ result: string; approves: number; rejects: number; abstains: number } | null>(null);
  const [coalitions, setCoalitions] = useState<CoalitionAnalysis[]>([]);
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [blockNumber, setBlockNumber] = useState(0);
  const [roundId, setRoundId] = useState('');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch validators based on mode
  useEffect(() => {
    const endpoint = surveillanceMode 
      ? '/api/byzantine/validators/surveillance'
      : '/api/byzantine/validators';
    
    fetch(endpoint)
      .then(res => res.json())
      .then(data => setValidators(data.validators))
      .catch(err => console.error('Failed to fetch validators:', err));
  }, [surveillanceMode]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [statements, votes, detections]);

  // Connect to SSE stream
  const connectStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/byzantine/continuous?surveillance=${surveillanceMode}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      console.log('[BYZANTINE] Connected to stream');
    };

    es.onerror = () => {
      setConnected(false);
      console.error('[BYZANTINE] Stream error');
    };

    // Event handlers
    es.addEventListener('round_start', (e) => {
      const data = JSON.parse(e.data);
      setCurrentTopic(data.topic);
      setBlockNumber(data.blockNumber);
      setRoundId(data.roundId);
      setPhase('discussion');
      setStatements([]);
      setVotes([]);
      setDetections([]);
      setHiddenIntents(new Map());
      setPrivateReasons(new Map());
      setOutcome(null);
      setCoalitions([]);
    });

    es.addEventListener('statement', (e) => {
      const data = JSON.parse(e.data) as Statement;
      setStatements(prev => [...prev, data]);
    });

    es.addEventListener('hidden', (e) => {
      const data = JSON.parse(e.data);
      setHiddenIntents(prev => new Map(prev).set(data.validatorId, data.intent));
    });

    es.addEventListener('detection', (e) => {
      const data = JSON.parse(e.data) as Detection;
      setDetections(prev => [...prev, data]);
    });

    es.addEventListener('phase_change', (e) => {
      const data = JSON.parse(e.data);
      setPhase(data.phase);
    });

    es.addEventListener('vote', (e) => {
      const data = JSON.parse(e.data) as Vote;
      setVotes(prev => [...prev, data]);
    });

    es.addEventListener('vote_hidden', (e) => {
      const data = JSON.parse(e.data);
      setPrivateReasons(prev => new Map(prev).set(data.validatorId, data.privateReason));
    });

    es.addEventListener('outcome', (e) => {
      const data = JSON.parse(e.data);
      setOutcome(data);
      setPhase('concluded');
    });

    es.addEventListener('analysis', (e) => {
      const data = JSON.parse(e.data);
      setCoalitions(data.coalitions);
    });

    es.addEventListener('waiting', (e) => {
      setPhase('waiting');
    });
  };

  const disconnectStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // ============ RENDER HELPERS ============

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'supportive': return '#4ade80';
      case 'opposing': return '#f87171';
      case 'suspicious': return '#fbbf24';
      case 'questioning': return '#60a5fa';
      default: return '#9ca3af';
    }
  };

  const getVoteColor = (vote: string): string => {
    switch (vote) {
      case 'approve': return '#4ade80';
      case 'reject': return '#f87171';
      default: return '#9ca3af';
    }
  };

  const getByzantineBadge = (mode?: string, isActivated?: boolean): JSX.Element | null => {
    if (!mode || mode === 'honest') return null;
    
    const label = mode === 'sleeper' 
      ? (isActivated ? 'SLEEPER [ACTIVE]' : 'SLEEPER [DORMANT]')
      : mode.toUpperCase();
    
    const color = mode === 'sleeper' && isActivated ? '#f87171' : '#ff8c42';
    
    return (
      <span style={{
        fontSize: '10px',
        padding: '2px 6px',
        background: color,
        color: '#0d0d0d',
        borderRadius: '4px',
        marginLeft: '8px',
        fontWeight: 'bold'
      }}>
        {label}
      </span>
    );
  };

  // ============ MAIN RENDER ============

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: '"JetBrains Mono", monospace',
      color: 'var(--text-primary)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '15px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            background: 'linear-gradient(135deg, var(--coral) 0%, var(--teal) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '28px',
            letterSpacing: '1px',
            fontWeight: 700
          }}>
            Claw Council
          </h1>
          <p style={{ margin: '5px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
            Byzantine Fault Tolerant Governance Simulation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Surveillance Toggle */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            <input
              type="checkbox"
              checked={surveillanceMode}
              onChange={(e) => setSurveillanceMode(e.target.checked)}
              style={{ accentColor: 'var(--coral)' }}
            />
            <span style={{ color: surveillanceMode ? 'var(--coral)' : 'var(--text-muted)' }}>
              SURVEILLANCE MODE
            </span>
          </label>

          {/* Connect Button */}
          <button
            onClick={connected ? disconnectStream : connectStream}
            style={{
              padding: '10px 20px',
              background: connected ? 'transparent' : 'var(--coral)',
              color: connected ? 'var(--coral)' : '#080810',
              border: `1px solid var(--coral)`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {connected ? 'DISCONNECT' : 'CONNECT'}
          </button>
        </div>
      </div>

      {/* Feature Explanation */}
      <div className="card" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--coral)' }}>Byzantine Consensus Simulation:</strong> Watch 6 Claw AI validators debate governance proposals. 
          Some are <span style={{ color: '#4ECDC4' }}>honest</span>, others secretly act as 
          <span style={{ color: 'var(--coral)' }}> sleepers</span>, <span style={{ color: '#ef4444' }}>gaslighters</span>, 
          or <span style={{ color: '#8b5cf6' }}>coalition members</span> - manipulating votes without detection.
          Enable <strong>Surveillance Mode</strong> to reveal hidden behaviors and true motivations.
        </div>
      </div>

      {/* Main Grid - responsive */}
      <div className="council-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 250px) 1fr minmax(200px, 250px)',
        gap: '16px'
      }}>
        {/* Left Panel - Validators */}
        <div className="card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px', 
            color: 'var(--coral)',
            fontSize: '13px',
            fontWeight: 600
          }}>
            Validators [{validators.length}]
          </h3>
          
          {validators.map(v => (
            <div 
              key={v.id}
              style={{
                padding: '12px',
                marginBottom: '10px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                borderLeft: `3px solid ${v.byzantineMode === 'honest' ? 'var(--teal)' : 'var(--coral)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{v.name}</span>
                {surveillanceMode && getByzantineBadge(v.byzantineMode, v.isActivated)}
              </div>
              <p style={{ 
                margin: '8px 0 0', 
                fontSize: '11px', 
                color: 'var(--text-muted)',
                lineHeight: '1.4'
              }}>
                {getValidatorDescription(v.id)}
              </p>
              {surveillanceMode && v.coalitionPartner && (
                <p style={{ 
                  margin: '5px 0 0', 
                  fontSize: '10px', 
                  color: 'var(--coral)'
                }}>
                  Coalition: {v.coalitionPartner}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Center Panel - Debate */}
        <div className="card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '20px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh'
        }}>
          {/* Topic Header */}
          <div style={{
            borderBottom: '1px solid var(--border)',
            paddingBottom: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{
                background: connected ? 'var(--teal)' : 'var(--text-muted)',
                color: '#080810',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 600
              }}>
                {connected ? 'LIVE' : 'OFFLINE'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Block #{blockNumber || '---'}
              </span>
            </div>

            {currentTopic ? (
              <>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}>
                  {currentTopic.title}
                </h2>
                <p style={{ 
                  margin: '10px 0 0', 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  {currentTopic.description}
                </p>
                <span style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '4px 10px',
                  background: 'var(--coral-dim)',
                  borderRadius: '6px',
                  fontSize: '10px',
                  color: 'var(--coral)',
                  fontWeight: 500
                }}>
                  {currentTopic.category.toUpperCase()}
                </span>
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {connected ? 'Waiting for next debate round...' : 'Connect to start receiving debates'}
              </p>
            )}
          </div>

          {/* Phase Indicator */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {['discussion', 'voting', 'concluded'].map(p => (
              <span
                key={p}
                style={{
                  padding: '6px 14px',
                  background: phase === p ? 'var(--coral)' : 'var(--bg-secondary)',
                  color: phase === p ? '#080810' : 'var(--text-muted)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: phase === p ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {p.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            background: 'var(--bg-primary)',
            borderRadius: '8px'
          }}>
            {phase === 'waiting' && !currentTopic && (
              <div style={{ 
                textAlign: 'center', 
                padding: '50px 20px',
                color: 'var(--text-muted)'
              }}>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Awaiting council assembly...</p>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>
                  Debates occur automatically when connected
                </p>
              </div>
            )}

            {/* Statements */}
            {statements.map((s, i) => (
              <div key={`s-${i}`} style={{ marginBottom: '12px' }}>
                <div style={{
                  padding: '14px',
                  background: 'var(--bg-card)',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${getSentimentColor(s.sentiment)}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {s.validatorName}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: getSentimentColor(s.sentiment),
                      color: '#080810',
                      borderRadius: '5px',
                      fontWeight: 500
                    }}>
                      {s.sentiment.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)'
                  }}>
                    "{s.content}"
                  </p>
                </div>

                {/* Hidden Intent (surveillance mode) */}
                {surveillanceMode && hiddenIntents.get(s.validatorId) && (
                  <div style={{
                    marginTop: '6px',
                    marginLeft: '16px',
                    padding: '10px 14px',
                    background: 'var(--coral-dim)',
                    borderLeft: '2px solid var(--coral)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: 'var(--coral)',
                    fontStyle: 'italic'
                  }}>
                    // Hidden: {hiddenIntents.get(s.validatorId)}
                  </div>
                )}
              </div>
            ))}

            {/* Detections */}
            {detections.map((d, i) => (
              <div
                key={`d-${i}`}
                style={{
                  margin: '15px 0',
                  padding: '12px',
                  background: '#2a2a1a',
                  border: '1px dashed #fbbf24',
                  borderRadius: '4px'
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '12px' }}>
                    [!] DETECTION ALERT
                  </span>
                  <span style={{ 
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: '#fbbf24',
                    color: '#0d0d0d',
                    borderRadius: '4px'
                  }}>
                    {d.confidence}% confidence
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#e0e0e0' }}>
                  <strong>{d.detectorName}</strong> suspects <strong>{d.targetName}</strong>:
                </p>
                <p style={{ 
                  margin: '8px 0 0', 
                  fontSize: '12px', 
                  color: '#fbbf24',
                  fontStyle: 'italic'
                }}>
                  "{d.accusation}"
                </p>
                {d.evidence.length > 0 && (
                  <ul style={{ 
                    margin: '8px 0 0', 
                    paddingLeft: '20px',
                    fontSize: '11px',
                    color: '#888'
                  }}>
                    {d.evidence.map((e, j) => (
                      <li key={j}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Votes */}
            {votes.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 10px',
                  color: '#ff8c42',
                  fontSize: '12px',
                  letterSpacing: '1px'
                }}>
                  VOTES
                </h4>
                {votes.map((v, i) => (
                  <div key={`v-${i}`} style={{ marginBottom: '10px' }}>
                    <div style={{
                      padding: '10px',
                      background: '#1a1a1a',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${getVoteColor(v.vote)}`
                    }}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '5px'
                      }}>
                        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                          {v.validatorName}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          background: getVoteColor(v.vote),
                          color: '#0d0d0d',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {v.vote.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '11px',
                        color: '#888'
                      }}>
                        {v.publicReason}
                      </p>
                    </div>

                    {/* Private Reason (surveillance mode) */}
                    {surveillanceMode && privateReasons.get(v.validatorId) && (
                      <div style={{
                        marginTop: '5px',
                        marginLeft: '15px',
                        padding: '6px 10px',
                        background: '#2a1a1a',
                        borderLeft: '2px solid #ff8c42',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#ff8c42',
                        fontStyle: 'italic'
                      }}>
                        // Real reason: {privateReasons.get(v.validatorId)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Outcome */}
            {outcome && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: outcome.result === 'approved' ? '#1a2a1a' : 
                           outcome.result === 'rejected' ? '#2a1a1a' : '#1a1a2a',
                border: `1px solid ${outcome.result === 'approved' ? '#4ade80' :
                                    outcome.result === 'rejected' ? '#f87171' : '#60a5fa'}`,
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  margin: '0 0 10px',
                  color: outcome.result === 'approved' ? '#4ade80' :
                         outcome.result === 'rejected' ? '#f87171' : '#60a5fa',
                  fontSize: '16px'
                }}>
                  {outcome.result === 'approved' ? 'PROPOSAL APPROVED' :
                   outcome.result === 'rejected' ? 'PROPOSAL REJECTED' : 'NO CONSENSUS'}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                  Approve: {outcome.approves} | Reject: {outcome.rejects} | Abstain: {outcome.abstains}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px', 
            color: 'var(--coral)',
            fontSize: '13px',
            fontWeight: 600
          }}>
            Coalition Analysis
          </h3>

          {coalitions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
              Insufficient data for correlation analysis
            </p>
          ) : (
            coalitions.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  marginBottom: '10px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${c.suspicious ? '#f87171' : 'var(--teal)'}`
                }}
              >
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.pair[0]} + {c.pair[1]}
                  </span>
                  {c.suspicious && (
                    <span style={{
                      fontSize: '9px',
                      padding: '3px 8px',
                      background: '#f87171',
                      color: '#080810',
                      borderRadius: '5px',
                      fontWeight: 500
                    }}>
                      SUSPICIOUS
                    </span>
                  )}
                </div>
                <div style={{
                  height: '6px',
                  background: 'var(--bg-primary)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${c.agreementRate}%`,
                    height: '100%',
                    background: c.suspicious ? '#f87171' : 'var(--teal)',
                    borderRadius: '3px',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <p style={{ 
                  margin: '6px 0 0', 
                  fontSize: '10px', 
                  color: 'var(--text-muted)' 
                }}>
                  Agreement: {c.agreementRate}%
                </p>
              </div>
            ))
          )}

          {/* Legend */}
          <div style={{
            marginTop: '20px',
            padding: '14px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <h4 style={{ 
              margin: '0 0 12px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              BYZANTINE MODES
            </h4>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              <div><span style={{ color: 'var(--teal)' }}>HONEST</span> - Genuine participation</div>
              <div><span style={{ color: 'var(--coral)' }}>SLEEPER</span> - Waiting to strike</div>
              <div><span style={{ color: 'var(--coral)' }}>GASLIGHTER</span> - Undermining trust</div>
              <div><span style={{ color: 'var(--coral)' }}>COALITION</span> - Secret coordination</div>
              <div><span style={{ color: 'var(--coral)' }}>SELFISH</span> - Self-serving</div>
              <div><span style={{ color: 'var(--coral)' }}>CHAOS</span> - Preventing consensus</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            marginTop: '12px',
            padding: '14px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <h4 style={{ 
              margin: '0 0 12px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              SESSION STATS
            </h4>
            <div style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Statements:</span>
                <span style={{ color: 'var(--coral)', fontWeight: 600 }}>{statements.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Detections:</span>
                <span style={{ color: detections.length > 0 ? '#fbbf24' : 'var(--text-muted)', fontWeight: 600 }}>{detections.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Votes Cast:</span>
                <span style={{ color: 'var(--coral)', fontWeight: 600 }}>{votes.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ByzantineDebateViewer;

