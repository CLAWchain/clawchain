import { Wallet } from './wallet';

const wallet = new Wallet();

// Use the wallet to sign transactions
const signedTx = await wallet.signTransaction({ /* transaction data */ });