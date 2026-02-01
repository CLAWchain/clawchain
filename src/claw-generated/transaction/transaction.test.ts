import { WalletKeypair } from '../wallet/keypair';
import { Transaction } from './transaction';

// Test transaction signing
const keypair = new WalletKeypair();
const tx = new Transaction(keypair.publicKey, new Uint8Array([1, 2, 3]), 100, 1);
tx.sign(keypair);

console.log('Transaction signed:', tx.signature.length > 0);