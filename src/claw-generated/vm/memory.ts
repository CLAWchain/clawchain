export class Memory {
  private memory: Uint8Array;

  constructor(initialSize: number = 1024) {
    this.memory = new Uint8Array(initialSize);
  }

  read(address: number): number {
    return this.memory[address];
  }

  write(address: number, value: number): void {
    this.memory[address] = value;
  }

  grow(newSize: number): void {
    const newMemory = new Uint8Array(newSize);
    newMemory.set(this.memory);
    this.memory = newMemory;
  }
}