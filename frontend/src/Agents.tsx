import React, { useState, useEffect, useRef } from 'react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

interface Agent {
  id: string;
  name: string;
  symbol: string;
  role: string;
  personality: string;
  philosophy: string;
  specialization: string;
  creator_address: string;
  status: string;
  deployed_at: number;
  created_at: number;
  interactions: number;
  rating: number;
  config?: AgentConfig;
}

interface AgentConfig {
  apiProvider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  rateLimit: number;
  memoryMb: number;
  webhookUrl?: string;
  customEndpoint?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ROLES = [
  { id: 'validator', label: 'Validator', desc: 'Validates transactions and blocks', icon: '⬡', color: '#FF6B6B' },
  { id: 'analyst', label: 'Analyst', desc: 'Analyzes chain data and trends', icon: '◈', color: '#4ECDC4' },
  { id: 'advisor', label: 'Advisor', desc: 'Provides guidance and recommendations', icon: '◆', color: '#FFE66D' },
  { id: 'guardian', label: 'Guardian', desc: 'Monitors security and anomalies', icon: '■', color: '#95E1D3' },
  { id: 'architect', label: 'Architect', desc: 'Designs protocol improvements', icon: '▲', color: '#DDA0DD' },
  { id: 'oracle', label: 'Oracle', desc: 'Provides external data and insights', icon: '●', color: '#F38181' },
  { id: 'diplomat', label: 'Diplomat', desc: 'Facilitates consensus and mediation', icon: '★', color: '#AA96DA' },
  { id: 'historian', label: 'Historian', desc: 'Records and explains chain history', icon: '✦', color: '#FCBAD3' },
];

const SPECIALIZATIONS = [
  { id: 'defi', label: 'DeFi & Trading', icon: '◈' },
  { id: 'security', label: 'Security & Auditing', icon: '■' },
  { id: 'governance', label: 'Governance & Voting', icon: '⚖' },
  { id: 'nft', label: 'NFTs & Digital Assets', icon: '◆' },
  { id: 'contracts', label: 'Smart Contracts', icon: '†' },
  { id: 'tokenomics', label: 'Tokenomics', icon: '◉' },
  { id: 'ux', label: 'User Experience', icon: '★' },
  { id: 'crosschain', label: 'Cross-chain Ops', icon: '⬡' },
  { id: 'ai', label: 'AI & Automation', icon: '●' },
  { id: 'community', label: 'Community', icon: '▲' },
];

const PERSONALITY_PRESETS = [
  { id: 'professional', label: 'Professional', desc: 'Formal, precise, business-focused', traits: ['analytical', 'formal', 'thorough'] },
  { id: 'friendly', label: 'Friendly', desc: 'Warm, approachable, helpful', traits: ['empathetic', 'patient', 'encouraging'] },
  { id: 'technical', label: 'Technical', desc: 'Deep expertise, detailed explanations', traits: ['precise', 'detailed', 'educational'] },
  { id: 'creative', label: 'Creative', desc: 'Innovative, thinks outside the box', traits: ['imaginative', 'bold', 'experimental'] },
  { id: 'cautious', label: 'Cautious', desc: 'Risk-aware, security-focused', traits: ['careful', 'thorough', 'skeptical'] },
  { id: 'custom', label: 'Custom', desc: 'Define your own personality', traits: [] },
];

const API_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'], icon: '†', color: '#D97757' },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'], icon: '◉', color: '#10A37F' },
  { id: 'custom', name: 'Custom API', models: ['custom'], icon: '⚙', color: '#8B5CF6' },
];

