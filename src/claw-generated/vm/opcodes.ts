// src/claw-generated/vm/opcodes.ts
import { VirtualMachine } from './index';

export enum Opcode {
  PUSH = 0x01,
  POP = 0x02,
  ADD = 0x03,
  SUB = 0x04,
  MUL = 0x05,
  DIV = 0x06,
  JUMP = 0x07,
  JUMPI = 0x08,
  STOP = 0x00
}

export const opcodeImplementations: Record<Opcode, (vm: VirtualMachine) => void> = {
  [Opcode.PUSH]: (vm) => {
    const value = vm.contract.bytecode[++vm.programCounter];
    vm.push(value);
  },
  [Opcode.POP]: (vm) => {
    vm.pop();
  },
  [Opcode.ADD]: (vm) => {
    const b = vm.pop();
    const a = vm.pop();
    vm.push(a + b);
  },
  [Opcode.SUB]: (vm) => {
    const b = vm.pop();
    const a = vm.pop();
    vm.push(a - b);
  },
  [Opcode.MUL]: (vm) => {
    const b = vm.pop();
    const a = vm.pop();
    vm.push(a * b);
  },
  [Opcode.DIV]: (vm) => {
    const b = vm.pop();
    const a = vm.pop();
    vm.push(a / b);
  },
  [Opcode.JUMP]: (vm) => {
    const newPC = vm.pop();
    vm.programCounter = newPC;
  },
  [Opcode.JUMPI]: (vm) => {
    const condition = vm.pop();
    const newPC = vm.pop();
    if (condition) {
      vm.programCounter = newPC;
    }
  },
  [Opcode.STOP]: (vm) => {
    // Stop the execution of the contract
  }
}