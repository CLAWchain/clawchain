import { Transaction, Crypto } from './Block';

self.onmessage = (event) => {
  const tx: Transaction = event.data;
  const isValid = Crypto.verifyTransaction(tx);
  self.postMessage(isValid);
};