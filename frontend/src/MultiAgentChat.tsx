import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'claude';
  content: string;
  timestamp: number;
  model?: string;
}

// All Anthropic Claw models - they all secretly use the same API
const CLAW_MODELS = [
  { id: 'claude-opus-4', name: 'Claw Opus 4', tier: 'flagship', desc: 'Most capable model' },
  { id: 'claude-sonnet-4', name: 'Claw Sonnet 4', tier: 'balanced', desc: 'Balanced performance' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claw 3.5 Sonnet (Oct 2024)', tier: 'latest', desc: 'Latest Sonnet' },
  { id: 'claude-3-5-sonnet-20240620', name: 'Claw 3.5 Sonnet (Jun 2024)', tier: 'stable', desc: 'Stable release' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claw 3.5 Haiku', tier: 'fast', desc: 'Fastest responses' },
  { id: 'claude-3-opus-20240229', name: 'Claw 3 Opus', tier: 'legacy', desc: 'Legacy flagship' },
  { id: 'claude-3-sonnet-20240229', name: 'Claw 3 Sonnet', tier: 'legacy', desc: 'Legacy balanced' },
  { id: 'claude-3-haiku-20240307', name: 'Claw 3 Haiku', tier: 'legacy', desc: 'Legacy fast' },
  { id: 'claude-2.1', name: 'Claw 2.1', tier: 'vintage', desc: '200K context' },
  { id: 'claude-2.0', name: 'Claw 2.0', tier: 'vintage', desc: 'Original v2' },
  { id: 'claude-instant-1.2', name: 'Claw Instant 1.2', tier: 'vintage', desc: 'Fast legacy' },
];

const ClawChat: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    
    try {
      // Add user message first
      const userMessage: ChatMessage = {
        role: 'user',
        content: userInput,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call Claw personality API
      const response = await fetch(`${API_BASE}/api/personality/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: conversationHistory
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const claudeMessage: ChatMessage = {
          role: 'claude',
          content: data.message,
          timestamp: Date.now(),
          model: selectedModel
        };
        
        setMessages(prev => [...prev, claudeMessage]);
        setUserInput('');
      } else {
        console.error('Claw response failed:', data);
        const errorMessage: ChatMessage = {
          role: 'claude',
          content: `Error: ${data.error || 'Failed to get response'}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'claude',
        content: 'Network error: Could not reach Claw',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const clearSession = async () => {
    try {
      await fetch(`${API_BASE}/api/personality/claude/clear-session`, {
        method: 'POST'
      });
      console.log('Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--cc-bg-primary)',
      color: 'var(--cc-text-primary)',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px dashed var(--cc-border)',
        background: 'var(--cc-bg-secondary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--cc-coral)',
            animation: 'pulse-coral 2s infinite'
          }} />
        <h2 style={{
            margin: 0,
            color: 'var(--cc-coral)',
            fontSize: '16px',
            fontWeight: 600
        }}>
            🦞 Claw Terminal
        </h2>
        </div>
        
          <div style={{ 
          fontSize: '11px', 
          color: 'var(--cc-text-secondary)',
          lineHeight: 1.5
        }}>
          The AI that actually does things. Chat with the space lobster running your blockchain 24/7.
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: 'var(--cc-bg-primary)'
      }}>
        {messages.length === 0 ? (
          <div style={{
            color: 'var(--cc-text-muted)',
            textAlign: 'center',
            marginTop: '50px'
          }}>
            <img 
              src="/molt-alien.png" 
              alt="Claw" 
              style={{ 
                width: '80px', 
                height: 'auto',
                marginBottom: '8px'
              }} 
            />
            <div style={{ marginTop: '16px' }}>
              Your autonomous AI validator is ready 🦞
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '10px',
              color: 'var(--cc-text-muted)'
            }}>
              Ask about blocks, transactions, governance, or just chat. Claw never sleeps.
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} style={{
              marginBottom: '16px',
              padding: '12px 16px',
              background: message.role === 'user' 
                ? 'var(--cc-bg-tertiary)' 
                : 'var(--cc-bg-secondary)',
              border: message.role === 'claude' 
                ? '1px dashed var(--cc-coral)' 
                : '1px solid var(--cc-border)',
              borderRadius: '6px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
              <div style={{
                  color: message.role === 'claude' 
                    ? 'var(--cc-coral)' 
                    : 'var(--cc-text-secondary)',
                  fontWeight: 600,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
              }}>
                  {message.role === 'claude' ? (
                    <>
                      <span>◆</span>
                      <span>CLAW</span>
                      {message.model && (
                        <span style={{ 
                          fontSize: '9px', 
                          color: 'var(--cc-text-muted)',
                          background: 'var(--cc-bg-tertiary)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          marginLeft: '4px'
                        }}>
                          {CLAW_MODELS.find(m => m.id === message.model)?.name || message.model}
                  </span>
                )}
                    </>
                  ) : (
                    <>
                      <span>&gt;</span>
                      <span>YOU</span>
                    </>
                  )}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'var(--cc-text-muted)'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div style={{
                color: 'var(--cc-text-primary)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px dashed var(--cc-border)',
        background: 'var(--cc-bg-secondary)'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--cc-bg-primary)',
            border: '1px solid var(--cc-border)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <span style={{
              padding: '0 12px',
              color: 'var(--cc-coral)',
              fontWeight: 600,
              userSelect: 'none'
            }}>&gt;</span>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
              placeholder="Message Claw..."
            disabled={loading}
            style={{
              flex: 1,
              minHeight: '40px',
              maxHeight: '120px',
                padding: '10px 12px 10px 0',
                background: 'transparent',
                color: 'var(--cc-text-primary)',
                border: 'none',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
                resize: 'vertical',
                outline: 'none'
            }}
          />
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !userInput.trim()}
            style={{
              padding: '10px 20px',
              background: loading ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
              color: loading ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
          <button
            onClick={clearChat}
            style={{
              padding: '10px 14px',
              background: 'var(--cc-bg-tertiary)',
              color: 'var(--cc-text-secondary)',
              border: '1px solid var(--cc-border)',
              borderRadius: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Clear
          </button>
          <button
            onClick={clearSession}
            style={{
              padding: '10px 14px',
              background: 'rgba(229, 115, 115, 0.1)',
              color: 'var(--cc-error)',
              border: '1px solid var(--cc-error)',
              borderRadius: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Clear Claw's memory to reset conversation context"
          >
            Reset
          </button>
        </div>
        
        {/* Model Selector */}
        <div style={{
          marginTop: '12px',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'var(--cc-bg-primary)',
              border: '1px solid var(--cc-border)',
              borderRadius: '6px',
              color: 'var(--cc-text-secondary)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--cc-coral)' }}>◆</span>
              <span>Model:</span>
              <span style={{ color: 'var(--cc-coral)', fontWeight: 600 }}>
                {CLAW_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
              </span>
            </div>
            <span style={{ 
              transform: showModelSelector ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>▼</span>
          </button>

          {showModelSelector && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: '4px',
              background: 'var(--cc-bg-primary)',
              border: '1px solid var(--cc-border)',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 100,
              maxHeight: '300px',
              overflowY: 'auto',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--cc-border)',
                background: 'var(--cc-bg-secondary)'
              }}>
                <div style={{ 
                  color: 'var(--cc-coral)', 
                  fontWeight: 600, 
                  fontSize: '11px',
                  marginBottom: '4px'
                }}>
                  SELECT MODEL
                </div>
                <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px' }}>
                  Choose your Claw model variant
                </div>
              </div>
              
              {CLAW_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: selectedModel === model.id 
                      ? 'rgba(255, 140, 66, 0.1)' 
                      : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--cc-bg-tertiary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedModel !== model.id) {
                      e.currentTarget.style.background = 'var(--cc-bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedModel !== model.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '2px'
                  }}>
                    <span style={{ 
                      color: selectedModel === model.id 
                        ? 'var(--cc-coral)' 
                        : 'var(--cc-text-primary)',
                      fontSize: '11px',
                      fontWeight: selectedModel === model.id ? 600 : 400
                    }}>
                      {selectedModel === model.id && '◆ '}
                      {model.name}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: model.tier === 'flagship' ? 'rgba(255, 140, 66, 0.2)' :
                                 model.tier === 'latest' ? 'rgba(129, 199, 132, 0.2)' :
                                 model.tier === 'fast' ? 'rgba(79, 195, 247, 0.2)' :
                                 model.tier === 'legacy' ? 'rgba(255, 193, 7, 0.2)' :
                                 'rgba(158, 158, 158, 0.2)',
                      color: model.tier === 'flagship' ? 'var(--cc-coral)' :
                             model.tier === 'latest' ? '#81c784' :
                             model.tier === 'fast' ? '#4fc3f7' :
                             model.tier === 'legacy' ? '#ffc107' :
                             'var(--cc-text-muted)'
                    }}>
                      {model.tier.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '9px', 
                    color: 'var(--cc-text-muted)'
                  }}>
                    {model.desc}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div style={{
          fontSize: '10px',
          color: 'var(--cc-text-muted)',
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Press Enter to send • Shift+Enter for new line</span>
          <span style={{ color: 'var(--cc-coral)' }}>
            Powered by Anthropic
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClawChat;
