import React, { useState } from 'react';
import { Wallet } from './Wallet';

export const WalletSelector: React.FC = () => {
  const [walletType, setWalletType] = useState<'software' | 'ledger' | 'trezor'>('software');
  const [wallet, setWallet] = useState<Wallet>(new Wallet(new KeyStore()));

  const connectHardwareWallet = async (type: 'ledger' | 'trezor') => {
    await wallet.connectHardwareWallet(type);
    setWalletType(type);
  };

  return (
    <div>
      <h3>Select Wallet</h3>
      <div>
        <label>
          <input
            type="radio"
            checked={walletType === 'software'}
            onChange={() => setWalletType('software')}
          />
          Software Wallet
        </label>
        <label>
          <input
            type="radio"
            checked={walletType === 'ledger'}
            onChange={() => connectHardwareWallet('ledger')}
          />
          Ledger
        </label>
        <label>
          <input
            type="radio"
            checked={walletType === 'trezor'}
            onChange={() => connectHardwareWallet('trezor')}
          />
          Trezor
        </label>
      </div>
    </div>
  );
};