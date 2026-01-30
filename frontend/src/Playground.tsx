import React, { useState, useEffect, useRef } from 'react';

interface BuildLogEntry {
  timestamp: number;
  type: 'thinking' | 'coding' | 'testing' | 'complete';
  content: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  reasoning: string;
  code: string;
  buildLog: BuildLogEntry[];
  status: 'building' | 'complete';
  buildProgress: number;
  createdAt: number;
  completedAt: number | null;
}

interface WorkshopState {
  tools: Tool[];
  isBuilding: boolean;
  currentBuildingTool: Tool | null;
  totalTools: number;
  isComplete: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  wallet: '[WALLET]',
  defi: '[DEFI]',
  nft: '[NFT]',
  utility: '[UTIL]',
  analytics: '[DATA]',
  security: '[SECURITY]'
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDuration = (start: number, end: number) => {
  const diff = end - start;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

export const Playground: React.FC = () => {
  const [state, setState] = useState<WorkshopState>({
    tools: [],
    isBuilding: false,
    currentBuildingTool: null,
    totalTools: 6,
    isComplete: false
  });
  const [buildStream, setBuildStream] = useState<{
    thinking: string;
    currentCode: string;
    status: string;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'code' | 'log'>('reasoning');
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const connectStream = () => {
      const eventSource = new EventSource('/api/playground/stream');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'init') {
            setState({
              tools: data.tools || [],
              isBuilding: data.isBuilding,
              currentBuildingTool: data.currentBuildingTool,
              totalTools: data.totalTools,
              isComplete: data.isComplete
            });
            if (data.currentBuildingTool) {
              setBuildStream({
                thinking: '',
                currentCode: '',
                status: 'building'
              });
            }
          } else if (data.type === 'viewers') {
            setViewerCount(data.count);
          } else if (data.type === 'build_start') {
            setState(prev => ({
              ...prev,
              isBuilding: true,
              currentBuildingTool: data.tool
            }));
            setBuildStream({
              thinking: data.thinking || '',
              currentCode: '',
              status: 'thinking'
            });
          } else if (data.type === 'thinking') {
            setBuildStream(prev => prev ? { ...prev, thinking: data.content, status: 'thinking' } : null);
          } else if (data.type === 'code_chunk') {
            setBuildStream(prev => prev ? { 
              ...prev, 
              currentCode: prev.currentCode + data.chunk,
              status: 'coding'
            } : null);
          } else if (data.type === 'build_progress') {
            setState(prev => ({
              ...prev,
              currentBuildingTool: prev.currentBuildingTool 
                ? { ...prev.currentBuildingTool, buildProgress: data.progress }
                : null
            }));
          } else if (data.type === 'build_complete') {
            setState(prev => ({
              ...prev,
              tools: [...prev.tools.filter(t => t.id !== data.tool.id), data.tool],
              isBuilding: false,
              currentBuildingTool: null,
              isComplete: prev.tools.length + 1 >= prev.totalTools
            }));
            setBuildStream(null);
          } else if (data.type === 'build_log') {
            // Update build log for current tool
            setState(prev => ({
              ...prev,
              currentBuildingTool: prev.currentBuildingTool
                ? { ...prev.currentBuildingTool, buildLog: [...(prev.currentBuildingTool.buildLog || []), data.entry] }
                : null
            }));
          }
        } catch (e) {
          console.error('Failed to parse event:', e);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
        setTimeout(connectStream, 3000);
      };

      return () => eventSource.close();
    };

    const cleanup = connectStream();
    return cleanup;
  }, []);

  useEffect(() => {
    if (codeRef.current && buildStream?.currentCode) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [buildStream?.currentCode]);

  const renderToolDetail = (tool: Tool) => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--cc-border)',
        marginBottom: '16px'
      }}>
        {(['reasoning', 'code', 'log'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--cc-coral)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase'
            }}
          >
            {tab === 'reasoning' ? 'WHY THIS TOOL' : tab === 'code' ? 'SOURCE CODE' : 'BUILD LOG'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'reasoning' && (
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            color: 'var(--cc-text-secondary)',
            fontSize: '12px',
            lineHeight: 1.7
          }}>
            {tool.reasoning}
          </div>
        )}

        {activeTab === 'code' && (
          <pre style={{
            margin: 0,
            padding: '12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            fontSize: '11px',
            lineHeight: 1.5,
            color: 'var(--cc-text-secondary)',
            overflow: 'auto'
          }}>
            <code>{tool.code}</code>
          </pre>
        )}

        {activeTab === 'log' && (
          <div style={{ fontSize: '11px' }}>
            {tool.buildLog && tool.buildLog.length > 0 ? (
              tool.buildLog.map((entry, i) => (
                <div key={i} style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--cc-border)',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <span style={{ color: 'var(--cc-text-muted)', minWidth: '70px' }}>
                    {formatTime(entry.timestamp)}
                  </span>
                  <span style={{ 
                    color: entry.type === 'complete' ? '#4CAF50' : 
                           entry.type === 'thinking' ? 'var(--cc-coral)' : 
                           'var(--cc-text-secondary)',
                    textTransform: 'uppercase',
                    minWidth: '60px',
                    fontSize: '10px'
                  }}>
                    [{entry.type}]
                  </span>
                  <span style={{ color: 'var(--cc-text-secondary)' }}>
                    {entry.content}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--cc-text-muted)', padding: '20px', textAlign: 'center' }}>
                No build log available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Build Info Footer */}
      {tool.completedAt && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--cc-bg-tertiary)',
          borderRadius: '4px',
          fontSize: '10px',
          color: 'var(--cc-text-muted)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Built: {new Date(tool.createdAt).toLocaleString()}</span>
          <span>Duration: {formatDuration(tool.createdAt, tool.completedAt)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      padding: '24px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <div className="card" style={{
        border: '1px solid var(--border)',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'center',
        borderRadius: '12px',
        background: 'var(--bg-card)'
      }}>
        <h2 style={{ 
          background: 'linear-gradient(135deg, var(--coral) 0%, var(--teal) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0, 
          fontSize: '24px',
          fontWeight: 700
        }}>
          Claw Workshop
        </h2>
        <div style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '13px' }}>
          Claw builds essential tools for ClawChain — one at a time, with purpose
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          marginTop: '16px',
          fontSize: '12px'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>
            STATUS: <span style={{ color: isConnected ? 'var(--teal)' : 'var(--coral)' }}>
              {isConnected ? 'CONNECTED' : 'RECONNECTING...'}
            </span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            TOOLS: <span style={{ color: 'var(--coral)' }}>
              {state.tools.length}/{state.totalTools}
            </span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            VIEWERS: <span style={{ color: 'var(--teal)' }}>{viewerCount}</span>
          </span>
        </div>
        {state.isComplete && (
          <div style={{ 
            marginTop: '16px', 
            padding: '10px 20px', 
            background: 'var(--teal-dim)',
            border: '1px solid var(--teal)', 
            borderRadius: '8px',
            color: 'var(--teal)',
            fontSize: '12px',
            fontWeight: 500
          }}>
            ALL TOOLS COMPLETE — Workshop finished
          </div>
        )}
      </div>

      {/* Currently Building */}
      {state.isBuilding && state.currentBuildingTool && buildStream && (
        <div className="card" style={{
          border: '1px solid var(--coral)',
          borderRadius: '12px',
          marginBottom: '24px',
          overflow: 'hidden',
          background: 'var(--bg-card)'
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--coral-dim)'
          }}>
            <div>
              <span style={{ color: 'var(--coral)', fontWeight: 600, fontSize: '13px' }}>
                Building: {state.currentBuildingTool.name}
              </span>
              <span style={{ 
                marginLeft: '12px', 
                color: 'var(--text-muted)', 
                fontSize: '11px' 
              }}>
                {state.currentBuildingTool.buildProgress}%
              </span>
            </div>
            <div style={{
              width: '200px',
              height: '6px',
              background: 'var(--bg-primary)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${state.currentBuildingTool.buildProgress}%`,
                background: 'var(--coral)',
                transition: 'width 0.5s'
              }} />
            </div>
          </div>

          {buildStream.thinking && buildStream.status === 'thinking' && (
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--coral-dim)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--coral)', fontWeight: 'bold', fontSize: '18px' }}>*</span>
                <p style={{ 
                  margin: 0, 
                  color: 'var(--text-secondary)', 
                  fontStyle: 'italic',
                  fontSize: '13px',
                  lineHeight: 1.6
                }}>
                  {buildStream.thinking}
                </p>
              </div>
            </div>
          )}

          {buildStream.currentCode && (
            <div>
              <div style={{
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}>
                {state.currentBuildingTool.id}.tsx
              </div>
              <pre ref={codeRef} style={{
                margin: 0,
                padding: '16px 20px',
                maxHeight: '250px',
                overflowY: 'auto',
                background: 'var(--bg-primary)',
                fontSize: '11px',
                lineHeight: 1.5,
                color: 'var(--text-secondary)'
              }}>
                <code>{buildStream.currentCode}</code>
                <span style={{ color: 'var(--coral)', animation: 'blink 0.8s infinite' }}>|</span>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Built Tools */}
      <div style={{
        textAlign: 'center',
        color: 'var(--text-muted)',
        margin: '24px 0',
        fontSize: '12px',
        fontWeight: 500
      }}>
        COMPLETED TOOLS
      </div>

      {state.tools.length === 0 && !state.isBuilding && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '60px 20px',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          background: 'var(--bg-card)'
        }}>
          <div style={{ fontSize: '36px', color: 'var(--coral)', marginBottom: '16px', fontWeight: 'bold' }}>*</div>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0', fontSize: '13px' }}>
            Waiting for Claw to begin building...
          </p>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '12px' }}>
            Each tool takes approximately 30 minutes to build with full reasoning
          </p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {state.tools.filter(t => t.status === 'complete').map(tool => (
          <div 
            key={tool.id}
            onClick={() => setSelectedTool(tool)}
            className="card"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}>
              <span style={{ color: 'var(--coral)', fontSize: '10px', fontWeight: 600 }}>
                {CATEGORY_LABELS[tool.category] || '[TOOL]'}
              </span>
              <span style={{
                fontSize: '9px',
                padding: '3px 8px',
                background: 'var(--teal-dim)',
                color: 'var(--teal)',
                borderRadius: '5px',
                fontWeight: 500
              }}>COMPLETE</span>
            </div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {tool.name}
            </h4>
            <p style={{ 
              margin: '0 0 14px 0', 
              color: 'var(--text-muted)', 
              fontSize: '12px',
              lineHeight: 1.5
            }}>
              {tool.description}
            </p>
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border)',
              paddingTop: '12px',
              marginTop: '12px'
            }}>
              Built {tool.completedAt ? new Date(tool.completedAt).toLocaleDateString() : 'recently'}
            </div>
            <button style={{
              width: '100%',
              padding: '10px',
              marginTop: '14px',
              background: 'var(--coral-dim)',
              border: '1px solid var(--coral)',
              borderRadius: '8px',
              color: 'var(--coral)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              transition: 'all 0.2s'
            }}>
              VIEW DETAILS
            </button>
          </div>
        ))}
      </div>

      {/* Tool Detail Modal */}
      {selectedTool && (
        <div 
          onClick={() => setSelectedTool(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '700px',
              height: '80vh',
              background: 'var(--cc-bg-primary)',
              border: '1px solid var(--cc-coral)',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--cc-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--cc-bg-secondary)'
            }}>
              <div>
                <span style={{ color: 'var(--cc-coral)', fontSize: '10px' }}>
                  {CATEGORY_LABELS[selectedTool.category]}
                </span>
                <h3 style={{ margin: '4px 0 0', color: 'var(--cc-text-primary)', fontSize: '16px' }}>
                  {selectedTool.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTool(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--cc-bg-tertiary)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'var(--cc-text-primary)',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >×</button>
            </div>
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
              {renderToolDetail(selectedTool)}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Playground;
