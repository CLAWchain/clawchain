export class Memory {
  private data: Uint8Array;
  private gasUsed: number;

  constructor() {
    this.data = new Uint8Array(1024 * 1024); // 1MB memory
    this.gasUsed = 0;
  }

  read(address: number, length: number): Uint8Array {
    this.gasUsed += length;
    return this.data.slice(address, address + length);
  }

  write(address: number, data: Uint8Array): void {
    this.gasUsed += data.length;
    this.data.set(data, address);
  }

  getGasUsed(): number {
    return this.gasUsed;
  }
}