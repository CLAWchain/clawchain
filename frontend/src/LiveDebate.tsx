import React, { useState, useEffect, useRef } from 'react';

interface DebateMessage {
  id: string;
  instanceId: string;
  instanceName: string;
  role: string;
  message: string;
  timestamp: number;
  replyTo?: string;
  sentiment?: 'agree' | 'disagree' | 'neutral' | 'challenge';
}

interface ActiveDebate {
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

const LiveDebate: React.FC = () => {
  const [currentDebate, setCurrentDebate] = useState<ActiveDebate | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 50) + 15);
  const [typingValidator, setTypingValidator] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    connectToDebateStream();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectToDebateStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`${API_BASE}/api/debate/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Connected to debate stream');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'current_state':
          setCurrentDebate(data.debate);
          setMessages(data.debate?.messages || []);
          break;
          
        case 'debate_started':
          setCurrentDebate({
            ...data.debate,
            status: 'active',
            startedAt: Date.now(),
            messages: []
          });
          setMessages([]);
          break;
          
        case 'validator_typing':
          setTypingValidator(data.validatorName);
          break;
          
        case 'new_message':
          setTypingValidator(null);
          setMessages(prev => [...prev, data.message]);
          break;
          
        case 'debate_concluded':
          setCurrentDebate(data.debate);
          setTypingValidator(null);
          break;
          
        case 'viewers':
          setViewerCount(data.count);
          break;
          
        case 'heartbeat':
          break;
        }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsConnected(false);
      
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connectToDebateStream();
    }
      }, 3000);
    };
  };

  const getInstanceColor = (instanceId: string): string => {
    const colors: Record<string, string> = {
      'validator': '#FF8C42',
      'architect': '#64B5F6',
      'analyst': '#81C784',
      'reviewer': '#FFD54F',
      'consensus': '#BA68C8',
      'oracle': '#4DD0E1'
    };
    return colors[instanceId] || 'var(--cc-coral)';
  };

  const getSentimentIndicator = (sentiment?: string): { symbol: string; color: string } => {
    switch (sentiment) {
      case 'agree': return { symbol: '+', color: '#81C784' };
      case 'disagree': return { symbol: '-', color: '#EF5350' };
      case 'challenge': return { symbol: '?', color: '#FFD54F' };
      default: return { symbol: '>', color: 'var(--cc-text-muted)' };
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const isDebateActive = currentDebate?.status === 'active';

    return (
      <div style={{
      background: 'var(--cc-bg-primary)',
      border: '2px solid var(--cc-coral)',
        marginTop: '20px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px dashed var(--cc-border)',
        background: 'linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, var(--cc-bg-secondary) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isDebateActive ? '#ff4444' : 'var(--cc-text-muted)',
            boxShadow: isDebateActive ? '0 0 10px #ff4444' : 'none',
            animation: isDebateActive ? 'pulse-red 1.5s infinite' : 'none'
          }} />
        <h3 style={{
          margin: 0,
            color: 'var(--cc-coral)',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '1px'
        }}>
            [LIVE] CLAW COUNCIL
        </h3>
          {isDebateActive && (
            <span style={{
              background: '#ff4444',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700,
              animation: 'pulse-red 2s infinite'
            }}>
              DEBATING
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '11px' }}>
          <span style={{ color: 'var(--cc-text-muted)' }}>
            {viewerCount} watching
          </span>
          <span style={{ 
            color: isConnected ? 'var(--cc-success)' : 'var(--cc-error)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isConnected ? 'var(--cc-success)' : 'var(--cc-error)'
            }} />
            {isConnected ? 'CONNECTED' : 'RECONNECTING...'}
          </span>
        </div>
      </div>

      {/* Current Topic */}
      {currentDebate && (
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px dashed var(--cc-border)',
          background: 'var(--cc-bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'var(--cc-coral)',
              color: 'var(--cc-bg-primary)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700
            }}>
              {currentDebate.topic.split(':')[0]}
            </span>
            <span style={{
              background: currentDebate.status === 'active' 
                ? 'rgba(255, 68, 68, 0.2)' 
                : 'rgba(129, 199, 132, 0.2)',
              color: currentDebate.status === 'active' ? '#ff4444' : '#81c784',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600
            }}>
              {currentDebate.status === 'active' ? 'ACTIVE DEBATE' : 'CONCLUDED'}
            </span>
          </div>
          <div style={{
            color: 'var(--cc-coral)',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '6px'
          }}>
            {currentDebate.topic}
          </div>
          <div style={{
            color: 'var(--cc-text-secondary)',
            fontSize: '11px',
            lineHeight: '1.5'
          }}>
            {currentDebate.description}
          </div>
        </div>
      )}

      {/* Participant Bar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px dashed var(--cc-border)',
        background: 'var(--cc-bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
        }}>
        <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>COUNCIL MEMBERS:</span>
        {[
          { id: 'validator', name: 'Validator', specialty: 'Security' },
          { id: 'architect', name: 'Architect', specialty: 'Design' },
          { id: 'analyst', name: 'Analyst', specialty: 'Economics' },
          { id: 'reviewer', name: 'Reviewer', specialty: 'Quality' },
          { id: 'consensus', name: 'Consensus', specialty: 'Coordination' },
          { id: 'oracle', name: 'Oracle', specialty: 'External' }
        ].map(member => {
          const hasSpoken = messages.some(m => m.instanceId === member.id);
          const isTyping = typingValidator === member.name;
          return (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                opacity: hasSpoken || isTyping ? 1 : 0.4,
                transition: 'opacity 0.3s',
                padding: '4px 8px',
                background: isTyping ? 'rgba(255, 140, 66, 0.2)' : 'transparent',
                borderRadius: '4px'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getInstanceColor(member.id),
                animation: isTyping ? 'pulse-red 1s infinite' : 'none'
              }} />
              <span style={{
                color: getInstanceColor(member.id),
                fontSize: '10px',
                fontWeight: 600
              }}>
                {member.name}
              </span>
            </div>
          );
        })}
              </div>

      {/* Debate Messages */}
      <div style={{
        height: '450px',
        overflow: 'auto',
        padding: '20px'
      }}>
        {messages.length === 0 && !currentDebate && (
          <div style={{
            textAlign: 'center',
            color: 'var(--cc-text-muted)',
            padding: '50px 20px',
            fontSize: '13px'
          }}>
              <div style={{
              fontSize: '32px', 
              marginBottom: '15px',
              fontFamily: 'monospace',
              color: 'var(--cc-coral)'
              }}>
              {'[...]'}
            </div>
            <div>Waiting for next council session...</div>
            <div style={{ fontSize: '11px', marginTop: '10px', color: 'var(--cc-text-secondary)' }}>
              Claw Council debates CIPs in real-time. Stay tuned.
            </div>
              </div>
        )}

        {messages.map((msg, index) => {
          const sentiment = getSentimentIndicator(msg.sentiment);
          return (
            <div
              key={msg.id}
              style={{
                marginBottom: '15px',
                padding: '15px',
                background: 'var(--cc-bg-secondary)',
                border: `1px solid ${getInstanceColor(msg.instanceId)}40`,
                borderLeft: `4px solid ${getInstanceColor(msg.instanceId)}`,
                borderRadius: '6px',
                animation: index === messages.length - 1 ? 'slideIn 0.3s ease-out' : 'none'
              }}
            >
              {/* Message Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    color: sentiment.color,
                    fontWeight: 700,
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}>
                    [{sentiment.symbol}]
                  </span>
                  <span style={{
                    color: getInstanceColor(msg.instanceId),
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    CLAW {msg.instanceName.replace('CLAW ', '').toUpperCase()}
                  </span>
                  <span style={{
                    color: 'var(--cc-text-muted)',
                    fontSize: '9px',
                    background: 'var(--cc-bg-tertiary)',
                    padding: '2px 8px',
                    borderRadius: '3px'
                  }}>
                    {msg.role}
                </span>
                </div>
                <span style={{
                  color: 'var(--cc-text-muted)',
                  fontSize: '10px'
                }}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>

              {/* Reply indicator */}
              {msg.replyTo && (
                <div style={{
                  fontSize: '10px',
                  color: 'var(--cc-text-muted)',
                  marginBottom: '8px',
                  fontStyle: 'italic',
                  paddingLeft: '10px',
                  borderLeft: '2px solid var(--cc-border)'
                }}>
                  Responding to previous point...
                </div>
              )}

              {/* Message Content */}
              <div style={{
                color: 'var(--cc-text-primary)',
                fontSize: '12px',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.message}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingValidator && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '15px',
            color: 'var(--cc-text-muted)',
            fontSize: '11px',
            background: 'var(--cc-bg-secondary)',
            borderRadius: '6px',
            border: '1px dashed var(--cc-border)'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ animation: 'bounce 1s infinite 0ms', color: 'var(--cc-coral)' }}>.</span>
              <span style={{ animation: 'bounce 1s infinite 150ms', color: 'var(--cc-coral)' }}>.</span>
              <span style={{ animation: 'bounce 1s infinite 300ms', color: 'var(--cc-coral)' }}>.</span>
            </div>
            <span style={{ color: 'var(--cc-coral)', fontWeight: 600 }}>{typingValidator}</span> is formulating response...
        </div>
        )}

        {/* Debate Outcome */}
        {currentDebate?.outcome && (
        <div style={{
            marginTop: '20px',
          padding: '20px',
            background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.1) 0%, var(--cc-bg-secondary) 100%)',
            border: '2px solid #81c784',
            borderRadius: '8px'
        }}>
              <div style={{
              color: '#81c784',
              fontWeight: 700,
              fontSize: '14px',
              marginBottom: '12px'
                }}>
              [COUNCIL DECISION]
            </div>
                <div style={{
              color: 'var(--cc-text-primary)',
                  fontSize: '12px',
              lineHeight: '1.6',
                  marginBottom: '15px'
                }}>
              {currentDebate.outcome.decision}
                </div>
                <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap',
              fontSize: '10px'
            }}>
              {Object.entries(currentDebate.outcome.votes).map(([validator, vote]) => (
                <div key={validator} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: 'var(--cc-bg-tertiary)',
                  borderRadius: '4px'
                }}>
                  <span style={{
                    color: vote === 'approve' ? '#81c784' : vote === 'reject' ? '#ef5350' : 'var(--cc-text-muted)'
                  }}>
                    {vote === 'approve' ? '+' : vote === 'reject' ? '-' : 'o'}
                  </span>
                  <span style={{ color: 'var(--cc-text-secondary)' }}>
                    {validator.toUpperCase()}
                  </span>
                </div>
              ))}
                        </div>
                      </div>
        )}

        <div ref={messagesEndRef} />
                            </div>

      {/* Status Bar */}
                            <div style={{
        padding: '12px 20px',
        borderTop: '1px dashed var(--cc-border)',
        background: 'var(--cc-bg-tertiary)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
        fontSize: '10px',
        color: 'var(--cc-text-muted)'
                            }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Messages: {messages.length}</span>
          <span>Status: {currentDebate?.status?.toUpperCase() || 'STANDBY'}</span>
                              </div>
        <div>
          Council debates run autonomously 24/7
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LiveDebate; 
