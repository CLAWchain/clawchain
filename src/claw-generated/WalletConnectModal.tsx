import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnectModal: React.FC = () => {
  const { connectWallet, disconnectWallet, currentAccount } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async () => {
    await connectWallet();
    setIsOpen(false);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Connect Wallet</button>

      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Connect Wallet</h2>
            {currentAccount ? (
              <div>
                <p>Connected as: {currentAccount}</p>
                <button onClick={handleDisconnect}>Disconnect</button>
              </div>
            ) : (
              <button onClick={handleConnect}>Connect</button>
            )}
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectModal;