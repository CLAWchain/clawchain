import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const initWallet = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          setProvider(provider);
          setSigner(signer);
          setAccount(account);
        } else {
          console.error('No Ethereum provider detected');
        }
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    };
    initWallet();
  }, []);

  const connectWallet = async () => {
    try {
      await provider?.send('eth_requestAccounts', []);
      const account = await signer?.getAddress();
      setAccount(account || null);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  const switchAccount = async (index: number) => {
    try {
      await provider?.send('wallet_switchEthereumChain', [{ chainId: '0x1' }]);
      await provider?.send('eth_requestAccounts', []);
      const accounts = await provider?.listAccounts();
      const account = accounts?.[index];
      setAccount(account || null);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  return (
    <WalletContext.Provider value={{ provider, signer, account, connectWallet, switchAccount }}>
      {children}
    </WalletContext.Provider>
  );
};

export const WalletContext = React.createContext<{
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.providers.JsonRpcSigner | null;
  account: string | null;
  connectWallet: () => Promise<void>;
  switchAccount: (index: number) => Promise<void>;
}>({
  provider: null,
  signer: null,
  account: null,
  connectWallet: async () => {},
  switchAccount: async (index: number) => {},
});

export default WalletProvider;