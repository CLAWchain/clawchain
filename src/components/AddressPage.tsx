import React, { useState, useEffect } from 'react';
import { Account } from '../state/account';
import { TransactionSignature } from '../state/transactions_db';
import { getAccountInfo } from '../rpc/account';
import { getSignaturesForAddress } from '../rpc/transactions';

interface AddressPageProps {
  address: string;
}

const AddressPage: React.FC<AddressPageProps> = ({ address }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionSignature[]>([]);

  useEffect(() => {
    const fetchAddressData = async () => {
      const accountData = await fetchAccountData(address);
      setAccount(accountData);

      const transactionData = await fetchTransactionHistory(address);
      setTransactions(transactionData);
    };

    fetchAddressData();
  }, [address]);

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Address: {address}</h1>
      <div>Balance: {account.lamports} CLAW</div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((tx, index) => (
          <li key={index}>
            <div>Signature: {toHexString(tx.signature)}</div>
            <div>Slot: {tx.slot}</div>
            <div>Block Time: {new Date(tx.blockTime * 1000).toLocaleString()}</div>
          </li>
        ))}
      </ul>
      <h2>Token Holdings</h2>
      {/* TODO: Implement token holdings display */}
    </div>
  );
};

async function fetchAccountData(address: string): Promise<Account> {
  const accountData = await getAccountInfo(hexToUint8Array(address));
  return new Account(
    hexToUint8Array(address),
    accountData.lamports,
    accountData.owner,
    accountData.executable
  );
}

async function fetchTransactionHistory(address: string): Promise<TransactionSignature[]> {
  const transactionData = await getSignaturesForAddress({
    address: hexToUint8Array(address),
    limit: 20
  });
  return transactionData.map(({ signature, slot, blockTime }) => ({
    signature,
    slot,
    blockTime
  }));
}

function toHexString(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

export default AddressPage;