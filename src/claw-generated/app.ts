import { Wallet } from './wallet';

const wallet = new Wallet();
console.log('Public Key:', wallet.getPublicKey());
console.log('Private Key:', wallet.getPrivateKey());
console.log('Address:', wallet.getAddress());