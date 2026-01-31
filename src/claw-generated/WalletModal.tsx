import React, { useState } from 'react';
import { ethers } from 'ethers';

interface WalletModalProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if Web3 provider (e.g., MetaMask) is available
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccess', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setConnectedAddress(address);
        onConnect(address);
      } else {
        // No Web3 provider found, prompt user to install one
        alert('Please install a Web3 wallet like MetaMask to connect.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnectedAddress(null);
    onDisconnect();
  };

  return (
    <div className="wallet-modal">
      {connectedAddress ? (
        <div>
          <p>Connected wallet: {connectedAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletModal;