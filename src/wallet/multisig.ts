import { EncryptedKeypair, decryptKeypair } from './keypair';

export interface MultisigWallet {
  requiredSignatures: number;
  authorizedSigners: EncryptedKeypair[];
}

export async function createMultisigWallet(
  authorizedSigners: EncryptedKeypair[],
  requiredSignatures: number,
  password: string
): Promise<MultisigWallet> {
  return {
    requiredSignatures,
    authorizedSigners: authorizedSigners
  };
}

export async function verifyMultisigTransaction(
  wallet: MultisigWallet,
  password: string,
  signatures: nacl.Signature[]
): Promise<boolean> {
  const signerKeys = await Promise.all(wallet.authorizedSigners.map(async (signer) => {
    const keypair = await decryptKeypair(signer, password);
    return keypair.publicKey;
  }));

  // Verify that at least 'requiredSignatures' valid signatures are provided
  const validSignatures = signatures.filter((sig, i) => {
    return nacl.sign.detached.verify(
      /* message */ new Uint8Array(),
      sig,
      signerKeys[i]
    );
  });

  return validSignatures.length >= wallet.requiredSignatures;
}