import React, { useState } from 'react';
import './WalletModal.scss';

interface WalletModalProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');

  const connectToMetaMask = async () => {
    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setConnectedAddress(address);
      onConnect(address);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setConnectedAddress('');
    onDisconnect();
  };

  return (
    <div className="wallet-modal">
      <h3>Connect Wallet</h3>
      {connectedAddress ? (
        <div className="connected-wallet">
          <p>Connected to: {connectedAddress}</p>
          <button className="disconnect-button" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button className="connect-button" onClick={connectToMetaMask} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect to MetaMask'}
        </button>
      )}
    </div>
  );
};

export default WalletModal;