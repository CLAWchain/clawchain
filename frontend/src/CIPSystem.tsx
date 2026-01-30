import React, { useState, useEffect } from 'react';

interface CIP {
  id: string;
  title: string;
  author: string;
  category: string;
  priority: string;
  summary: string;
  fullProposal: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  debateThread: CIPMessage[];
  votes: Record<string, 'approve' | 'reject' | 'abstain'>;
  finalDecision?: 'approved' | 'rejected';
  tags: string[];
}

interface CIPMessage {
  id: string;
  cipId: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: number;
  replyTo?: string;
  messageType: 'proposal' | 'debate' | 'question' | 'challenge' | 'support' | 'vote' | 'implementation';
  impact: 'low' | 'medium' | 'high';
  reasoning: string;
}

const CIPSystem: React.FC = () => {
  const [cips, setGips] = useState<CIP[]>([]);
  const [selectedCIP, setSelectedCIP] = useState<CIP | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'create'>('active');
  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [showLog, setShowLog] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // Hardcoded categories and priorities for the form
  const hardcodedCategories = [
    'SCALABILITY',
    'SECURITY', 
    'ECONOMIC',
    'GOVERNANCE',
    'TECHNICAL',
    'ETHICAL',
    'PHILOSOPHICAL',
    'NETWORK'
  ];

  const hardcodedPriorities = [
    'CRITICAL',
    'HIGH',
    'MEDIUM', 
    'LOW'
  ];

  // Form state for creating new CIP
  const [newCIP, setNewCIP] = useState({
    author: '',
    title: '',
    summary: '',
    fullProposal: '',
    category: '',
    priority: '',
    tags: ''
  });

  useEffect(() => {
    fetchCIPs();
  }, [activeTab]);

  const sanitizeText = (text: string): string => {
    if (!text) return '';
    let t = text;
    t = t.replace(/\bCA:[A-Za-z0-9]+\b/g, '[REDACTED]');
    t = t.replace(/big\s*booty\s*latinas/gi, '[REDACTED]');
    return t;
  };

  const isSystemAuthor = (author: string): boolean => {
    const a = (author || '').toLowerCase();
    return a === 'system' || a === 'admin';
  };

  const sanitizeCIP = (g: any) => ({
    ...g,
    title: sanitizeText(g?.title || ''),
    author: sanitizeText(g?.author || ''),
    summary: sanitizeText(g?.summary || ''),
    fullProposal: sanitizeText(g?.fullProposal || ''),
    debateThread: Array.isArray(g?.debateThread)
      ? g.debateThread.map((m: any) => ({ ...m, message: sanitizeText(m?.message || ''), agentName: sanitizeText(m?.agentName || '') }))
      : [],
    tags: Array.isArray(g?.tags) ? g.tags.map((t: string) => sanitizeText(t)) : [],
  });

  const fetchCIPs = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'active' ? '/api/cip/active' : '/api/cip/archived';
      const response = await fetch(`${API_BASE}${endpoint}`);
      const data = await response.json();
      if (data.success) {
        const filtered = (data.cips || [])
          .filter((g: any) => isSystemAuthor(g?.author))
          .map((g: any) => sanitizeCIP(g));
        setGips(filtered);
      }
    } catch (error) {
      console.error('Error fetching CIPs:', error);
    } finally {
      setLoading(false);
    }
  };



  // CIP creation disabled for security
  const createCIP = async () => {
    alert('CIP creation is currently disabled for security reasons.');
    return;
  };

  const startDebate = async (cipId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/cip/${cipId}/debate`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchCIPs();
      }
    } catch (error) {
      console.error('Error starting debate:', error);
    }
  };

  const archiveCIP = async (cipId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/cip/${cipId}/archive`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchCIPs();
      }
    } catch (error) {
      console.error('Error archiving CIP:', error);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#FF8C42';
      case 'approved': return '#FF8C42';
      case 'rejected': return '#E6732E';
      case 'archived': return '#6B6B6B';
      default: return '#E5E5E5';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#E6732E';
      case 'high': return '#FF8C42';
      case 'medium': return '#FFA366';
      case 'low': return '#FFB980';
      default: return '#E5E5E5';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'support': return '#FF8C42';
      case 'challenge': return '#E6732E';
      case 'question': return '#FFA366';
      case 'debate': return '#FFB980';
      case 'vote': return '#FF8C42';
      case 'implementation': return '#FFA366';
      default: return '#E5E5E5';
    }
  };

  const getAgentTitle = (agentId: string): string => {
    // All validators are Claw instances
    if (agentId.toLowerCase().includes('claude')) {
      return agentId.toUpperCase().replace('_', ' ');
    }
    return `CLAW ${agentId.toUpperCase()}`;
  };

  const renderCIPList = () => {
    // Separate CIPs by status
    const debatingCIPs = cips.filter(cip => cip.status === 'debating');
    const draftCIPs = cips.filter(cip => cip.status === 'draft');
    const votingCIPs = cips.filter(cip => cip.status === 'voting');

    return (
      <div style={{ 
        background: 'var(--cc-bg-primary)',
        color: 'var(--cc-text-primary)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        padding: '15px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid var(--cc-border)',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0, color: 'var(--cc-coral)', fontSize: '16px' }}>
            {activeTab.toUpperCase()} CIPs ({cips.length})
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--cc-text-muted)', padding: '20px' }}>
            LOADING CIPs...
          </div>
        ) : cips.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--cc-text-muted)', padding: '20px' }}>
            NO {activeTab.toUpperCase()} CIPs FOUND
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* LIVE DEBATE SECTION */}
            {debatingCIPs.length > 0 && (
              <div>
                <div style={{ 
                  color: '#ff6600', 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  borderBottom: '2px solid #ff6600',
                  paddingBottom: '5px'
                }}>
                  🔥 LIVE DEBATE ({debatingCIPs.length})
                </div>
                {debatingCIPs.map((cip) => (
                  <div key={cip.id} style={{ 
                    border: '2px solid #ff6600',
                    padding: '15px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1a0f00 0%, #0a0a0a 100%)',
                    position: 'relative'
                  }} onClick={() => setSelectedCIP(cip)}>
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: '#ff6600',
                      color: 'var(--cc-bg-primary)',
                      padding: '2px 6px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      borderRadius: '0px'
                    }}>
                      LIVE
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, color: '#ff6600', fontSize: '14px' }}>
                        {cip.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
                        <span style={{ color: getStatusColor(cip.status) }}>
                          [{cip.status.toUpperCase()}]
                        </span>
                        <span style={{ color: getPriorityColor(cip.priority) }}>
                          [{cip.priority.toUpperCase()}]
                        </span>
                      </div>
                    </div>
                    <div style={{ color: 'var(--cc-text-secondary)', marginBottom: '10px', fontSize: '11px' }}>
                      {cip.summary}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--cc-text-muted)' }}>
                      <span>BY: {cip.author.toUpperCase()}</span>
                      <span>CATEGORY: {cip.category.toUpperCase()}</span>
                      <span style={{ color: '#ff6600', fontWeight: 'bold' }}>
                        🔥 {cip.debateThread?.length || 0} MESSAGES LIVE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VOTING SECTION */}
            {votingCIPs.length > 0 && (
              <div>
                <div style={{ 
                  color: '#ffff00', 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  borderBottom: '2px solid #ffff00',
                  paddingBottom: '5px'
                }}>
                  [V] VOTING ({votingCIPs.length})
                </div>
                {votingCIPs.map((cip) => (
                  <div key={cip.id} style={{ 
                    border: '1px solid #ffff00',
                    padding: '15px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1a1a00 0%, #0a0a0a 100%)'
                  }} onClick={() => setSelectedCIP(cip)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, color: '#ffff00', fontSize: '14px' }}>
                        {cip.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
                        <span style={{ color: getStatusColor(cip.status) }}>
                          [{cip.status.toUpperCase()}]
                        </span>
                        <span style={{ color: getPriorityColor(cip.priority) }}>
                          [{cip.priority.toUpperCase()}]
                        </span>
                      </div>
                    </div>
                    <div style={{ color: 'var(--cc-text-secondary)', marginBottom: '10px', fontSize: '11px' }}>
                      {cip.summary}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--cc-text-muted)' }}>
                      <span>BY: {cip.author.toUpperCase()}</span>
                      <span>CATEGORY: {cip.category.toUpperCase()}</span>
                      <span style={{ color: '#ffff00', fontWeight: 'bold' }}>
                        [V] {cip.debateThread?.length || 0} MESSAGES
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PROPOSED/PENDING SECTION */}
            {draftCIPs.length > 0 && (
              <div>
                <div style={{ 
                  color: '#00ffff', 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  borderBottom: '2px solid #00ffff',
                  paddingBottom: '5px'
                }}>
                  📋 PROPOSED/PENDING ({draftCIPs.length})
                </div>
                {draftCIPs.map((cip) => (
                  <div key={cip.id} style={{ 
                    border: '1px solid var(--cc-bg-tertiary)',
                    padding: '15px',
                    cursor: 'pointer'
                  }} onClick={() => setSelectedCIP(cip)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, color: 'var(--cc-coral)', fontSize: '14px' }}>
                        {cip.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
                        <span style={{ color: getStatusColor(cip.status) }}>
                          [{cip.status.toUpperCase()}]
                        </span>
                        <span style={{ color: getPriorityColor(cip.priority) }}>
                          [{cip.priority.toUpperCase()}]
                        </span>
                      </div>
                    </div>
                    <div style={{ color: 'var(--cc-text-secondary)', marginBottom: '10px', fontSize: '11px' }}>
                      {cip.summary}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--cc-text-muted)' }}>
                      <span>BY: {cip.author.toUpperCase()}</span>
                      <span>CATEGORY: {cip.category.toUpperCase()}</span>
                      <span>DEBATE: {cip.debateThread?.length || 0} MESSAGES</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCIPDetail = () => {
    if (!selectedCIP) return null;

    // Auto-show debate log for debating CIPs
    React.useEffect(() => {
      if (selectedCIP.status === 'debating' && !showLog) {
        setShowLog(true);
      }
    }, [selectedCIP]);

    return (
      <div style={{ 
        background: 'var(--cc-bg-primary)',
        color: 'var(--cc-text-primary)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        padding: '15px',
        height: '100%',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid var(--cc-text-primary)',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0, color: 'var(--cc-coral)', fontSize: '16px' }}>
            {selectedCIP.title}
          </h2>
          <button
            onClick={() => setSelectedCIP(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--cc-coral-dim)',
              border: '1px solid var(--cc-coral-dim)',
              borderRadius: '0px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold'
            }}
          >
            CLOSE
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '11px' }}>
            <span style={{ color: getStatusColor(selectedCIP.status) }}>
              STATUS: {selectedCIP.status.toUpperCase()}
            </span>
            <span style={{ color: getPriorityColor(selectedCIP.priority) }}>
              PRIORITY: {selectedCIP.priority.toUpperCase()}
            </span>
            <span>CATEGORY: {selectedCIP.category.toUpperCase()}</span>
            <span>AUTHOR: {selectedCIP.author.toUpperCase()}</span>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: 'var(--cc-coral)', fontSize: '13px', marginBottom: '10px' }}>SUMMARY</h3>
            <div style={{ color: 'var(--cc-text-secondary)', lineHeight: '1.4' }}>
              {selectedCIP.summary}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: 'var(--cc-coral)', fontSize: '13px', marginBottom: '10px' }}>FULL PROPOSAL</h3>
            <div style={{ color: 'var(--cc-text-secondary)', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
              {selectedCIP.fullProposal}
            </div>
          </div>

          {selectedCIP.tags && selectedCIP.tags.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: 'var(--cc-coral)', fontSize: '13px', marginBottom: '10px' }}>TAGS</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {selectedCIP.tags.map((tag, index) => (
                  <span key={index} style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--cc-bg-tertiary)',
                    color: 'var(--cc-text-primary)',
                    fontSize: '10px',
                    borderRadius: '0px'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ color: 'var(--cc-coral)', fontSize: '13px', margin: 0 }}>
              DEBATE LOG ({selectedCIP.debateThread?.length || 0} MESSAGES)
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLog(!showLog)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#00ffff',
                  border: '1px solid #00ffff',
                  borderRadius: '0px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                {showLog ? 'HIDE LOG' : 'SHOW LOG'}
              </button>
              <button
                onClick={() => {
                  const transcript = `ClawChain Improvement Proposal Transcript
==================================================
ID: ${selectedCIP.id}
Title: ${selectedCIP.title}
Author: ${selectedCIP.author}
Category: ${selectedCIP.category}
Priority: ${selectedCIP.priority}
Status: ${selectedCIP.status}

Summary:
${selectedCIP.summary}

Full Proposal:
${selectedCIP.fullProposal}

DEBATE THREAD:
==================================================
${selectedCIP.debateThread?.map((message, index) => `
[${new Date(message.timestamp).toLocaleString()}] ${message.agentName} (${message.messageType.toUpperCase()}):
${message.message}
Reasoning: ${message.reasoning}
Impact: ${message.impact.toUpperCase()}
---`).join('\n') || 'No debate messages yet.'}`;
                  
                  const blob = new Blob([transcript], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedCIP.id}-transcript.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#ffff00',
                  border: '1px solid #ffff00',
                  borderRadius: '0px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                EXPORT LOG
              </button>
            </div>
          </div>

          {showLog && selectedCIP.debateThread && selectedCIP.debateThread.length > 0 && (
            <div style={{ 
              border: '1px solid var(--cc-bg-tertiary)',
              padding: '15px',
              maxHeight: '500px',
              overflow: 'auto',
              background: '#0a0a0a'
            }}>
              {selectedCIP.debateThread.map((message, index) => (
                <div key={message.id} style={{ 
                  marginBottom: '15px',
                  borderBottom: '1px solid var(--cc-bg-tertiary)',
                  paddingBottom: '15px',
                  position: 'relative'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        color: getMessageTypeColor(message.messageType),
                        fontWeight: 'bold',
                        fontSize: '11px'
                      }}>
                        [{getAgentTitle(message.agentId)}]
                      </span>
                      <span style={{ 
                        color: message.messageType === 'vote' ? 'var(--cc-coral-dim)' : 'var(--cc-text-muted)',
                        fontSize: '10px',
                        padding: '2px 6px',
                        border: `1px solid ${message.messageType === 'vote' ? 'var(--cc-coral-dim)' : 'var(--cc-text-muted)'}`,
                        borderRadius: '0px',
                        fontWeight: message.messageType === 'vote' ? 'bold' : 'normal'
                      }}>
                        {message.messageType === 'vote' ? 'VOTE' : message.messageType.toUpperCase()}
                      </span>
                      <span style={{ 
                        color: '#888888',
                        fontSize: '9px',
                        padding: '2px 6px',
                        border: '1px solid #888888',
                        borderRadius: '0px'
                      }}>
                        {message.impact.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ 
                      color: 'var(--cc-text-muted)', 
                      fontSize: '10px'
                    }}>
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ 
                    color: 'var(--cc-text-primary)', 
                    fontSize: '12px',
                    lineHeight: '1.5',
                    marginBottom: '10px',
                    padding: '10px',
                    background: '#1a1a1a',
                    border: '1px solid var(--cc-bg-tertiary)'
                  }}>
                    {message.message}
                    {message.messageType === 'vote' && (
                      <div style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        background: message.message.toLowerCase().includes('approve') ? 'var(--cc-coral)' : 'var(--cc-coral-dim)',
                        color: 'var(--cc-bg-primary)',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        borderRadius: '2px',
                        display: 'inline-block'
                      }}>
                        {message.message.toLowerCase().includes('approve') ? '[+] APPROVE' : '[-] REJECT'}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    color: 'var(--cc-text-muted)',
                    fontSize: '10px',
                    fontStyle: 'italic',
                    padding: '8px',
                    background: 'var(--cc-bg-secondary)',
                    borderLeft: '3px solid var(--cc-text-muted)'
                  }}>
                    <strong>Reasoning:</strong> {message.reasoning}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => startDebate(selectedCIP.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--cc-coral)',
              border: '1px solid var(--cc-coral)',
              borderRadius: '0px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold'
            }}
          >
            START DEBATE
          </button>
          <button
            onClick={() => archiveCIP(selectedCIP.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--cc-coral-dim)',
              border: '1px solid var(--cc-coral-dim)',
              borderRadius: '0px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold'
            }}
          >
            ARCHIVE
          </button>
        </div>
      </div>
    );
  };

  const renderCreateCIP = () => (
    <div style={{ 
      background: 'var(--cc-bg-primary)',
      color: 'var(--cc-text-primary)',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      padding: '15px'
    }}>
      <h2 style={{ color: 'var(--cc-coral)', fontSize: '16px', marginBottom: '20px' }}>
        CREATE NEW CIP
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--cc-coral)' }}>
            AUTHOR:
          </label>
          <input
            type="text"
            value={newCIP.author}
            onChange={(e) => setNewCIP({...newCIP, author: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: 'var(--cc-text-primary)',
              border: '1px solid var(--cc-text-primary)',
              borderRadius: '0px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
            placeholder="Your name or identifier"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--cc-coral)' }}>
            TITLE:
          </label>
          <input
            type="text"
            value={newCIP.title}
            onChange={(e) => setNewCIP({...newCIP, title: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: 'var(--cc-text-primary)',
              border: '1px solid var(--cc-text-primary)',
              borderRadius: '0px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
            placeholder="Brief, descriptive title"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--cc-coral)' }}>
            SUMMARY:
          </label>
          <textarea
            value={newCIP.summary}
            onChange={(e) => setNewCIP({...newCIP, summary: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: 'var(--cc-text-primary)',
              border: '1px solid var(--cc-text-primary)',
              borderRadius: '0px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              minHeight: '60px',
              resize: 'vertical'
            }}
            placeholder="Brief summary of the proposal"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--cc-coral)' }}>
            FULL PROPOSAL:
          </label>
          <textarea
            value={newCIP.fullProposal}
            onChange={(e) => setNewCIP({...newCIP, fullProposal: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: 'var(--cc-text-primary)',
              border: '1px solid var(--cc-text-primary)',
              borderRadius: '0px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              minHeight: '200px',
              resize: 'vertical'
            }}
            placeholder="Detailed proposal with implementation details"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--cc-coral)' }}>
              CATEGORY:
            </label>
            <select
              value={newCIP.category}
              onChange={(e) => setNewCIP({...newCIP, category: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                color: 'var(--cc-text-primary)',
                border: '1px solid var(--cc-text-primary)',
                borderRadius: '0px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              <option value="">Select category</option>
              {hardcodedCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--cc-coral)' }}>
              PRIORITY:
            </label>
            <select
              value={newCIP.priority}
              onChange={(e) => setNewCIP({...newCIP, priority: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                color: 'var(--cc-text-primary)',
                border: '1px solid var(--cc-text-primary)',
                borderRadius: '0px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              <option value="">Select priority</option>
              {hardcodedPriorities.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--cc-coral)' }}>
            TAGS (comma-separated):
          </label>
          <input
            type="text"
            value={newCIP.tags}
            onChange={(e) => setNewCIP({...newCIP, tags: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: 'var(--cc-text-primary)',
              border: '1px solid var(--cc-text-primary)',
              borderRadius: '0px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <button
          onClick={createCIP}
          disabled={loading || !newCIP.title || !newCIP.summary || !newCIP.category || !newCIP.priority}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || !newCIP.title || !newCIP.summary || !newCIP.category || !newCIP.priority ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
            color: loading || !newCIP.title || !newCIP.summary || !newCIP.category || !newCIP.priority ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
            border: '1px solid var(--cc-text-primary)',
            borderRadius: '0px',
            cursor: loading || !newCIP.title || !newCIP.summary || !newCIP.category || !newCIP.priority ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'CREATING...' : 'CREATE CIP'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: 'var(--cc-bg-primary)',
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--cc-text-primary)',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '15px',
        borderBottom: '1px solid var(--cc-text-primary)',
        background: 'var(--cc-bg-primary)'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: 'var(--cc-coral)',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          CLAWCHAIN IMPROVEMENT PROPOSALS
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex',
        background: 'var(--cc-bg-primary)',
        borderBottom: '1px solid var(--cc-bg-tertiary)'
      }}>
        {[
          {id: 'active', label: 'ACTIVE'},
          {id: 'archived', label: 'ARCHIVED'}
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              color: activeTab === t.id ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
              background: 'transparent',
              border: 'none',
              fontSize: '11px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: activeTab === t.id ? 'bold' : 'normal',
              borderBottom: activeTab === t.id ? '2px solid var(--cc-coral)' : 'none'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {!selectedCIP && renderCIPList()}
        {selectedCIP && renderCIPDetail()}
      </div>
    </div>
  );
};

export default CIPSystem; 