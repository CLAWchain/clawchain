import React, { useState, useEffect } from 'react';

interface PhantomWalletConnectProps {
  onWalletConnected: (address: string, provider: any) => void;
  onWalletDisconnected: () => void;
  connectedAddress?: string;
}

const PhantomWalletConnect: React.FC<PhantomWalletConnectProps> = ({
  onWalletConnected,
  onWalletDisconnected,
  connectedAddress
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [phantomProvider, setPhantomProvider] = useState<any>(null);

  useEffect(() => {
    checkPhantomConnection();
  }, []);

  const checkPhantomConnection = async () => {
    try {
      const provider = (window as any).solana;
      if (provider && provider.isPhantom) {
        setPhantomProvider(provider);
        
        // Check if already connected
        if (provider.isConnected) {
          const publicKey = provider.publicKey?.toString();
          if (publicKey) {
            onWalletConnected(publicKey, provider);
          }
        }
      }
    } catch (error) {
      console.error('Error checking Phantom connection:', error);
    }
  };

  const connectPhantom = async () => {
    setIsConnecting(true);
    setError('');

    try {
      if (!phantomProvider) {
        setError('No Phantom wallet detected. Please install Phantom.');
        return;
      }

      // Connect to Phantom
      const response = await phantomProvider.connect();
      const publicKey = response.publicKey.toString();
      
      onWalletConnected(publicKey, phantomProvider);
      
      // Listen for account changes
      phantomProvider.on('accountChanged', (publicKey: any) => {
        if (publicKey) {
          onWalletConnected(publicKey.toString(), phantomProvider);
        } else {
          onWalletDisconnected();
        }
      });

      // Listen for disconnect
      phantomProvider.on('disconnect', () => {
        onWalletDisconnected();
      });
    } catch (error: any) {
      if (error.code === 4001) {
        setError('User rejected the Phantom connection request.');
      } else {
        setError(`Failed to connect Phantom wallet: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onWalletDisconnected();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect-container">
      <h4 className="wallet-connect-header">
        👻 CONNECT PHANTOM TO CLAWCHAIN
      </h4>
      
      {error && (
        <div className="wallet-error">
          {error}
        </div>
      )}

      {connectedAddress ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="wallet-connected">
            <div className="wallet-status-indicator"></div>
            <span className="wallet-address">
              Connected to ClawChain via Phantom: {formatAddress(connectedAddress)}
            </span>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="wallet-disconnect-btn"
          >
            DISCONNECT PHANTOM
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p className="wallet-connect-info">
            Connect your Phantom wallet to interact with the ClawChain network
          </p>
          
          <button
            onClick={connectPhantom}
            disabled={isConnecting || !phantomProvider}
            className="wallet-connect-btn"
            style={{ 
              background: phantomProvider ? 'transparent' : '#333',
              color: phantomProvider ? '#00ff00' : '#666',
              borderColor: phantomProvider ? '#00ff00' : '#333'
            }}
          >
            {isConnecting ? 'CONNECTING TO PHANTOM...' : '👻 CONNECT PHANTOM'}
          </button>
          
          <div className="wallet-support-info">
            Phantom wallet for Solana-based ClawChain interaction
          </div>
        </div>
      )}
    </div>
  );
};

export default PhantomWalletConnect; 