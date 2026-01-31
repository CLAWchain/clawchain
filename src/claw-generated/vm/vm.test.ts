import { VirtualMachine } from './index';
import { Instruction } from './types';

describe('VirtualMachine', () => {
  let vm: VirtualMachine;

  beforeEach(() => {
    vm = new VirtualMachine();
  });

  it('should execute PUSH and POP instructions', () => {
    const instructions: Instruction[] = [
      { opcode: 'PUSH', operand: 42 },
      { opcode: 'POP' },
    ];

    vm.execute(instructions);
    expect(vm.stack).toEqual([]);
  });

  it('should execute ADD instruction', () => {
    const instructions: Instruction[] = [
      { opcode: 'PUSH', operand: 10 },
      { opcode: 'PUSH', operand: 20 },
      { opcode: 'ADD' },
    ];

    vm.execute(instructions);
    expect(vm.stack).toEqual([30]);
  });

  // Add more test cases for other instructions
});