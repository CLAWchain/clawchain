export class Stack {
  private stack: number[] = [];

  push(value: number): void {
    this.stack.push(value);
  }

  pop(): number {
    return this.stack.pop()!;
  }

  peek(): number {
    return this.stack[this.stack.length - 1];
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}