import React, { useState, useEffect } from 'react';
import { WalletService, WalletProvider } from './wallet/index';

const WalletConnectionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);

  useEffect(() => {
    const walletService = new WalletService();
    setWalletProvider(walletService.getActiveProvider());
  }, []);

  const handleConnect = async () => {
    try {
      const walletService = new WalletService();
      const { connectedAccount, availableAccounts } = await walletService.connectWallet();
      setConnectedAccount(connectedAccount);
      setAvailableAccounts(availableAccounts);
      setSelectedAccount(connectedAccount);
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
      setSelectedAccount(newAccount);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const walletService = new WalletService();
      await walletService.disconnectWallet();
      setConnectedAccount('');
      setAvailableAccounts([]);
      setSelectedAccount('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="wallet-connection-modal">
      <button onClick={() => setIsOpen(true)}>
        {connectedAccount ? `Connected: ${connectedAccount.slice(0, 6)}...` : 'Connect Wallet'}
      </button>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Connect Wallet</h2>
            {walletProvider && (
              <>
                <p>Connected with {walletProvider.name}</p>
                {availableAccounts.length > 0 && (
                  <>
                    <p>Available Accounts:</p>
                    <ul>
                      {availableAccounts.map((account) => (
                        <li
                          key={account}
                          className={account === selectedAccount ? 'selected' : ''}
                          onClick={() => setSelectedAccount(account)}
                        >
                          {account.slice(0, 6)}...{account.slice(-4)}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleAccountSwitch(selectedAccount)}>Switch Account</button>
                  </>
                )}
                <button onClick={handleDisconnect}>Disconnect</button>
              </>
            )}
            {!connectedAccount && <button onClick={handleConnect}>Connect</button>}
            <button onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectionModal;