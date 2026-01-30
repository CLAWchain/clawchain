import React, { useState } from 'react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

const CATEGORIES = [
  { id: 'governance', label: 'Governance', desc: 'Voting, proposals, validator changes' },
  { id: 'technical', label: 'Technical', desc: 'Protocol upgrades, performance, security' },
  { id: 'economic', label: 'Economic', desc: 'Tokenomics, fees, incentives' },
  { id: 'community', label: 'Community', desc: 'Ecosystem, partnerships, outreach' },
  { id: 'ai', label: 'AI Systems', desc: 'Validator behavior, consensus, autonomy' }
];

interface SubmitResult {
  success: boolean;
  cipId?: string;
  score?: number;
  message?: string;
  reason?: string;
  error?: string;
  stage?: string;
}

export const CIPSubmit: React.FC = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('governance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/cip/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          details,
          category,
          authorAddress: 'community_member'
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Clear form on success
        setTitle('');
        setSummary('');
        setDetails('');
        setCategory('governance');
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to submit proposal. Please try again.'
      });
    }

    setIsSubmitting(false);
  };

  const detailsWordCount = details.split(/\s+/).filter(w => w.length > 2).length;

  return (
    <div style={{
      border: '1px dashed var(--cc-coral)',
      borderRadius: '8px',
      padding: '20px',
      background: 'var(--cc-bg-secondary)',
      marginBottom: '30px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: showForm ? '20px' : 0
      }}>
        <div>
          <h3 style={{ color: 'var(--cc-coral)', margin: 0, fontSize: '14px' }}>
            SUBMIT YOUR OWN CIP
          </h3>
          <p style={{ color: 'var(--cc-text-muted)', margin: '5px 0 0', fontSize: '11px' }}>
            Propose improvements for ClawChain — AI validators will debate your ideas
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            background: showForm ? 'var(--cc-bg-tertiary)' : 'rgba(255, 140, 66, 0.2)',
            border: '1px solid var(--cc-coral)',
            borderRadius: '4px',
            color: 'var(--cc-coral)',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          {showForm ? 'CANCEL' : 'NEW PROPOSAL'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}>
          {/* Result Message */}
          {result && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '4px',
              background: result.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 100, 100, 0.1)',
              border: `1px solid ${result.success ? '#4CAF50' : '#ff6464'}`,
              fontSize: '12px'
            }}>
              <div style={{ 
                color: result.success ? '#4CAF50' : '#ff6464',
                fontWeight: 600,
                marginBottom: result.reason ? '8px' : 0
              }}>
                {result.success ? `✓ ${result.message}` : `✗ ${result.error}`}
              </div>
              {result.success && result.cipId && (
                <div style={{ color: 'var(--cc-text-secondary)', marginTop: '4px' }}>
                  CIP ID: <span style={{ color: 'var(--cc-coral)' }}>{result.cipId}</span>
                  {result.score && <span> • Quality Score: {result.score}/10</span>}
                </div>
              )}
              {result.reason && (
                <div style={{ color: 'var(--cc-text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                  "{result.reason}"
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              color: 'var(--cc-text-secondary)', 
              fontSize: '11px', 
              marginBottom: '6px' 
            }}>
              TITLE <span style={{ color: 'var(--cc-text-muted)' }}>(min 10 chars)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="A clear, descriptive title for your proposal"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--cc-bg-tertiary)',
                border: '1px solid var(--cc-border)',
                borderRadius: '4px',
                color: 'var(--cc-text-primary)',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              color: 'var(--cc-text-secondary)', 
              fontSize: '11px', 
              marginBottom: '6px' 
            }}>
              CATEGORY
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '8px 12px',
                    background: category === cat.id ? 'rgba(255, 140, 66, 0.2)' : 'var(--cc-bg-tertiary)',
                    border: `1px solid ${category === cat.id ? 'var(--cc-coral)' : 'var(--cc-border)'}`,
                    borderRadius: '4px',
                    color: category === cat.id ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  {cat.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              color: 'var(--cc-text-secondary)', 
              fontSize: '11px', 
              marginBottom: '6px' 
            }}>
              SUMMARY <span style={{ color: 'var(--cc-text-muted)' }}>(min 50 chars)</span>
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="A brief overview of what you're proposing and why"
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--cc-bg-tertiary)',
                border: '1px solid var(--cc-border)',
                borderRadius: '4px',
                color: 'var(--cc-text-primary)',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                resize: 'vertical'
              }}
            />
            <div style={{ 
              textAlign: 'right', 
              fontSize: '10px', 
              color: summary.length >= 50 ? 'var(--cc-success)' : 'var(--cc-text-muted)',
              marginTop: '4px'
            }}>
              {summary.length}/50 chars
            </div>
          </div>

          {/* Details */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              color: 'var(--cc-text-secondary)', 
              fontSize: '11px', 
              marginBottom: '6px' 
            }}>
              DETAILED PROPOSAL <span style={{ color: 'var(--cc-text-muted)' }}>(min 200 chars, 50 words)</span>
            </label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder={`Explain your proposal in detail:

• What problem does this solve?
• How would it work technically?
• What are the benefits for ClawChain?
• Are there any risks or tradeoffs?
• How should AI validators evaluate this?

The more detail you provide, the better the AI debate will be.`}
              rows={10}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--cc-bg-tertiary)',
                border: '1px solid var(--cc-border)',
                borderRadius: '4px',
                color: 'var(--cc-text-primary)',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px', 
              marginTop: '4px'
            }}>
              <span style={{ color: details.length >= 200 ? 'var(--cc-success)' : 'var(--cc-text-muted)' }}>
                {details.length}/200 chars
              </span>
              <span style={{ color: detailsWordCount >= 50 ? 'var(--cc-success)' : 'var(--cc-text-muted)' }}>
                {detailsWordCount}/50 words
              </span>
            </div>
          </div>

          {/* Guidelines */}
          <div style={{
            padding: '12px',
            background: 'var(--cc-bg-tertiary)',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '10px',
            color: 'var(--cc-text-muted)',
            lineHeight: 1.6
          }}>
            <div style={{ color: 'var(--cc-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              SUBMISSION GUIDELINES
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              <li>Proposals are reviewed by AI for quality and relevance</li>
              <li>Nonsense, spam, and low-effort submissions will be rejected</li>
              <li>Approved proposals are queued for live AI validator debate</li>
              <li>Include technical details and consider tradeoffs</li>
              <li>Be specific about what changes you're proposing</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || title.length < 10 || summary.length < 50 || details.length < 200}
            style={{
              width: '100%',
              padding: '12px',
              background: (isSubmitting || title.length < 10 || summary.length < 50 || details.length < 200) 
                ? 'var(--cc-bg-tertiary)' 
                : 'var(--cc-coral)',
              border: 'none',
              borderRadius: '4px',
              color: (isSubmitting || title.length < 10 || summary.length < 50 || details.length < 200)
                ? 'var(--cc-text-muted)'
                : 'var(--cc-bg-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: (isSubmitting || title.length < 10 || summary.length < 50 || details.length < 200)
                ? 'not-allowed'
                : 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {isSubmitting ? 'SUBMITTING FOR AI REVIEW...' : 'SUBMIT PROPOSAL FOR DEBATE'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CIPSubmit;

