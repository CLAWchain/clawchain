import { VirtualMachine } from './vm';
import { Instruction, OperandSize } from './types';

describe('VirtualMachine', () => {
  let vm: VirtualMachine;

  beforeEach(() => {
    vm = new VirtualMachine();
  });

  it('should execute basic arithmetic operations', () => {
    const instructions: Instruction[] = [
      { opcode: 'PUSH', operand: 5 },
      { opcode: 'PUSH', operand: 3 },
      { opcode: 'ADD' },
      { opcode: 'PUSH', operand: 2 },
      { opcode: 'SUB' },
    ];

    vm.execute(instructions);
    expect(vm.stack).toEqual([6]);
  });

  it('should execute jump and conditional jump instructions', () => {
    const instructions: Instruction[] = [
      { opcode: 'PUSH', operand: 1 },
      { opcode: 'PUSH', operand: 0 },
      { opcode: 'JUMPI', operand: 4 },
      { opcode: 'PUSH', operand: 100 },
      { opcode: 'JUMP', operand: 5 },
      { opcode: 'PUSH', operand: 200 },
    ];

    vm.execute(instructions);
    expect(vm.stack).toEqual([1, 200]);
  });
});