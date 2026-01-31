import React, { useState, useEffect } from 'react';
import { WalletService, WalletProvider } from './wallet/index';
import WalletConnectionModal from './WalletConnectionModal';

const WalletConnectionFlow: React.FC = () => {
  const [connectedAccount, setConnectedAccount] = useState('');

  useEffect(() => {
    const walletService = new WalletService();
    const provider = walletService.getActiveProvider();
    if (provider) {
      handleWalletConnect(provider);
    }
  }, []);

  const handleWalletConnect = async (provider: WalletProvider) => {
    try {
      const { connectedAccount } = await walletService.connectWallet();
      setConnectedAccount(connectedAccount);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      const walletService = new WalletService();
      await walletService.disconnectWallet();
      setConnectedAccount('');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="wallet-connection-flow">
      {connectedAccount ? (
        <div className="connected-account">
          <p>Connected: {connectedAccount.slice(0, 6)}...</p>
          <button onClick={handleWalletDisconnect}>Disconnect</button>
        </div>
      ) : (
        <WalletConnectionModal onConnect={handleWalletConnect} />
      )}
    </div>
  );
};

export default WalletConnectionFlow;