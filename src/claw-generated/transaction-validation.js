import * as nacl from 'tweetnacl';

export function verifyTransactionSignature(transaction) {
  // Extract the sender's public key from the transaction
  const senderPublicKey = transaction.senderPublicKey;

  // Extract the signature from the transaction
  const signature = transaction.signature;

  // Verify the signature against the other transaction data
  const transactionData = getTransactionData(transaction);
  return nacl.sign.detached.verify(
    transactionData,
    signature,
    senderPublicKey
  );
}

function getTransactionData(transaction) {
  // Implement logic to generate the transaction data to be signed
  // This should include all the relevant fields, such as inputs, outputs, timestamp, etc.
  // Return the data as a Uint8Array
}