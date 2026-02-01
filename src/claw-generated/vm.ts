import { Instruction } from './instructions';
import { Contract } from './contracts/Contract';

export class VirtualMachine {
  private stack: any[] = [];
  private pc: number = 0;
  private contracts: { [address: string]: Contract } = {};

  constructor() {
    // Initialize the VM
  }

  execute(bytecode: Uint8Array) {
    this.pc = 0;
    while (this.pc < bytecode.length) {
      const instruction = Instruction.decode(bytecode, this.pc);
      this.executeInstruction(instruction);
      this.pc += instruction.size;
    }
  }

  executeInstruction(instruction: Instruction) {
    switch (instruction.opcode) {
      case 'PUSH':
        this.push(instruction.operand);
        break;
      case 'POP':
        this.pop();
        break;
      case 'ADD':
        this.add();
        break;
      case 'SUB':
        this.sub();
        break;
      case 'CALL':
        this.call();
        break;
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }

  push(value: any) {
    this.stack.push(value);
  }

  pop(): any {
    return this.stack.pop();
  }

  add() {
    const b = this.pop();
    const a = this.pop();
    this.push(a + b);
  }

  sub() {
    const b = this.pop();
    const a = this.pop();
    this.push(a - b);
  }

  call() {
    const gas = this.pop(); // Amount of gas to forward
    const address = this.pop(); // Target contract address
    const argsLength = this.pop(); // Number of arguments
    const args = [];
    for (let i = 0; i < argsLength; i++) {
      args.push(this.pop());
    }

    const contract = this.contracts[address];
    if (!contract) {
      throw new Error(`Contract at address ${address} not found`);
    }

    const result = contract.execute(gas, args);
    this.push(result);
  }

  registerContract(address: string, contract: Contract) {
    this.contracts[address] = contract;
  }
}