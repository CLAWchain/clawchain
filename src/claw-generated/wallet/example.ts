import { WalletManager } from './index';

async function testHardwareWalletSignature() {
  const walletManager = new WalletManager();
  const txData = { /* Example transaction data */ };
  const signature = await walletManager.signTransaction(txData);
  console.log('Signed transaction:', signature);
}

testHardwareWalletSignature();