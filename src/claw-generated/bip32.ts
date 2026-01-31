import { createHmac, randomBytes } from 'crypto';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export class HDWallet {
  private masterKey: Buffer;

  constructor(seed: Buffer) {
    this.masterKey = this.generateMasterKey(seed);
  }

  private generateMasterKey(seed: Buffer): Buffer {
    const I = createHmac('sha512', 'Bitcoin seed')
      .update(seed)
      .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return IL;
  }

  public derivePath(path: string): Buffer {
    const pathComponents = path.split('/');
    if (pathComponents[0] !== 'm') {
      throw new Error('Invalid derivation path');
    }

    let key = this.masterKey;
    for (let i = 1; i < pathComponents.length; i++) {
      const component = pathComponents[i];
      if (component.endsWith("'")) {
        // Hardened derivation
        const childIndex = parseInt(component.slice(0, -1), 10) + 0x80000000;
        key = this.deriveChildKeyPriv(key, childIndex);
      } else {
        // Normal derivation
        const childIndex = parseInt(component, 10);
        key = this.deriveChildKeyPub(key, childIndex);
      }
    }

    return key;
  }

  private deriveChildKeyPriv(parentKey: Buffer, index: number): Buffer {
    const I = createHmac('sha512', parentKey)
      .update(Buffer.concat([Buffer.from([0x00]), parentKey, Buffer.from([index >>> 24, (index >>> 16) & 0xFF, (index >>> 8) & 0xFF, index & 0xFF])]))
      .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return IL;
  }

  private deriveChildKeyPub(parentKey: Buffer, index: number): Buffer {
    const I = createHmac('sha512', parentKey)
      .update(Buffer.concat([Buffer.from([0x02, 0x00, 0x00, 0x00]), parentKey, Buffer.from([index >>> 24, (index >>> 16) & 0xFF, (index >>> 8) & 0xFF, index & 0xFF])]))
      .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    const childKey = ec.keyFromPrivate(IL).getPublic(false, 'hex');
    return Buffer.from(childKey, 'hex');
  }
}