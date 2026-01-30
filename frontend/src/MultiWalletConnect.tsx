import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { Connection, PublicKey } from '@solana/web3.js';

interface MultiWalletConnectProps {
  onWalletConnected: (address: string, provider: any, walletType: 'ethereum' | 'solana') => void;
  onWalletDisconnected: () => void;
  connectedAddress?: string;
  connectedWalletType?: 'ethereum' | 'solana';
}

const MultiWalletConnect: React.FC<MultiWalletConnectProps> = ({
  onWalletConnected,
  onWalletDisconnected,
  connectedAddress,
  connectedWalletType
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [ethereumProvider, setEthereumProvider] = useState<any>(null);
  const [phantomProvider, setPhantomProvider] = useState<any>(null);
  const [solanaConnection, setSolanaConnection] = useState<Connection | null>(null);

  useEffect(() => {
    checkWalletConnections();
  }, []);

  const checkWalletConnections = async () => {
    try {
      // Check for Ethereum provider (MetaMask)
      const ethProvider = await detectEthereumProvider();
      if (ethProvider) {
        setEthereumProvider(ethProvider);
        
        // Check if already connected
        const accounts = await (ethProvider as any).request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          onWalletConnected(accounts[0], ethProvider, 'ethereum');
        }
      }

      // Check for Solana provider (Phantom)
      const solProvider = (window as any).solana;
      if (solProvider && solProvider.isPhantom) {
        setPhantomProvider(solProvider);
        
        // Check if already connected
        if (solProvider.isConnected) {
          const publicKey = solProvider.publicKey?.toString();
          if (publicKey) {
            onWalletConnected(publicKey, solProvider, 'solana');
          }
        }
      }

      // Initialize Solana connection
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      setSolanaConnection(connection);
    } catch (error) {
      console.error('Error checking wallet connections:', error);
    }
  };

  const connectEthereumWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      if (!ethereumProvider) {
        setError('No Ethereum provider detected. Please install MetaMask.');
        return;
      }

      // Request account access
      const accounts = await (ethereumProvider as any).request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        onWalletConnected(address, ethereumProvider, 'ethereum');
        
        // Listen for account changes
        (ethereumProvider as any).on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            onWalletDisconnected();
          } else {
            onWalletConnected(accounts[0], ethereumProvider, 'ethereum');
          }
        });

        // Listen for chain changes
        (ethereumProvider as any).on('chainChanged', (chainId: string) => {
          window.location.reload();
        });
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError('User rejected the Ethereum connection request.');
      } else {
        setError(`Failed to connect Ethereum wallet: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const connectSolanaWallet = async () => {
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
      
      onWalletConnected(publicKey, phantomProvider, 'solana');
      
      // Listen for account changes
      phantomProvider.on('accountChanged', (publicKey: PublicKey | null) => {
        if (publicKey) {
          onWalletConnected(publicKey.toString(), phantomProvider, 'solana');
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
        setError('User rejected the Solana connection request.');
      } else {
        setError(`Failed to connect Solana wallet: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onWalletDisconnected();
  };

  const formatAddress = (address: string) => {
    if (connectedWalletType === 'solana') {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (type: 'ethereum' | 'solana') => {
    return type === 'ethereum' ? '🦊' : '👻';
  };

  const getWalletName = (type: 'ethereum' | 'solana') => {
    return type === 'ethereum' ? 'MetaMask' : 'Phantom';
  };

  return (
    <div className="wallet-connect-container">
      <h4 className="wallet-connect-header">
        🔗 CONNECT TO CLAWCHAIN
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
              Connected to ClawChain via {getWalletIcon(connectedWalletType!)} {getWalletName(connectedWalletType!)}: {formatAddress(connectedAddress)}
            </span>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="wallet-disconnect-btn"
          >
            DISCONNECT WALLET
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p className="wallet-connect-info">
            Connect your Web3 wallet to interact with the ClawChain network
          </p>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={connectEthereumWallet}
              disabled={isConnecting || !ethereumProvider}
              className="wallet-connect-btn"
              style={{ 
                background: ethereumProvider ? 'transparent' : '#333',
                color: ethereumProvider ? '#00ff00' : '#666',
                borderColor: ethereumProvider ? '#00ff00' : '#333'
              }}
            >
              🦊 CONNECT METAMASK
            </button>
            
            <button
              onClick={connectSolanaWallet}
              disabled={isConnecting || !phantomProvider}
              className="wallet-connect-btn"
              style={{ 
                background: phantomProvider ? 'transparent' : '#333',
                color: phantomProvider ? '#00ff00' : '#666',
                borderColor: phantomProvider ? '#00ff00' : '#333'
              }}
            >
              👻 CONNECT PHANTOM
            </button>
          </div>
          
          <div className="wallet-support-info">
            Supported: MetaMask (Ethereum) and Phantom (Solana) for ClawChain interaction
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiWalletConnect; 