export class Stack {
  private data: number[];
  private gasUsed: number;

  constructor() {
    this.data = [];
    this.gasUsed = 0;
  }

  push(value: number): void {
    this.gasUsed += 1;
    this.data.push(value);
  }

  pop(): number {
    this.gasUsed += 1;
    return this.data.pop() as number;
  }

  getGasUsed(): number {
    return this.gasUsed;
  }
}