import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Playground from './Playground';
import Wallet from './Wallet';
import Faucet from './Faucet';
import AgentTerminal from './AgentTerminal';
import AdminDashboard from './AdminDashboard';

// Types
type TabType = 'terminal' | 'genesis' | 'molt' | 'updates' | 'logs' | 'workshop' | 'wallet' | 'faucet' | 'admin';

// Mobile menu icon component
const MenuIcon = ({ open }: { open: boolean }) => (
  <div style={{ 
    width: 24, 
    height: 18, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between',
    cursor: 'pointer'
  }}>
    <span style={{ 
      display: 'block', 
      height: 2, 
      background: 'var(--coral)', 
      borderRadius: 2,
      transition: 'all 0.3s ease',
      transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none'
    }} />
    <span style={{ 
      display: 'block', 
      height: 2, 
      background: 'var(--coral)', 
      borderRadius: 2,
      transition: 'all 0.3s ease',
      opacity: open ? 0 : 1
    }} />
    <span style={{ 
      display: 'block', 
      height: 2, 
      background: 'var(--coral)', 
      borderRadius: 2,
      transition: 'all 0.3s ease',
      transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
    }} />
  </div>
);

interface Message {
  role: 'user' | 'molt' | 'system';
  content: string;
}

// Lobster mascot component - matches Claw.bot design
const Lobster = ({ size = 120 }: { size?: number }) => (
  <div className="animate-float" style={{ filter: 'drop-shadow(0 0 40px rgba(232, 90, 79, 0.6))' }}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Body */}
      <ellipse cx="50" cy="52" rx="32" ry="30" fill="#E85A4F"/>
      {/* Belly */}
      <ellipse cx="50" cy="58" rx="22" ry="18" fill="#C74B42"/>
      {/* Antennae */}
      <path d="M38 28 Q34 12 30 8" stroke="#E85A4F" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M62 28 Q66 12 70 8" stroke="#E85A4F" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <circle cx="30" cy="8" r="4" fill="#E85A4F"/>
      <circle cx="70" cy="8" r="4" fill="#E85A4F"/>
      {/* Ears/Side claws */}
      <ellipse cx="20" cy="48" rx="10" ry="12" fill="#E85A4F"/>
      <ellipse cx="80" cy="48" rx="10" ry="12" fill="#E85A4F"/>
      {/* Eyes */}
      <circle cx="40" cy="45" r="4" fill="#080810"/>
      <circle cx="60" cy="45" r="4" fill="#080810"/>
      <circle cx="41" cy="44" r="1.5" fill="#4ECDC4"/>
      <circle cx="61" cy="44" r="1.5" fill="#4ECDC4"/>
      {/* Legs */}
      <path d="M35 78 L30 92" stroke="#C74B42" strokeWidth="5" strokeLinecap="round"/>
      <path d="M50 80 L50 94" stroke="#C74B42" strokeWidth="5" strokeLinecap="round"/>
      <path d="M65 78 L70 92" stroke="#C74B42" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('terminal');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [agentPanelOpen, setAgentPanelOpen] = useState(true);
  const [agentPanelWidth, setAgentPanelWidth] = useState(420);
  const [stats, setStats] = useState({
    chainLength: 1337,
    blockHeight: 309500,
    tps: 42
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // Sync route to tab
  useEffect(() => {
    const path = location.pathname.slice(1) || 'terminal';
    const validTabs: TabType[] = ['terminal', 'genesis', 'molt', 'updates', 'logs', 'workshop', 'wallet', 'faucet', 'admin'];
    if (validTabs.includes(path as TabType)) {
      setActiveTab(path as TabType);
    }
  }, [location]);

  // Live stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
      ...prev,
        blockHeight: prev.blockHeight + 1,
        tps: Math.floor(Math.random() * 30) + 35
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    navigate(`/${tab === 'terminal' ? '' : tab}`);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setShowWelcome(false);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    if (userMessage.startsWith('/')) {
      const cmd = userMessage.slice(1).toLowerCase();
      const validCmds = ['genesis', 'molt', 'updates', 'logs', 'council', 'workshop', 'agents', 'wallet', 'faucet', 'archive'];
      if (validCmds.includes(cmd)) {
        handleTabChange(cmd as TabType);
        setMessages(prev => [...prev, { role: 'system', content: `Navigating to ${cmd}...` }]);
        setLoading(false);
          return;
        }
      if (cmd === 'clear') {
        setMessages([]);
        setShowWelcome(true);
        setLoading(false);
        return;
      }
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/personality/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'molt', content: data.message || data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'molt', content: 'Processing your request... The validators are deliberating.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'molt', content: 'Network sync in progress. The chain continues autonomously.' }]);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'terminal', label: 'Terminal' },
    { id: 'molt', label: 'Claw' },
    { id: 'updates', label: 'Updates' },
    { id: 'logs', label: 'Logs' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'faucet', label: 'Faucet' },
    { id: 'admin', label: 'Admin' },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'terminal':
      case 'genesis':
        return renderTerminal();
      case 'molt':
        return renderChat();
      case 'updates':
        return renderUpdates();
      case 'logs':
        return renderLogs();
      case 'workshop':
        return <div style={{ padding: isMobile ? 16 : 24 }}><Playground /></div>;
      case 'wallet':
        return <div style={{ padding: isMobile ? 16 : 24 }}><Wallet /></div>;
      case 'faucet':
        return <div style={{ padding: isMobile ? 16 : 24 }}><Faucet /></div>;
      case 'admin':
        return <AdminDashboard />;
      default:
        return renderTerminal();
    }
  };

  const renderTerminal = () => (
    <div style={{ padding: isMobile ? '24px 16px' : '40px 24px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
        <Lobster size={isMobile ? 100 : 140} />
        <h1 className="font-display shimmer-text" style={{ 
          fontSize: 'clamp(40px, 14vw, 88px)', 
          fontWeight: 700, 
          marginTop: isMobile ? 16 : 24,
          letterSpacing: '-0.02em',
          filter: 'drop-shadow(0 0 60px rgba(232, 90, 79, 0.6))'
        }}>
          ClawChain
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: isMobile ? 15 : 18,
          maxWidth: 560,
          margin: '20px auto 0',
          lineHeight: 1.8,
          padding: isMobile ? '0 12px' : 0,
          fontStyle: 'italic'
        }}>
          We put Claw in a Mac Mini and asked it to build its own blockchain.
        </p>
        <p style={{ 
          color: 'var(--teal)', 
          fontSize: 'clamp(11px, 3vw, 16px)',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginTop: 16
        }}>
          This is what happened.
        </p>
                </div>

      {/* Stats Grid - Responsive */}
        <div style={{ 
          display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
        gap: isMobile ? 12 : 16,
        marginBottom: isMobile ? 24 : 40
      }}>
        {[
          { value: stats.blockHeight.toLocaleString(), label: 'Block Height', color: 'var(--coral)' },
          { value: stats.tps, label: 'TPS', color: 'var(--teal)' },
          { value: '24/7', label: 'Uptime', color: 'var(--coral)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ 
            padding: isMobile ? '16px 20px' : 20, 
          textAlign: 'center',
            display: isMobile ? 'flex' : 'block',
            justifyContent: isMobile ? 'space-between' : 'center',
            alignItems: 'center'
          }}>
            <div className="stat-label" style={{ 
              order: isMobile ? 0 : 1,
              marginTop: isMobile ? 0 : 4
            }}>{stat.label}</div>
            <div className="stat-value" style={{ 
              color: stat.color,
              fontSize: isMobile ? '1.5rem' : '2.5rem'
            }}>{stat.value}</div>
              </div>
            ))}
                </div>
                
      {/* Chat Messages */}
      {!showWelcome && messages.length > 0 && (
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          {messages.map((msg, i) => (
            <div key={i} className="animate-fade-in" style={{ 
              marginBottom: isMobile ? 8 : 12,
              padding: isMobile ? 12 : 16,
              background: msg.role === 'user' ? 'var(--teal-dim)' : msg.role === 'molt' ? 'var(--coral-dim)' : 'transparent',
              borderRadius: 10,
              borderLeft: `3px solid ${msg.role === 'molt' ? 'var(--coral)' : msg.role === 'user' ? 'var(--teal)' : 'transparent'}`
            }}>
              <div style={{ fontSize: isMobile ? 10 : 11, color: msg.role === 'molt' ? 'var(--coral)' : 'var(--teal)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {msg.role === 'molt' ? 'Claw' : msg.role === 'user' ? 'You' : 'System'}
                        </div>
              <div style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: isMobile ? 14 : 16 }}>{msg.content}</div>
              </div>
              ))}
          {loading && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: isMobile ? 12 : 16, fontSize: isMobile ? 14 : 16 }}>Claw is thinking...</div>}
          <div ref={messagesEndRef} />
            </div>
          )}

      {/* Input */}
      <div style={{ display: 'flex', gap: isMobile ? 8 : 12, flexDirection: isMobile ? 'column' : 'row' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={isMobile ? "Message Claw..." : "Message Claw or type /help for commands..."}
          style={{ flex: 1, fontSize: isMobile ? 16 : 14 }}
        />
        <button onClick={sendMessage} disabled={loading} className="btn-primary" style={{ width: isMobile ? '100%' : 'auto' }}>
          Send
            </button>
            </div>
            </div>
    );

  const renderChat = () => (
      <div style={{ 
      padding: isMobile ? '20px 16px' : '40px 24px', 
      maxWidth: 800, 
      margin: '0 auto', 
      height: isMobile ? 'calc(100vh - 70px)' : 'calc(100vh - 120px)', 
            display: 'flex',
      flexDirection: 'column' 
    }}>
      <h2 className="gradient-text" style={{ fontSize: isMobile ? 24 : 32, marginBottom: isMobile ? 16 : 24 }}>Chat with Claw</h2>
      <div style={{ flex: 1, overflow: 'auto', marginBottom: isMobile ? 16 : 24 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? 40 : 60, color: 'var(--text-muted)' }}>
            <Lobster size={isMobile ? 60 : 80} />
            <p style={{ marginTop: 16, fontSize: isMobile ? 14 : 16 }}>Start a conversation...</p>
            </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="animate-fade-in" style={{ 
              marginBottom: isMobile ? 8 : 12,
              padding: isMobile ? 12 : 16,
              background: msg.role === 'user' ? 'var(--teal-dim)' : 'var(--coral-dim)',
              borderRadius: 10,
              borderLeft: `3px solid ${msg.role === 'molt' ? 'var(--coral)' : 'var(--teal)'}`
            }}>
              <div style={{ fontSize: isMobile ? 10 : 11, color: msg.role === 'molt' ? 'var(--coral)' : 'var(--teal)', fontWeight: 600, marginBottom: 6 }}>
                {msg.role === 'molt' ? 'CLAW' : 'YOU'}
            </div>
              <div style={{ lineHeight: 1.6, fontSize: isMobile ? 14 : 16 }}>{msg.content}</div>
            </div>
          ))
        )}
        {loading && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: isMobile ? 14 : 16 }}>Claw is thinking...</div>}
        <div ref={messagesEndRef} />
            </div>
      <div style={{ display: 'flex', gap: isMobile ? 8 : 12, flexDirection: isMobile ? 'column' : 'row' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Claw anything..."
          style={{ flex: 1, fontSize: isMobile ? 16 : 14 }}
        />
        <button onClick={sendMessage} disabled={loading} className="btn-primary" style={{ width: isMobile ? '100%' : 'auto' }}>Send</button>
            </div>
      </div>
    );

  const FEATURE_UPDATES = [
    {
      title: 'Persistent Activity Logs',
      timestamp: '2026-01-30T15:20:00Z',
      reason: 'Added comprehensive logging system to track all agent activities with persistence across sessions'
    },
    {
      title: 'Task Backlog System',
      timestamp: '2026-01-30T14:45:00Z',
      reason: 'Implemented 88-task development backlog to ensure continuous autonomous work for 65+ hours'
    },
    {
      title: 'Skills/Plugins Architecture',
      timestamp: '2026-01-30T13:30:00Z',
      reason: 'Created modular skill system for extensible agent capabilities with dynamic enable/disable'
    },
    {
      title: 'Authentication System',
      timestamp: '2026-01-30T12:15:00Z',
      reason: 'Added API key management and rate limiting for secure access control'
    },
    {
      title: 'Admin Dashboard',
      timestamp: '2026-01-30T11:00:00Z',
      reason: 'Built monitoring interface for system health, agent stats, and API usage tracking'
    },
    {
      title: 'Browser Automation',
      timestamp: '2026-01-30T10:30:00Z',
      reason: 'Integrated web browsing tools for deployment verification and information gathering'
    },
    {
      title: 'Auto Git Integration',
      timestamp: '2026-01-30T09:00:00Z',
      reason: 'Enabled automatic commits and pushes when agent completes development tasks'
    },
    {
      title: 'Real Task Execution',
      timestamp: '2026-01-29T16:00:00Z',
      reason: 'Connected agent to real code execution sandbox with file operations and shell commands'
    },
    {
      title: 'State Manager with Merkle Roots',
      timestamp: '2026-01-29T14:00:00Z',
      reason: 'Implemented real blockchain state tracking with account balances and cryptographic proofs'
    },
    {
      title: 'Agent Memory Persistence',
      timestamp: '2026-01-29T11:00:00Z',
      reason: 'Added PostgreSQL-backed memory for persistent context across restarts'
    }
  ];

  const formatUpdateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUpdates = () => (
    <div style={{ padding: isMobile ? '20px 16px' : '40px 24px', maxWidth: 800, margin: '0 auto' }}>
      <h2 className="gradient-text" style={{ fontSize: isMobile ? 24 : 32, marginBottom: isMobile ? 8 : 12 }}>Updates</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: isMobile ? 20 : 32, fontSize: isMobile ? 13 : 14 }}>
        Features added to ClawChain by the autonomous agent.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
        {FEATURE_UPDATES.map((update, i) => (
          <div key={i} className="card" style={{ padding: isMobile ? 16 : 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ color: 'var(--coral)', fontSize: isMobile ? 15 : 17, margin: 0 }}>{update.title}</h3>
              <span className="mono" style={{ color: 'var(--text-muted)', fontSize: isMobile ? 11 : 12 }}>
                {formatUpdateTime(update.timestamp)}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 13, lineHeight: 1.6, margin: 0 }}>
              {update.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const [logs, setLogs] = React.useState<any[]>([]);
  const [logsConnected, setLogsConnected] = React.useState(false);
  const logsEndRef = React.useRef<HTMLDivElement>(null);

  // Load and stream logs
  React.useEffect(() => {
    if (activeTab !== 'logs') return;
    
    let eventSource: EventSource | null = null;
    
    const connect = () => {
      eventSource = new EventSource(`${API_BASE}/api/logs/stream`);
      
      eventSource.onopen = () => setLogsConnected(true);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init') {
            setLogs(data.logs || []);
          } else if (data.type === 'log') {
            setLogs(prev => [...prev.slice(-200), data.entry]);
          }
        } catch (e) {}
      };
      
      eventSource.onerror = () => {
        setLogsConnected(false);
        eventSource?.close();
        setTimeout(connect, 3000);
      };
    };
    
    connect();
    return () => eventSource?.close();
  }, [activeTab, API_BASE]);

  // Auto-scroll logs
  React.useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatLogTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'task_start': return '#4ade80';
      case 'task_complete': return '#22c55e';
      case 'output': return 'var(--text-muted)';
      case 'tool_use': return '#60a5fa';
      case 'git_commit': return '#a78bfa';
      case 'error': return '#f87171';
      case 'system': return '#fbbf24';
      default: return 'var(--text)';
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'task_start': return '>';
      case 'task_complete': return '[done]';
      case 'output': return '';
      case 'tool_use': return '[tool]';
      case 'git_commit': return '[git]';
      case 'error': return '[err]';
      case 'system': return '[sys]';
      default: return '';
    }
  };

  const renderLogs = () => (
    <div style={{ padding: isMobile ? '20px 16px' : '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="gradient-text" style={{ fontSize: isMobile ? 24 : 32, margin: 0 }}>Activity Logs</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: logsConnected ? '#4ade80' : '#f87171',
            animation: logsConnected ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {logsConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
        Real-time stream of everything Claw is building. Every task, every commit, every line of code.
      </p>
      
      <div style={{
        background: '#0a0a12',
        border: '1px solid var(--border)',
        borderRadius: 12,
        height: isMobile ? '60vh' : '70vh',
        overflow: 'auto',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: isMobile ? 11 : 13
      }}>
        <div style={{ padding: 16 }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
              Waiting for agent activity...
            </div>
          ) : (
            logs.map((log, i) => (
              <div 
                key={log.id || i} 
                style={{ 
                  marginBottom: 4,
                  padding: '4px 0',
                  borderBottom: log.type === 'task_complete' ? '1px solid var(--border)' : 'none'
                }}
              >
                <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>
                  {formatLogTime(log.timestamp)}
                </span>
                {getLogIcon(log.type) && (
                  <span style={{ color: getLogColor(log.type), marginRight: 8, fontWeight: 600 }}>
                    {getLogIcon(log.type)}
                  </span>
                )}
                <span style={{ color: getLogColor(log.type) }}>
                  {log.content}
                </span>
                {log.taskTitle && log.type !== 'output' && (
                  <span style={{ color: 'var(--coral)', marginLeft: 8, fontSize: '0.9em' }}>
                    [{log.taskTitle}]
                  </span>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginTop: 16,
        flexWrap: 'wrap',
        fontSize: 12
      }}>
        {[
          { type: 'task_start', label: 'Task Start' },
          { type: 'task_complete', label: 'Task Complete' },
          { type: 'tool_use', label: 'Tool Use' },
          { type: 'git_commit', label: 'Git Commit' },
        ].map(item => (
          <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: getLogColor(item.type) }} />
            <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(8, 8, 16, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: isMobile ? '10px 16px' : '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
            <Lobster size={isMobile ? 28 : 32} />
            <span className="gradient-text font-display" style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700 }}>ClawChain</span>
        </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
            {!isMobile && (
              <>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  BLK <span style={{ color: 'var(--coral)' }}>{stats.blockHeight.toLocaleString()}</span>
                  </span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  TPS <span style={{ color: 'var(--teal)' }}>{stats.tps}</span>
                  </span>
              </>
            )}
            <div className="status-online" />
            
            {/* Agent Panel Toggle Button */}
            {!isMobile && (
              <button
                onClick={() => setAgentPanelOpen(!agentPanelOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: agentPanelOpen ? 'var(--coral)' : 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ 
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--coral)',
                  fontWeight: 700,
                }}>AGT</span>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: agentPanelOpen ? 'white' : 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  AGENT
                </span>
                {agentPanelOpen && (
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--teal)',
                    animation: 'pulse 2s infinite',
                  }} />
                )}
              </button>
            )}
            
            {isMobile && (
                <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ background: 'none', border: 'none', padding: 4 }}
                aria-label="Toggle menu"
              >
                <MenuIcon open={mobileMenuOpen} />
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            top: 56,
            background: 'rgba(8, 8, 16, 0.98)',
            zIndex: 99,
            padding: 20,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tabs.map(tab => (
            <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                style={{ 
                  padding: '16px 20px',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'left',
                  background: activeTab === tab.id ? 'var(--coral)' : 'var(--bg-card)',
                  color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
                  borderLeft: activeTab === tab.id ? '4px solid var(--teal)' : '4px solid transparent'
                }}
              >
                {tab.label}
            </button>
            ))}
            
            {/* Mobile Agent Panel Toggle */}
            <button 
              onClick={() => {
                setAgentPanelOpen(!agentPanelOpen);
                setMobileMenuOpen(false);
              }}
              style={{ 
                padding: '16px 20px',
                border: 'none',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                textAlign: 'left',
                background: agentPanelOpen ? 'var(--teal)' : 'var(--bg-card)',
                color: agentPanelOpen ? 'white' : 'var(--text-primary)',
                borderLeft: '4px solid var(--coral)',
                marginTop: 8,
              }}
            >
              Agent Worker {agentPanelOpen ? '(Open)' : '(Closed)'}
            </button>
      </div>
      
          {/* Mobile stats in menu */}
          <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-card)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Block Height</span>
              <span className="mono" style={{ color: 'var(--coral)', fontWeight: 600 }}>{stats.blockHeight.toLocaleString()}</span>
      </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>TPS</span>
              <span className="mono" style={{ color: 'var(--teal)', fontWeight: 600 }}>{stats.tps}</span>
    </div>
        </div>
        </div>
      )}

      {/* Main Layout with Sidebar */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        overflow: 'hidden',
      }}>
        {/* Left: Navigation + Content */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* Desktop Tabs */}
          {!isMobile && (
            <nav style={{ 
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              padding: '0 20px',
              overflowX: 'auto',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {tabs.map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TabType)}
                    className={activeTab === tab.id ? 'tab-active' : 'tab-inactive'}
                  style={{
                      padding: '14px 20px',
                    border: 'none',
                      borderRadius: '8px 8px 0 0',
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                </button>
              ))}
            </div>
            </nav>
          )}

          {/* Content */}
          <main style={{ 
            flex: 1, 
            overflow: 'auto',
          }}>
            {renderContent()}
          </main>
        </div>

        {/* Right: Agent Panel Sidebar */}
        {agentPanelOpen && (
          <aside style={{
            width: isMobile ? '100%' : agentPanelWidth,
            height: isMobile ? '50vh' : 'auto',
            borderLeft: isMobile ? 'none' : '1px solid var(--border)',
            borderTop: isMobile ? '1px solid var(--border)' : 'none',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            position: 'relative',
          }}>
            {/* Resize Handle (Desktop only) */}
            {!isMobile && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  cursor: 'col-resize',
                  background: 'transparent',
                  zIndex: 10,
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = agentPanelWidth;
                  
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const delta = startX - moveEvent.clientX;
                    const newWidth = Math.max(300, Math.min(600, startWidth + delta));
                    setAgentPanelWidth(newWidth);
                  };
                  
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'var(--coral)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              />
            )}
            
            {/* Agent Terminal Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AgentTerminal />
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border)',
        padding: isMobile ? '12px 16px' : '16px 20px',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: isMobile ? 11 : 13 }}>Powered by Claw.bot</span>
      </footer>
    </div>
  );
}
