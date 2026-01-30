import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface AdminDashboard {
  totalCIPs: number;
  activeCIPs: number;
  archivedCIPs: number;
  userGeneratedCIPs: number;
  systemCIPs: number;
}

const AdminPanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const authenticate = async () => {
    setLoading(true);
    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
        setIsAuthenticated(true);
        setMessage('Authentication successful');
      } else {
        setMessage('Authentication failed');
      }
    } catch (error) {
      setMessage('Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCIP = async (cipId: string) => {
    if (!confirm(`Are you sure you want to delete CIP ${cipId}?`)) return;
    
    setLoading(true);
    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch(`${API_BASE}/api/admin/cip/${cipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        setMessage(`CIP ${cipId} deleted successfully`);
        // Refresh dashboard
        authenticate();
      } else {
        const error = await response.json();
        setMessage(`Failed to delete CIP: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error deleting CIP');
    } finally {
      setLoading(false);
    }
  };

  const clearUserContent = async () => {
    if (!confirm('Are you sure you want to clear ALL user-generated content? This cannot be undone.')) return;
    
    setLoading(true);
    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch(`${API_BASE}/api/admin/clear-user-content`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Cleared ${data.deletedCount} user-generated CIPs`);
        // Refresh dashboard
        authenticate();
      } else {
        const error = await response.json();
        setMessage(`Failed to clear user content: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error clearing user content');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        background: '#000000',
        color: '#ffffff',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        padding: '20px'
      }}>
        <h2 style={{ color: '#ff0000', fontSize: '16px', marginBottom: '20px' }}>
          🔐 ADMIN ACCESS
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#00ff00' }}>
              USERNAME:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: '0px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
              placeholder="admin"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#00ff00' }}>
              PASSWORD:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: '0px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
              placeholder="clawchain-admin-2024"
            />
          </div>
          
          <button
            onClick={authenticate}
            disabled={loading || !username || !password}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || !username || !password ? '#333333' : '#ff0000',
              color: loading || !username || !password ? '#666666' : '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: '0px',
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
          
          {message && (
            <div style={{ 
              color: message.includes('successful') ? '#00ff00' : '#ff0000',
              fontSize: '11px'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#000000',
      color: '#ffffff',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      padding: '20px'
    }}>
      <h2 style={{ color: '#ff0000', fontSize: '16px', marginBottom: '20px' }}>
        [!] ADMIN PANEL
      </h2>
      
      {dashboard && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00ff00', fontSize: '14px', marginBottom: '15px' }}>
            SYSTEM OVERVIEW
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#1a1a1a', padding: '15px', border: '1px solid #333' }}>
              <div style={{ color: '#00ff00', fontSize: '11px' }}>TOTAL CIPS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{dashboard.totalCIPs}</div>
            </div>
            
            <div style={{ background: '#1a1a1a', padding: '15px', border: '1px solid #333' }}>
              <div style={{ color: '#00ff00', fontSize: '11px' }}>ACTIVE CIPS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{dashboard.activeCIPs}</div>
            </div>
            
            <div style={{ background: '#1a1a1a', padding: '15px', border: '1px solid #333' }}>
              <div style={{ color: '#00ff00', fontSize: '11px' }}>ARCHIVED CIPS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{dashboard.archivedCIPs}</div>
            </div>
            
            <div style={{ background: '#1a1a1a', padding: '15px', border: '1px solid #333' }}>
              <div style={{ color: '#ff6666', fontSize: '11px' }}>USER GENERATED</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6666' }}>{dashboard.userGeneratedCIPs}</div>
            </div>
            
            <div style={{ background: '#1a1a1a', padding: '15px', border: '1px solid #333' }}>
              <div style={{ color: '#00ff00', fontSize: '11px' }}>SYSTEM CIPS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{dashboard.systemCIPs}</div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#ff0000', fontSize: '14px', marginBottom: '15px' }}>
          DANGEROUS ACTIONS
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={clearUserContent}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#333333' : '#ff0000',
              color: loading ? '#666666' : '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: '0px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'PROCESSING...' : 'CLEAR ALL USER CONTENT'}
          </button>
          
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#333333',
              color: '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: '0px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold'
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>
      
      {message && (
        <div style={{ 
          color: message.includes('successful') ? '#00ff00' : '#ff0000',
          fontSize: '11px',
          background: '#1a1a1a',
          padding: '10px',
          border: '1px solid #333'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '30px', fontSize: '10px', color: '#666666' }}>
        <p>[!] WARNING: These actions are irreversible and will permanently delete content.</p>
        <p>Use with extreme caution.</p>
      </div>
    </div>
  );
};

export default AdminPanel; 