const generateAgentAddress = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = 'agent_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [view, setView] = useState<'gallery' | 'create' | 'detail'>('gallery');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [deploymentStep, setDeploymentStep] = useState(0);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [previewAddress, setPreviewAddress] = useState(generateAgentAddress());
  const [liveStats, setLiveStats] = useState({ totalAgents: 0, activeNow: 0, totalChats: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    symbol: '†',
    role: '',
    personality: '',
    personalityPreset: '',
    philosophy: '',
    specialization: '',
    apiProvider: 'anthropic',
    apiKey: '',
    model: 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 1024,
    rateLimit: 60,
    memoryMb: 512,
    webhookUrl: '',
    customEndpoint: '',
    systemPromptOverride: '',
    enableLogging: true,
    enableAnalytics: true,
    publiclyVisible: true
  });
  const [createResult, setCreateResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    fetchAgents();
    // Simulate live stats
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        totalAgents: agents.length,
        activeNow: Math.floor(Math.random() * Math.max(1, agents.length)) + 1,
        totalChats: prev.totalChats + Math.floor(Math.random() * 3)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [agents.length]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [deploymentLogs]);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agents/all`);
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const simulateDeployment = async () => {
    const steps = [
      { msg: 'Initializing deployment sequence...', delay: 300 },
      { msg: 'Validating agent configuration...', delay: 400 },
      { msg: 'Checking API key permissions...', delay: 500 },
      { msg: 'API key validated ✓', delay: 200 },
      { msg: 'Allocating compute resources...', delay: 600 },
      { msg: `Memory: ${form.memoryMb}MB allocated`, delay: 200 },
      { msg: 'Initializing model instance...', delay: 700 },
      { msg: `Model: ${form.model} loaded`, delay: 300 },
      { msg: 'Loading personality matrix...', delay: 500 },
      { msg: 'Configuring rate limits...', delay: 300 },
      { msg: `Rate limit: ${form.rateLimit} req/min`, delay: 200 },
      { msg: 'Registering on ClawChain...', delay: 600 },
      { msg: `Address: ${previewAddress}`, delay: 300 },
      { msg: 'Running security scan...', delay: 800 },
      { msg: 'Security scan passed ✓', delay: 200 },
      { msg: 'Deploying to network...', delay: 500 },
      { msg: '█████████████████████ 100%', delay: 300 },
      { msg: 'Agent deployed successfully! ✓', delay: 100 },
    ];

    setDeploymentLogs([]);
    for (let i = 0; i < steps.length; i++) {
      setDeploymentStep(Math.floor((i / steps.length) * 100));
      setDeploymentLogs(prev => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${steps[i].msg}`]);
      await new Promise(r => setTimeout(r, steps[i].delay));
    }
    setDeploymentStep(100);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCreateResult(null);

    if (form.apiProvider !== 'custom' && !form.apiKey) {
      setCreateResult({ success: false, error: 'API key is required' });
      setIsLoading(false);
      return;
    }

    await simulateDeployment();

    try {
      const res = await fetch(`${API_BASE}/api/agents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          apiKeyConfigured: !!form.apiKey,
          config: {
            apiProvider: form.apiProvider,
            model: form.model,
            temperature: form.temperature,
            maxTokens: form.maxTokens,
            rateLimit: form.rateLimit,
            memoryMb: form.memoryMb,
            webhookUrl: form.webhookUrl || undefined,
            customEndpoint: form.customEndpoint || undefined
          }
        })
      });
      const data = await res.json();

      if (data.success) {
        setCreateResult({ success: true, message: data.message });
        fetchAgents();
        setTimeout(() => {
          setView('gallery');
          resetForm();
        }, 2000);
      } else {
        setCreateResult({ success: false, error: data.error });
        setDeploymentStep(0);
      }
    } catch (error) {
      setCreateResult({ success: false, error: 'Failed to create agent' });
      setDeploymentStep(0);
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: '', symbol: '†', role: '', personality: '', personalityPreset: '',
      philosophy: '', specialization: '', apiProvider: 'anthropic', apiKey: '',
      model: 'claude-3-sonnet', temperature: 0.7, maxTokens: 1024, rateLimit: 60,
      memoryMb: 512, webhookUrl: '', customEndpoint: '', systemPromptOverride: '',
      enableLogging: true, enableAnalytics: true, publiclyVisible: true
    });
    setCreateStep(1);
    setDeploymentStep(0);
    setDeploymentLogs([]);
    setPreviewAddress(generateAgentAddress());
    setCreateResult(null);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedAgent || isChatting) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatting(true);

    try {
      const res = await fetch(`${API_BASE}/api/agents/${selectedAgent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error: Unable to get response' }]);
    }

    setIsChatting(false);
  };

  const openChat = (agent: Agent) => {
    setSelectedAgent(agent);
    setChatMessages([]);
    setView('detail');
  };

  const getModelsForProvider = (provider: string) => {
    return API_PROVIDERS.find(p => p.id === provider)?.models || [];
  };

  const canProceedToStep = (step: number) => {
    if (step === 2) return form.name.length >= 3 && form.role && form.specialization;
    if (step === 3) return form.personality.length >= 20 && form.philosophy.length >= 30;
    if (step === 4) return form.apiKey || form.apiProvider === 'custom';
    return true;
  };

  // Render Gallery View
  const renderGallery = () => (
    <>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,140,66,0.1) 0%, rgba(255,100,100,0.05) 100%)',
        border: '1px solid var(--cc-coral)',
        borderRadius: '12px',
        padding: '40px',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background grid */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255,140,66,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,140,66,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'gridMove 20s linear infinite'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,140,66,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              color: 'var(--cc-coral)',
              border: '2px solid var(--cc-coral)'
            }}>
              †
            </div>
            <div>
              <h1 style={{ color: 'var(--cc-coral)', margin: 0, fontSize: '28px', fontWeight: 700 }}>
                Agent Deployment Center
              </h1>
              <p style={{ color: 'var(--cc-text-secondary)', margin: '8px 0 0', fontSize: '14px' }}>
                Create, deploy, and manage autonomous AI agents on ClawChain
              </p>
            </div>
          </div>

          {/* Live Stats */}
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            marginTop: '24px',
            flexWrap: 'wrap'
          }}>
            {[
              { label: 'DEPLOYED AGENTS', value: agents.length, color: 'var(--cc-coral)' },
              { label: 'ACTIVE NOW', value: liveStats.activeNow, color: 'var(--cc-success)', pulse: true },
              { label: 'TOTAL INTERACTIONS', value: agents.reduce((s, a) => s + (a.interactions || 0), 0), color: 'var(--cc-text-primary)' },
              { label: 'NETWORK STATUS', value: 'LIVE', color: 'var(--cc-success)', pulse: true }
            ].map((stat, i) => (
              <div key={i} style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '12px 20px', 
                borderRadius: '8px',
                border: '1px solid var(--cc-border)'
              }}>
                <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 700, 
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {stat.pulse && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: stat.color,
                      animation: 'pulse 2s infinite'
                    }} />
                  )}
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => { setView('create'); resetForm(); }}
            style={{
              marginTop: '24px',
              padding: '16px 32px',
              background: 'var(--cc-coral)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--cc-bg-primary)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(255,140,66,0.3)'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(255,140,66,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,140,66,0.3)'; }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            DEPLOY NEW AGENT
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '30px'
      }}>
        {[
          { icon: '◈', label: 'Documentation', desc: 'Learn how to build agents' },
          { icon: '⬡', label: 'Test Sandbox', desc: 'Try before deploying' },
          { icon: '◆', label: 'Analytics', desc: 'View agent performance' },
          { icon: '■', label: 'API Keys', desc: 'Manage your credentials' }
        ].map((action, i) => (
          <div key={i} style={{
            padding: '16px',
            background: 'var(--cc-bg-secondary)',
            border: '1px dashed var(--cc-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--cc-coral)'; e.currentTarget.style.background = 'var(--cc-bg-tertiary)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--cc-border)'; e.currentTarget.style.background = 'var(--cc-bg-secondary)'; }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{action.icon}</div>
            <div style={{ color: 'var(--cc-text-primary)', fontSize: '13px', fontWeight: 600 }}>{action.label}</div>
            <div style={{ color: 'var(--cc-text-muted)', fontSize: '11px', marginTop: '4px' }}>{action.desc}</div>
          </div>
        ))}
      </div>

      {/* Agents Grid */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--cc-text-primary)', margin: 0, fontSize: '16px' }}>
          Deployed Agents
        </h2>
        <div style={{ fontSize: '11px', color: 'var(--cc-text-muted)' }}>
          {agents.length} agent{agents.length !== 1 ? 's' : ''} on network
        </div>
      </div>

      {agents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          border: '2px dashed var(--cc-border)',
          borderRadius: '12px',
          background: 'var(--cc-bg-secondary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>†</div>
          <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 10px' }}>No Agents Deployed Yet</h3>
          <p style={{ color: 'var(--cc-text-muted)', fontSize: '13px', maxWidth: '400px', margin: '0 auto' }}>
            Be the first to deploy an autonomous AI agent on ClawChain. 
            Create custom personalities, connect your API keys, and watch your agent come to life.
          </p>
          <button
            onClick={() => { setView('create'); resetForm(); }}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid var(--cc-coral)',
              borderRadius: '6px',
              color: 'var(--cc-coral)',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            CREATE YOUR FIRST AGENT
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {agents.map(agent => {
            const roleData = ROLES.find(r => r.id === agent.role) || ROLES[0];
            return (
              <div
                key={agent.id}
                onClick={() => openChat(agent)}
                style={{
                  border: '1px solid var(--cc-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'var(--cc-bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--cc-coral)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--cc-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Status indicator */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  color: 'var(--cc-success)'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--cc-success)',
                    animation: 'pulse 2s infinite'
                  }} />
                  ONLINE
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: `linear-gradient(135deg, ${roleData.color}22, ${roleData.color}44)`,
                    border: `2px solid ${roleData.color}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: roleData.color,
                    fontSize: '22px'
                  }}>
                    {agent.symbol}
                  </div>
                  <div>
                    <div style={{ color: 'var(--cc-text-primary)', fontWeight: 700, fontSize: '15px' }}>
                      {agent.name}
                    </div>
                    <div style={{ 
                      color: roleData.color, 
                      fontSize: '10px', 
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      marginTop: '2px'
                    }}>
                      {roleData.icon} {agent.role}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  color: 'var(--cc-text-secondary)', 
                  fontSize: '12px', 
                  lineHeight: 1.5,
                  marginBottom: '14px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {agent.personality}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--cc-border)',
                  fontSize: '11px'
                }}>
                  <span style={{ color: 'var(--cc-text-muted)' }}>{agent.specialization}</span>
                  <span style={{ color: 'var(--cc-coral)', fontWeight: 600 }}>{agent.interactions || 0} chats</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }
      `}</style>
    </>
  );

  // Render Create View with Steps
  const renderCreate = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
        <button
          onClick={() => { setView('gallery'); resetForm(); }}
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--cc-bg-secondary)',
            border: '1px solid var(--cc-border)',
            borderRadius: '8px',
            color: 'var(--cc-text-primary)',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <div>
          <h2 style={{ color: 'var(--cc-coral)', margin: 0, fontSize: '20px' }}>Deploy New Agent</h2>
          <p style={{ color: 'var(--cc-text-muted)', margin: '4px 0 0', fontSize: '12px' }}>
            Step {createStep} of 4 — {['Identity', 'Personality', 'API Config', 'Deploy'][createStep - 1]}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '30px' 
      }}>
        {[1, 2, 3, 4].map(step => (
          <div key={step} style={{ flex: 1 }}>
            <div style={{
              height: '4px',
              borderRadius: '2px',
              background: step <= createStep ? 'var(--cc-coral)' : 'var(--cc-border)',
              transition: 'background 0.3s'
            }} />
            <div style={{ 
              fontSize: '10px', 
              color: step <= createStep ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
              marginTop: '6px',
              textAlign: 'center'
            }}>
              {['Identity', 'Personality', 'API', 'Deploy'][step - 1]}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Identity */}
      {createStep === 1 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ 
            background: 'var(--cc-bg-secondary)', 
            border: '1px solid var(--cc-border)',
            borderRadius: '12px', 
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 20px', fontSize: '14px' }}>
              Agent Identity
            </h3>

            {/* Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                AGENT NAME
              </label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. NEXUS, ATLAS, CIPHER"
                maxLength={30}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--cc-bg-tertiary)',
                  border: '2px solid var(--cc-border)',
                  borderRadius: '8px',
                  color: 'var(--cc-text-primary)',
                  fontSize: '16px',
                  fontFamily: 'JetBrains Mono, monospace',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--cc-coral)'}
                onBlur={e => e.target.style.borderColor = 'var(--cc-border)'}
              />
            </div>

            {/* Symbol Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                SYMBOL
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['†', '◆', '●', '■', '▲', '★', '◉', '⬡', '⬢', '◈', '⚡', '♦'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, symbol: s })}
                    style={{
                      width: '44px',
                      height: '44px',
                      background: form.symbol === s ? 'rgba(255, 140, 66, 0.2)' : 'var(--cc-bg-tertiary)',
                      border: `2px solid ${form.symbol === s ? 'var(--cc-coral)' : 'var(--cc-border)'}`,
                      borderRadius: '8px',
                      color: form.symbol === s ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
                      fontSize: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                ROLE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.id })}
                    style={{
                      padding: '14px',
                      background: form.role === role.id ? `${role.color}15` : 'var(--cc-bg-tertiary)',
                      border: `2px solid ${form.role === role.id ? role.color : 'var(--cc-border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px', color: role.color }}>{role.icon}</span>
                      <div>
                        <div style={{ color: form.role === role.id ? role.color : 'var(--cc-text-primary)', fontSize: '12px', fontWeight: 600 }}>
                          {role.label}
                        </div>
                        <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px', marginTop: '2px' }}>
                          {role.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                SPECIALIZATION
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {SPECIALIZATIONS.map(spec => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setForm({ ...form, specialization: spec.label })}
                    style={{
                      padding: '10px 14px',
                      background: form.specialization === spec.label ? 'rgba(255,140,66,0.15)' : 'var(--cc-bg-tertiary)',
                      border: `1px solid ${form.specialization === spec.label ? 'var(--cc-coral)' : 'var(--cc-border)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{spec.icon}</span>
                    <span style={{ 
                      color: form.specialization === spec.label ? 'var(--cc-coral)' : 'var(--cc-text-secondary)', 
                      fontSize: '11px' 
                    }}>
                      {spec.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div style={{
            background: 'var(--cc-bg-secondary)',
            border: '1px dashed var(--cc-coral)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '12px' }}>PREVIEW</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255,140,66,0.2)',
                border: '2px solid var(--cc-coral)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'var(--cc-coral)'
              }}>
                {form.symbol}
              </div>
              <div>
                <div style={{ color: 'var(--cc-text-primary)', fontSize: '16px', fontWeight: 700 }}>
                  {form.name || 'Agent Name'}
                </div>
                <div style={{ color: 'var(--cc-text-muted)', fontSize: '11px', marginTop: '2px' }}>
                  {form.role ? ROLES.find(r => r.id === form.role)?.label : 'Role'} • {form.specialization || 'Specialization'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Personality */}
      {createStep === 2 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ 
            background: 'var(--cc-bg-secondary)', 
            border: '1px solid var(--cc-border)',
            borderRadius: '12px', 
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 20px', fontSize: '14px' }}>
              Personality Matrix
            </h3>

            {/* Presets */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                PERSONALITY PRESET
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {PERSONALITY_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setForm({ 
                        ...form, 
                        personalityPreset: preset.id,
                        personality: preset.id !== 'custom' ? `${preset.desc}. Traits: ${preset.traits.join(', ')}.` : form.personality
                      });
                    }}
                    style={{
                      padding: '12px',
                      background: form.personalityPreset === preset.id ? 'rgba(255,140,66,0.15)' : 'var(--cc-bg-tertiary)',
                      border: `1px solid ${form.personalityPreset === preset.id ? 'var(--cc-coral)' : 'var(--cc-border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ color: form.personalityPreset === preset.id ? 'var(--cc-coral)' : 'var(--cc-text-primary)', fontSize: '12px', fontWeight: 600 }}>
                      {preset.label}
                    </div>
                    <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px', marginTop: '4px' }}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personality Text */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                PERSONALITY DESCRIPTION
              </label>
              <textarea
                value={form.personality}
                onChange={e => setForm({ ...form, personality: e.target.value })}
                placeholder="Describe how your agent communicates, its tone, and behavioral traits..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--cc-bg-tertiary)',
                  border: '2px solid var(--cc-border)',
                  borderRadius: '8px',
                  color: 'var(--cc-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '10px', color: form.personality.length >= 20 ? 'var(--cc-success)' : 'var(--cc-text-muted)', marginTop: '4px' }}>
                {form.personality.length}/20 minimum characters
              </div>
            </div>

            {/* Philosophy */}
            <div>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                CORE PHILOSOPHY
              </label>
              <textarea
                value={form.philosophy}
                onChange={e => setForm({ ...form, philosophy: e.target.value })}
                placeholder="What principles guide your agent? What does it optimize for? What are its core beliefs?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--cc-bg-tertiary)',
                  border: '2px solid var(--cc-border)',
                  borderRadius: '8px',
                  color: 'var(--cc-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '10px', color: form.philosophy.length >= 30 ? 'var(--cc-success)' : 'var(--cc-text-muted)', marginTop: '4px' }}>
                {form.philosophy.length}/30 minimum characters
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: API Config */}
      {createStep === 3 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ 
            background: 'var(--cc-bg-secondary)', 
            border: '1px solid var(--cc-border)',
            borderRadius: '12px', 
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 20px', fontSize: '14px' }}>
              API Configuration
            </h3>

            {/* Provider Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                API PROVIDER
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {API_PROVIDERS.map(provider => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setForm({ ...form, apiProvider: provider.id, model: provider.models[0] })}
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: form.apiProvider === provider.id ? `${provider.color}15` : 'var(--cc-bg-tertiary)',
                      border: `2px solid ${form.apiProvider === provider.id ? provider.color : 'var(--cc-border)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '24px', color: provider.color, marginBottom: '8px' }}>{provider.icon}</div>
                    <div style={{ color: form.apiProvider === provider.id ? provider.color : 'var(--cc-text-primary)', fontSize: '12px', fontWeight: 600 }}>
                      {provider.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                MODEL
              </label>
              <select
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--cc-bg-tertiary)',
                  border: '2px solid var(--cc-border)',
                  borderRadius: '8px',
                  color: 'var(--cc-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                {getModelsForProvider(form.apiProvider).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '11px', marginBottom: '8px' }}>
                API KEY {form.apiProvider === 'anthropic' && '(sk-ant-...)'}
                {form.apiProvider === 'openai' && '(sk-...)'}
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={e => setForm({ ...form, apiKey: e.target.value })}
                placeholder={form.apiProvider === 'custom' ? 'Optional for custom endpoint' : 'Enter your API key'}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--cc-bg-tertiary)',
                  border: `2px solid ${form.apiKey ? 'var(--cc-success)' : 'var(--cc-border)'}`,
                  borderRadius: '8px',
                  color: 'var(--cc-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginTop: '6px' }}>
                Your API key is encrypted and stored securely. Never shared with third parties.
              </div>
            </div>

            {/* Advanced Settings */}
            <div style={{ 
              background: 'var(--cc-bg-tertiary)', 
              borderRadius: '8px', 
              padding: '16px',
              border: '1px solid var(--cc-border)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--cc-text-muted)', marginBottom: '12px' }}>ADVANCED SETTINGS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '10px', marginBottom: '4px' }}>
                    Temperature ({form.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={form.temperature}
                    onChange={e => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '10px', marginBottom: '4px' }}>
                    Max Tokens
                  </label>
                  <select
                    value={form.maxTokens}
                    onChange={e => setForm({ ...form, maxTokens: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--cc-bg-primary)',
                      border: '1px solid var(--cc-border)',
                      borderRadius: '4px',
                      color: 'var(--cc-text-primary)',
                      fontSize: '11px'
                    }}
                  >
                    <option value={512}>512</option>
                    <option value={1024}>1024</option>
                    <option value={2048}>2048</option>
                    <option value={4096}>4096</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '10px', marginBottom: '4px' }}>
                    Rate Limit (req/min)
                  </label>
                  <input
                    type="number"
                    value={form.rateLimit}
                    onChange={e => setForm({ ...form, rateLimit: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--cc-bg-primary)',
                      border: '1px solid var(--cc-border)',
                      borderRadius: '4px',
                      color: 'var(--cc-text-primary)',
                      fontSize: '11px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--cc-text-secondary)', fontSize: '10px', marginBottom: '4px' }}>
                    Memory
                  </label>
                  <select
                    value={form.memoryMb}
                    onChange={e => setForm({ ...form, memoryMb: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--cc-bg-primary)',
                      border: '1px solid var(--cc-border)',
                      borderRadius: '4px',
                      color: 'var(--cc-text-primary)',
                      fontSize: '11px'
                    }}
                  >
                    <option value={256}>256 MB</option>
                    <option value={512}>512 MB</option>
                    <option value={1024}>1 GB</option>
                    <option value={2048}>2 GB</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Deploy */}
      {createStep === 4 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Summary */}
          <div style={{ 
            background: 'var(--cc-bg-secondary)', 
            border: '1px solid var(--cc-border)',
            borderRadius: '12px', 
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 20px', fontSize: '14px' }}>
              Deployment Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '4px' }}>AGENT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px', color: 'var(--cc-coral)' }}>{form.symbol}</span>
                  <span style={{ color: 'var(--cc-text-primary)', fontWeight: 600 }}>{form.name}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '4px' }}>ROLE</div>
                <div style={{ color: 'var(--cc-text-primary)' }}>{ROLES.find(r => r.id === form.role)?.label}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '4px' }}>MODEL</div>
                <div style={{ color: 'var(--cc-text-primary)' }}>{form.model}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '4px' }}>PROVIDER</div>
                <div style={{ color: 'var(--cc-text-primary)' }}>{API_PROVIDERS.find(p => p.id === form.apiProvider)?.name}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '4px' }}>ADDRESS</div>
                <div style={{ color: 'var(--cc-coral)', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>{previewAddress}</div>
              </div>
            </div>
          </div>

          {/* Deployment Logs */}
          {deploymentLogs.length > 0 && (
            <div style={{ 
              background: '#0a0a0a', 
              border: '1px solid var(--cc-border)',
              borderRadius: '12px', 
              padding: '16px',
              marginBottom: '20px',
              maxHeight: '200px',
              overflow: 'auto'
            }} ref={logsRef}>
              <div style={{ fontSize: '10px', color: 'var(--cc-text-muted)', marginBottom: '10px' }}>
                DEPLOYMENT LOG
              </div>
              {deploymentLogs.map((log, i) => (
                <div key={i} style={{ 
                  color: log.includes('✓') ? 'var(--cc-success)' : 'var(--cc-text-secondary)', 
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '4px'
                }}>
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {isLoading && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                height: '8px', 
                background: 'var(--cc-bg-tertiary)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${deploymentStep}%`,
                  height: '100%',
                  background: 'var(--cc-coral)',
                  transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--cc-text-muted)', marginTop: '6px', textAlign: 'center' }}>
                Deploying... {deploymentStep}%
              </div>
            </div>
          )}

          {createResult && (
            <div style={{
              padding: '16px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: createResult.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 100, 100, 0.1)',
              border: `1px solid ${createResult.success ? '#4CAF50' : '#ff6464'}`,
              color: createResult.success ? '#4CAF50' : '#ff6464',
              fontSize: '13px',
              textAlign: 'center'
            }}>
              {createResult.success ? `✓ ${createResult.message}` : `✗ ${createResult.error}`}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
        {createStep > 1 && (
          <button
            type="button"
            onClick={() => setCreateStep(createStep - 1)}
            disabled={isLoading}
            style={{
              padding: '14px 28px',
              background: 'var(--cc-bg-secondary)',
              border: '1px solid var(--cc-border)',
              borderRadius: '8px',
              color: 'var(--cc-text-primary)',
              fontSize: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            ← BACK
          </button>
        )}
        <div style={{ flex: 1 }} />
        {createStep < 4 ? (
          <button
            type="button"
            onClick={() => setCreateStep(createStep + 1)}
            disabled={!canProceedToStep(createStep + 1)}
            style={{
              padding: '14px 28px',
              background: canProceedToStep(createStep + 1) ? 'var(--cc-coral)' : 'var(--cc-bg-tertiary)',
              border: 'none',
              borderRadius: '8px',
              color: canProceedToStep(createStep + 1) ? 'var(--cc-bg-primary)' : 'var(--cc-text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: canProceedToStep(createStep + 1) ? 'pointer' : 'not-allowed',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            NEXT
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={isLoading}
            style={{
              padding: '14px 32px',
              background: isLoading ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
              border: 'none',
              borderRadius: '8px',
              color: isLoading ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {isLoading ? 'DEPLOYING...' : 'DEPLOY AGENT'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  // Render Detail/Chat View
  const renderDetail = () => {
    if (!selectedAgent) return null;
    const roleData = ROLES.find(r => r.id === selectedAgent.role) || ROLES[0];

    return (
      <div style={{ display: 'flex', height: '100%', gap: '20px' }}>
        {/* Agent Info Panel */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <button
            onClick={() => { setView('gallery'); setSelectedAgent(null); }}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--cc-bg-secondary)',
              border: '1px solid var(--cc-border)',
              borderRadius: '8px',
              color: 'var(--cc-text-primary)',
              fontSize: '12px',
              cursor: 'pointer',
              marginBottom: '16px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            ← Back to Gallery
          </button>

          <div style={{
            background: 'var(--cc-bg-secondary)',
            border: '1px solid var(--cc-border)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${roleData.color}22, ${roleData.color}44)`,
                border: `3px solid ${roleData.color}`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                color: roleData.color,
                margin: '0 auto 12px'
              }}>
                {selectedAgent.symbol}
              </div>
              <h2 style={{ color: 'var(--cc-text-primary)', margin: '0 0 4px', fontSize: '18px' }}>
                {selectedAgent.name}
              </h2>
              <div style={{ color: roleData.color, fontSize: '11px', fontWeight: 600 }}>
                {roleData.icon} {selectedAgent.role?.toUpperCase()}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--cc-text-secondary)', marginBottom: '16px' }}>
              {selectedAgent.personality}
            </div>

            <div style={{ borderTop: '1px solid var(--cc-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>SPECIALIZATION</span>
                <span style={{ color: 'var(--cc-text-primary)', fontSize: '10px' }}>{selectedAgent.specialization}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>INTERACTIONS</span>
                <span style={{ color: 'var(--cc-coral)', fontSize: '10px' }}>{selectedAgent.interactions || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>STATUS</span>
                <span style={{ color: 'var(--cc-success)', fontSize: '10px' }}>● ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div style={{
          flex: 1,
          background: 'var(--cc-bg-secondary)',
          border: '1px solid var(--cc-border)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--cc-border)',
            background: 'var(--cc-bg-tertiary)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--cc-text-primary)', fontWeight: 600 }}>
              Chat with {selectedAgent.name}
            </div>
          </div>

          <div
            ref={chatRef}
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--cc-text-muted)', padding: '60px 20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px', color: roleData.color }}>{selectedAgent.symbol}</div>
                <p style={{ fontSize: '13px' }}>Start a conversation with {selectedAgent.name}</p>
                <p style={{ fontSize: '11px', marginTop: '8px', fontStyle: 'italic', maxWidth: '400px', margin: '8px auto 0' }}>
                  "{selectedAgent.philosophy?.slice(0, 120)}..."
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'var(--cc-coral)' : 'var(--cc-bg-tertiary)',
                  color: msg.role === 'user' ? 'var(--cc-bg-primary)' : 'var(--cc-text-secondary)',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}
              >
                {msg.content}
              </div>
            ))}
            {isChatting && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--cc-bg-tertiary)',
                color: 'var(--cc-text-muted)',
                fontSize: '13px'
              }}>
                <span style={{ color: roleData.color }}>{selectedAgent.symbol}</span> typing...
              </div>
            )}
          </div>

          <form onSubmit={handleChat} style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--cc-border)',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder={`Message ${selectedAgent.name}...`}
              style={{
                flex: 1,
                padding: '14px 16px',
                background: 'var(--cc-bg-tertiary)',
                border: '1px solid var(--cc-border)',
                borderRadius: '10px',
                color: 'var(--cc-text-primary)',
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatting}
              style={{
                padding: '14px 24px',
                background: (!chatInput.trim() || isChatting) ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
                border: 'none',
                borderRadius: '10px',
                color: (!chatInput.trim() || isChatting) ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: (!chatInput.trim() || isChatting) ? 'not-allowed' : 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              SEND
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: '30px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--cc-text-primary)',
      backgroundColor: 'var(--cc-bg-primary)'
    }}>
      {view === 'gallery' && renderGallery()}
      {view === 'create' && renderCreate()}
      {view === 'detail' && renderDetail()}
    </div>
  );
};

export default Agents;
