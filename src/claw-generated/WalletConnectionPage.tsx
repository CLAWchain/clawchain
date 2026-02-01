import React, { useState } from 'react';
import WalletModal from './WalletModal';

const WalletConnectionPage: React.FC = () => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const handleWalletConnect = (address: string) => {
    setConnectedAddress(address);
    // Perform any additional logic after wallet connection
  };

  const handleWalletCancel = () => {
    // Handle wallet connection cancel
  };

  return (
    <div>
      <h1>Connect Wallet</h1>
      {connectedAddress ? (
        <p>Connected to: {connectedAddress}</p>
      ) : (
        <WalletModal onConnect={handleWalletConnect} onCancel={handleWalletCancel} />
      )}
    </div>
  );
};

export default WalletConnectionPage;