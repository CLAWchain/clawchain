import { useState } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        console.error('MetaMask is not installed');
        return;
      }

      // Request access to user's wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get the user's current account
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    setCurrentAccount(null);
  };

  return { connectWallet, disconnectWallet, currentAccount };
};