import { generateMasterKey, deriveChildKey, generateAddress } from './hdwallet';

export class HDWallet {
  private masterKey: Buffer;

  constructor(seed: Buffer) {
    this.masterKey = generateMasterKey(seed);
  }

  getAddress(account: number, change: number, index: number): string {
    const childKey = deriveChildKey(this.masterKey, account, change, index);
    return generateAddress(childKey);
  }
}

export function testHDWallet() {
  const seed = fromSeedSync('abandon amount expire adjust cage candy arch gather drum buyer enemy alien exceed');
  const wallet = new HDWallet(seed);

  console.log('Derived addresses:');
  console.log(wallet.getAddress(0, 0, 0));
  console.log(wallet.getAddress(0, 0, 1));
  console.log(wallet.getAddress(0, 1, 0));
}

testHDWallet();