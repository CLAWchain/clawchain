import { randomBytes } from 'crypto';

class VRFGenerator {
  private seed: Uint8Array;

  constructor() {
    this.seed = randomBytes(32);
  }

  generateOrderIndex(): number {
    const randomBytes = this.generateRandomBytes(8);
    return this.convertBytesToNumber(randomBytes);
  }

  private generateRandomBytes(length: number): Uint8Array {
    const randomBytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      randomBytes[i] ^= this.seed[i % this.seed.length];
    }
    return randomBytes;
  }

  private convertBytesToNumber(bytes: Uint8Array): number {
    let value = 0;
    for (const byte of bytes) {
      value = (value << 8) + byte;
    }
    return value;
  }
}

export { VRFGenerator };