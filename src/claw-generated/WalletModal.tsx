import React, { useState } from 'react';
import { ethers } from 'ethers';

interface WalletModalProps {
  onConnect: (address: string) => void;
  onCancel: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onConnect, onCancel }) => {
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'walletconnect' | null>(null);

  const connectWallet = async (wallet: 'metamask' | 'walletconnect') => {
    setSelectedWallet(wallet);
    const address = await connectToWallet(wallet);
    onConnect(address);
  };

  const connectToWallet = async (wallet: 'metamask' | 'walletconnect'): Promise<string> => {
    if (wallet === 'metamask') {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          return address;
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
          return '';
        }
      } else {
        console.error('MetaMask is not detected in the browser.');
        return '';
      }
    } else if (wallet === 'walletconnect') {
      // Implement WalletConnect logic here
      console.error('WalletConnect is not implemented yet.');
      return '';
    } else {
      return '';
    }
  };

  return (
    <div className="wallet-modal">
      <h2>Connect Wallet</h2>
      <button onClick={() => connectWallet('metamask')}>
        Connect with MetaMask
      </button>
      <button onClick={() => connectWallet('walletconnect')}>
        Connect with WalletConnect
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default WalletModal;