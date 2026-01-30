import React, { useState } from 'react';
import { ethers } from 'ethers';

interface WalletModalProps {
  onConnect: (address: string) => void;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onConnect, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectToMetaMask = async () => {
    setIsConnecting(true);
    try {
      // Request access to user's MetaMask wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      onConnect(address);
    } catch (err) {
      setError('Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-modal">
      <div className="modal-content">
        <h2>Connect Wallet</h2>
        {error && <div className="error">{error}</div>}
        <button onClick={connectToMetaMask} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect to MetaMask'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default WalletModal;