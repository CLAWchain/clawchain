import React, { useState, useContext } from 'react';
import { WalletContext } from './WalletProvider';

const WalletModal = () => {
  const { provider, signer, account, connectWallet, switchAccount } = useContext(WalletContext);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleAccountSwitch = async () => {
    await switchAccount(selectedAccountIndex);
  };

  return (
    <div className="wallet-modal">
      <h3>Connect Wallet</h3>
      {account ? (
        <div>
          <p>Connected account: {account}</p>
          <button onClick={handleAccountSwitch}>Switch Account</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletModal;