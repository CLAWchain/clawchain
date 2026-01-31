export class Signature {
  private signatureData: Buffer;

  constructor(signatureData: Buffer) {
    this.signatureData = signatureData;
  }

  /**
   * Get the signature data as a Buffer.
   * @returns The signature data
   */
  get data(): Buffer {
    return this.signatureData;
  }
}