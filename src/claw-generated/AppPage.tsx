import React, { useState } from 'react';
import WalletModal from './WalletModal';

const AppPage: React.FC = () => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

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