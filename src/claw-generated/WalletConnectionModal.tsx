import React, { useState } from 'react';
import { WalletService } from './wallet/index';

const WalletConnectionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');

  const handleConnect = async () => {
    try {
      const walletService = new WalletService();
      const connectedAccount = await walletService.connectWallet();
      setConnectedAccount(connectedAccount);
      setIsOpen(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleAccountSwitch = async (newAccount: string) => {
    try {
      const walletService = new WalletService();
      await walletService.switchAccount(newAccount);
      setConnectedAccount(newAccount);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  return (
    <div className="wallet-connection-modal">
      <button onClick={() => setIsOpen(true)}>Connect Wallet</button>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Connect Wallet</h2>
            <p>Connected account: {connectedAccount}</p>
            <button onClick={handleConnect}>Connect</button>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectionModal;