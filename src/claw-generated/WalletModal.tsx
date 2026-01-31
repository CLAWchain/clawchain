import React, { useState } from 'react';
import { ethers } from 'ethers';

interface WalletModalProps {
  onConnect: (provider: ethers.providers.Web3Provider) => void;
  onCancel: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onConnect, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  const connectToMetaMask = async () => {
    setIsLoading(true);
    try {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      onConnect(provider);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wallet-modal">
      <h2>Connect Wallet</h2>
      <button onClick={connectToMetaMask} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Connect to MetaMask'}
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default WalletModal;