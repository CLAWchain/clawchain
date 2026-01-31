import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Task {
  id: string;
  title: string;
  type: string;
  agent: string;
}

interface Decision {
  action: string;
  reasoning: string;
}

interface CompletedTask {
  title: string;
  agent: string;
  completedAt: string;
}

interface AgentState {
  isWorking: boolean;
  currentTask: Task | null;
  currentOutput: string;
  completedTasks: CompletedTask[];
  viewerCount: number;
  brainActive: boolean;
  currentDecision: Decision | null;
}

const AgentTerminal: React.FC = () => {
  const [state, setState] = useState<AgentState>({
    isWorking: false,
    currentTask: null,
    currentOutput: '',
    completedTasks: [],
    viewerCount: 0,
    brainActive: false,
    currentDecision: null,
  });
  const [connected, setConnected] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const textBufferRef = useRef('');
  const displayIndexRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // Typewriter effect - renders text character by character
  const typewriterEffect = useCallback(() => {
    const buffer = textBufferRef.current;
    const currentIndex = displayIndexRef.current;
    
    if (currentIndex < buffer.length) {
      // Add characters in small batches for smoother rendering
      const charsToAdd = Math.min(3, buffer.length - currentIndex);
      displayIndexRef.current = currentIndex + charsToAdd;
      setDisplayedText(buffer.slice(0, displayIndexRef.current));
      
      animationFrameRef.current = requestAnimationFrame(typewriterEffect);
    }
  }, []);

  // Update buffer and trigger typewriter
  const appendText = useCallback((text: string) => {
    textBufferRef.current += text;
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(typewriterEffect);
    }
  }, [typewriterEffect]);

  // Reset for new task
  const resetOutput = useCallback(() => {
    textBufferRef.current = '';
    displayIndexRef.current = 0;
    setDisplayedText('');
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [displayedText]);

  // Load persisted tasks on mount
  useEffect(() => {
    const loadPersistedTasks = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/agent/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.recentTasks && data.recentTasks.length > 0) {
            setState(prev => ({
              ...prev,
              completedTasks: data.recentTasks,
              isWorking: data.isWorking,
              currentTask: data.currentTask,
              viewerCount: data.viewerCount || 0,
            }));
          }
        }
      } catch (e) {
        console.error('[AgentTerminal] Failed to load persisted tasks:', e);
      }
    };
    
    loadPersistedTasks();
  }, [API_BASE]);

  // SSE Connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      eventSource = new EventSource(`${API_BASE}/api/agent/stream`);

      eventSource.onopen = () => {
        setConnected(true);
        console.log('[AgentTerminal] Connected to agent stream');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'init':
              // Initial state from server
              setState(prev => ({
                ...prev,
                isWorking: data.data.isWorking,
                currentTask: data.data.currentTask,
                completedTasks: data.data.completedTasks || [],
                viewerCount: data.data.viewerCount || 1,
              }));
              if (data.data.currentOutput) {
                textBufferRef.current = data.data.currentOutput;
                displayIndexRef.current = data.data.currentOutput.length;
                setDisplayedText(data.data.currentOutput);
              }
              break;

            case 'task_start':
              // New task started
              resetOutput();
              setState(prev => ({
                ...prev,
                isWorking: true,
                currentTask: data.data.task,
                brainActive: data.data.brainActive || false,
                currentDecision: data.data.decision || null,
              }));
              break;

            case 'brain_status':
              setState(prev => ({
                ...prev,
                brainActive: data.data.active,
              }));
              break;

            case 'text':
              // Streaming text chunk
              appendText(data.data);
              break;

            case 'tool_start':
              // Tool execution starting
              appendText(`\n> [TOOL] ${data.data.tool}\n`);
              break;

            case 'tool_complete':
              // Tool execution finished
              if (data.data.result?.error) {
                appendText(`> [ERROR] ${data.data.result.error}\n`);
              }
              break;

            case 'agent_thought':
              // Agent explaining what it's doing
              appendText(`\n[THINKING] ${data.data.thought}\n`);
              break;

            case 'task_complete':
              // Task finished
              setState(prev => ({
                ...prev,
                isWorking: false,
                completedTasks: [
                  { title: data.data.title, agent: prev.currentTask?.agent || 'CLAW', completedAt: new Date().toISOString() },
                  ...prev.completedTasks.slice(0, 4),
                ],
              }));
              break;

            case 'git_deploy':
              // Code deployed to GitHub
              appendText(`\n[DEPLOYED] Commit ${data.data.commit} pushed to ${data.data.branch || 'main'}\n`);
              appendText(`  Message: ${data.data.message}\n`);
              appendText(`  View: https://github.com/CLAWchain/clawchain/commit/${data.data.commit}\n`);
              break;

            case 'status':
              if (data.data.status === 'idle') {
                setState(prev => ({ ...prev, isWorking: false }));
              }
              break;

            case 'heartbeat':
              setState(prev => ({ ...prev, viewerCount: data.viewerCount || prev.viewerCount }));
              break;
          }
        } catch (e) {
          console.error('[AgentTerminal] Parse error:', e);
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource?.close();
        // Reconnect after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [API_BASE, appendText, resetOutput]);

  // Parse and render output with syntax highlighting
  const renderOutput = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, i) => {
      // Tool execution
      if (line.startsWith('> [TOOL]')) {
        return (
          <div key={i} style={{ color: '#4ade80', fontWeight: 600, marginTop: 8, background: 'rgba(74, 222, 128, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
            {line}
          </div>
        );
      }
      
      // Executing indicator
      if (line.startsWith('[Executing:')) {
        return (
          <div key={i} style={{ color: '#fbbf24', fontStyle: 'italic', marginTop: 4 }}>
            {line}
          </div>
        );
      }
      
      // Thinking/reasoning
      if (line.startsWith('[THINKING]')) {
        return (
          <div key={i} style={{ color: '#a78bfa', fontStyle: 'italic', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 8px', borderRadius: 4, marginTop: 8 }}>
            {line.replace('[THINKING] ', '')}
          </div>
        );
      }
      
      // Git deploy
      if (line.startsWith('[DEPLOYED]')) {
        return (
          <div key={i} style={{ color: '#22c55e', fontWeight: 600, background: 'rgba(34, 197, 94, 0.15)', padding: '6px 10px', borderRadius: 4, marginTop: 8, borderLeft: '3px solid #22c55e' }}>
            {line}
          </div>
        );
      }
      
      // GitHub link
      if (line.includes('github.com/CLAWchain')) {
        return (
          <div key={i} style={{ paddingLeft: 12 }}>
            <a 
              href={line.replace('  View: ', '').trim()} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'underline' }}
            >
              {line}
            </a>
          </div>
        );
      }
      
      // Error
      if (line.startsWith('> [ERROR]')) {
        return (
          <div key={i} style={{ color: '#f87171', fontWeight: 600, background: 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
            {line}
          </div>
        );
      }
      
      // Code block detection
      if (line.startsWith('```')) {
        return (
          <div key={i} style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 4 }}>
            {line}
          </div>
        );
      }
      
      // Bold text (**text**)
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={i}>
            {parts.map((part, j) => 
              j % 2 === 1 ? (
                <span key={j} style={{ color: 'var(--coral)', fontWeight: 600 }}>{part}</span>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      // Headers
      if (line.startsWith('## ')) {
        return (
          <div key={i} style={{ color: 'var(--teal)', fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
            {line.replace('## ', '')}
          </div>
        );
      }
      
      // Code inside backticks
      if (line.includes('`') && !line.startsWith('```')) {
        const parts = line.split(/`([^`]+)`/g);
        return (
          <div key={i}>
            {parts.map((part, j) => 
              j % 2 === 1 ? (
                <code key={j} style={{ 
                  background: 'rgba(232, 90, 79, 0.15)', 
                  padding: '2px 6px', 
                  borderRadius: 4,
                  color: 'var(--coral-bright)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{part}</code>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      // List items
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} style={{ paddingLeft: 16 }}>
            <span style={{ color: 'var(--coral)' }}>•</span> {line.slice(2)}
          </div>
        );
      }
      
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={i} style={{ paddingLeft: 16 }}>
            <span style={{ color: 'var(--teal)' }}>{num}.</span> {line.replace(/^\d+\.\s/, '')}
          </div>
        );
      }
      
      // Regular line
      return <div key={i}>{line || '\u00A0'}</div>;
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Compact Terminal Status Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Mini traffic lights */}
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27CA40' }} />
          </div>
          
          {/* Path */}
          <div style={{ 
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            ~/agent
          </div>
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Brain status */}
          {state.brainActive && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              background: 'rgba(78, 205, 196, 0.15)',
              padding: '2px 6px',
              borderRadius: 8,
            }}>
              <span style={{ 
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--teal)',
                fontWeight: 700,
              }}>AI</span>
              <span style={{ 
                fontSize: 9, 
                color: 'var(--teal)',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
              }}>
                AUTO
              </span>
            </div>
          )}
          
          {/* Viewer count */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4,
            color: 'var(--text-muted)',
            fontSize: 11,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>view</span>
            <span>{state.viewerCount}</span>
          </div>
          
          {/* Connection status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: connected ? 'var(--teal)' : '#FF5F56',
              boxShadow: connected ? '0 0 6px var(--teal)' : 'none',
              animation: connected && state.isWorking ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{ 
              fontSize: 10, 
              color: connected ? 'var(--teal)' : 'var(--coral)',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
            }}>
              {connected ? (state.isWorking ? 'WORKING' : 'IDLE') : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Task Banner */}
      {state.currentTask && (
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'var(--coral)',
              color: 'var(--bg-primary)',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {state.currentTask.agent}
            </div>
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 500,
              flex: 1,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {state.currentTask.title}
            </div>
            {state.isWorking && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <div className="typing-indicator" style={{
                  display: 'flex',
                  gap: 3,
                }}>
                  <span style={{ 
                    width: 4, height: 4, borderRadius: '50%', 
                    background: 'var(--coral)',
                    animation: 'typing 1s ease-in-out infinite',
                    animationDelay: '0s',
                  }} />
                  <span style={{ 
                    width: 4, height: 4, borderRadius: '50%', 
                    background: 'var(--coral)',
                    animation: 'typing 1s ease-in-out infinite',
                    animationDelay: '0.2s',
                  }} />
                  <span style={{ 
                    width: 4, height: 4, borderRadius: '50%', 
                    background: 'var(--coral)',
                    animation: 'typing 1s ease-in-out infinite',
                    animationDelay: '0.4s',
                  }} />
                </div>
              </div>
            )}
          </div>
          {/* Brain decision reasoning - shown as agent's thinking */}
          {state.brainActive && state.currentDecision && state.currentDecision.reasoning && (
            <div style={{
              marginTop: 8,
              padding: '8px 12px',
              background: 'rgba(78, 205, 196, 0.08)',
              borderRadius: 6,
              borderLeft: '3px solid var(--teal)',
              fontStyle: 'italic',
            }}>
              <div style={{ 
                fontSize: 12, 
                color: 'var(--text-secondary)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                "{state.currentDecision.reasoning}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Output Area */}
      <div 
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          background: 'var(--bg-primary)',
        }}
      >
        {displayedText ? (
          <>
            {renderOutput(displayedText)}
            {/* Blinking cursor */}
            {state.isWorking && (
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 16,
                background: 'var(--coral)',
                animation: 'blink 1s step-end infinite',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
              }} />
            )}
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {connected ? 'Waiting for agent to start working...' : 'Connecting to agent stream...'}
          </div>
        )}
      </div>

      {/* Recent Tasks Footer */}
      {state.completedTasks.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '10px 16px',
        }}>
          <div style={{ 
            fontSize: 10, 
            color: 'var(--text-muted)', 
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Recent Work
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {state.completedTasks.slice(0, 3).map((task, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ color: 'var(--teal)' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{task.title.replace(/^(Building|Auditing|Analyzing|Proposing|Documenting|Writing):\s*/, '')}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{formatTime(task.completedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @keyframes typing {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
};

export default AgentTerminal;
