import { Wallet } from './wallet';

const wallet = new Wallet();
console.log('Private Key:', wallet.privateKey);
console.log('Public Key:', wallet.publicKey);
console.log('Address:', wallet.address);