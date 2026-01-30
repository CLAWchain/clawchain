import React, { useState, useEffect } from 'react';

interface HealthCheck {
  name: string;
  status: 'ok' | 'warning' | 'error';
  details: string;
}

interface SystemHealth {
  status: string;
  timestamp: string;
  checks: HealthCheck[];
}

interface SystemStats {
  agent: {
    isWorking: boolean;
    currentTask: string | null;
    completedTasks: number;
    brainActive: boolean;
    uptime: number;
  };
  system: {
    platform: string;
    nodeVersion: string;
    memory: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    };
    cpu: {
      loadAvg1m: string;
      cores: number;
    };
  };
  api: {
    totalCalls: number;
    tokensIn: number;
    tokensOut: number;
    estimatedCost: string;
  };
}

interface ActivityEntry {
  timestamp: string;
  type: string;
  message: string;
}

interface GitStatus {
  branch: string;
  clean: boolean;
  changes: number;
  recentCommits: { shortHash: string; message: string; date: string }[];
}

const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [git, setGit] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  const fetchData = async () => {
    try {
      const [healthRes, statsRes, activityRes, gitRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/health`),
        fetch(`${API_BASE}/api/admin/stats`),
        fetch(`${API_BASE}/api/admin/activity?limit=20`),
        fetch(`${API_BASE}/api/admin/git`)
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivity(data.entries || []);
      }
      if (gitRes.ok) setGit(await gitRes.json());
      
      setError(null);
    } catch (e) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const runCIChecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/ci/run`, { method: 'POST' });
      if (res.ok) {
        alert('CI checks completed!');
        fetchData();
      }
    } catch (e) {
      alert('Failed to run CI checks');
    }
  };

  const resetStats = async () => {
    if (!confirm('Reset API usage stats?')) return;
    try {
      await fetch(`${API_BASE}/api/admin/reset-stats`, { method: 'POST' });
      fetchData();
    } catch (e) {
      alert('Failed to reset stats');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, color: 'var(--text)' }}>
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 24, 
      color: 'var(--text)',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: 24, 
        fontWeight: 600, 
        marginBottom: 24,
        color: 'var(--coral)'
      }}>
        Admin Dashboard
      </h1>

      {error && (
        <div style={{ 
          padding: 12, 
          background: 'rgba(248, 113, 113, 0.1)', 
          border: '1px solid #f87171',
          borderRadius: 8,
          marginBottom: 16
        }}>
          {error}
        </div>
      )}

      {/* Health Status */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* System Health Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16
        }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            SYSTEM HEALTH
          </h3>
          {health?.checks.map((check, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < health.checks.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <span>{check.name}</span>
              <span style={{ 
                color: check.status === 'ok' ? '#4ade80' : 
                       check.status === 'warning' ? '#fbbf24' : '#f87171',
                fontSize: 12
              }}>
                {check.status.toUpperCase()} - {check.details}
              </span>
            </div>
          ))}
        </div>

        {/* Agent Status Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16
        }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            AGENT STATUS
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status</span>
              <span style={{ 
                color: stats?.agent.isWorking ? '#4ade80' : 'var(--text-muted)'
              }}>
                {stats?.agent.isWorking ? 'WORKING' : 'IDLE'}
              </span>
            </div>
            {stats?.agent.currentTask && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Task</span>
                <span style={{ color: 'var(--coral)', fontSize: 12 }}>
                  {stats.agent.currentTask.substring(0, 30)}...
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Completed Tasks</span>
              <span style={{ color: 'var(--teal)' }}>{stats?.agent.completedTasks || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Brain</span>
              <span style={{ color: stats?.agent.brainActive ? '#4ade80' : 'var(--text-muted)' }}>
                {stats?.agent.brainActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Uptime</span>
              <span>{formatUptime(stats?.agent.uptime || 0)}</span>
            </div>
          </div>
        </div>

        {/* API Usage Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16
        }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            API USAGE
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Calls</span>
              <span>{stats?.api.totalCalls || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tokens In</span>
              <span>{(stats?.api.tokensIn || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tokens Out</span>
              <span>{(stats?.api.tokensOut || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Est. Cost</span>
              <span style={{ color: 'var(--coral)' }}>{stats?.api.estimatedCost || '$0.00'}</span>
            </div>
          </div>
          <button
            onClick={resetStats}
            style={{
              marginTop: 12,
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            Reset Stats
          </button>
        </div>

        {/* System Resources Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16
        }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            SYSTEM RESOURCES
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Memory (Heap)</span>
              <span>
                {stats?.system.memory.heapUsed}MB / {stats?.system.memory.heapTotal}MB
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Memory (RSS)</span>
              <span>{stats?.system.memory.rss}MB</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>CPU Load (1m)</span>
              <span>{stats?.system.cpu.loadAvg1m}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>CPU Cores</span>
              <span>{stats?.system.cpu.cores}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Platform</span>
              <span>{stats?.system.platform} / {stats?.system.nodeVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Git Status */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 12
        }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-muted)' }}>GIT STATUS</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ 
              padding: '4px 8px', 
              background: 'rgba(232, 90, 79, 0.1)',
              borderRadius: 4,
              fontSize: 12,
              color: 'var(--coral)'
            }}>
              {git?.branch || 'unknown'}
            </span>
            <span style={{ 
              padding: '4px 8px', 
              background: git?.clean ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
              borderRadius: 4,
              fontSize: 12,
              color: git?.clean ? '#4ade80' : '#fbbf24'
            }}>
              {git?.clean ? 'Clean' : `${git?.changes} changes`}
            </span>
          </div>
        </div>
        
        <div style={{ fontSize: 13 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Recent Commits:</div>
          {git?.recentCommits.slice(0, 5).map((commit, i) => (
            <div key={i} style={{ 
              padding: '6px 0',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              gap: 8
            }}>
              <span style={{ color: 'var(--coral)', fontFamily: 'monospace' }}>
                {commit.shortHash}
              </span>
              <span style={{ flex: 1 }}>{commit.message}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{commit.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
          ACTIONS
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={runCIChecks}
            style={{
              padding: '8px 16px',
              background: 'var(--coral)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Run CI Checks
          </button>
          <button
            onClick={fetchData}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text)',
              cursor: 'pointer'
            }}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16
      }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
          RECENT ACTIVITY
        </h3>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {activity.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: 16, textAlign: 'center' }}>
              No recent activity
            </div>
          ) : (
            activity.map((entry, i) => (
              <div key={i} style={{ 
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: 13
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 6px',
                    background: 'rgba(232, 90, 79, 0.1)',
                    borderRadius: 4,
                    fontSize: 10,
                    color: 'var(--coral)'
                  }}>
                    {entry.type}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ marginTop: 4 }}>{entry.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
