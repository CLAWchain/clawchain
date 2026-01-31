import React, { useState } from 'react';
import { ethers } from 'ethers';
import WalletModal from './WalletModal';

const WalletManager: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = (newProvider: ethers.providers.Web3Provider) => {
    setProvider(newProvider);
    setAccount(newProvider.getSigner().getAddress());
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    setProvider(null);
    setAccount(null);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="wallet-manager">
      {!provider && (
        <button onClick={handleModalOpen}>Connect Wallet</button>
      )}
      {provider && (
        <div>
          <p>Connected as: {account}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}
      {isModalOpen && (
        <WalletModal onConnect={handleConnect} onCancel={handleModalClose} />
      )}
    </div>
  );
};

export default WalletManager;