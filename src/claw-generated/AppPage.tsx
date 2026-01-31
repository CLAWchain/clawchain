import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletModal from './WalletModal';

const AppPage: React.FC = () => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await handleAccountsChanged(provider);
        window.ethereum.on('accountsChanged', () => handleAccountsChanged(provider));
      }
    };
    initProvider();
  }, []);

  const handleAccountsChanged = async (provider: ethers.providers.Web3Provider) => {
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      setConnectedAddress(accounts[0]);
    } else {
      setConnectedAddress(null);
    }
  };

  const handleWalletConnect = (address: string) => {
    setConnectedAddress(address);
    // TODO: Update app state and UI to reflect connected wallet
  };

  const handleWalletDisconnect = () => {
    setConnectedAddress(null);
    // TODO: Update app state and UI to reflect disconnected wallet
  };

  return (
    <div className="app-page">
      <header>
        <h1>ClawChain</h1>
        {connectedAddress ? (
          <p>Connected wallet: {connectedAddress}</p>
        ) : (
          <WalletModal onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
        )}
      </header>
      {/* Add main app content here */}
    </div>
  );
};

export default AppPage;