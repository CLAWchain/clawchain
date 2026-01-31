import { VirtualMachine } from './index';
import { Instruction } from './types';

describe('VirtualMachine', () => {
  it('should halt execution when gas limit is exceeded', () => {
    const instructions: Instruction[] = [
      { opcode: 'PUSH', operand: 10 },
      { opcode: 'PUSH', operand: 20 },
      { opcode: 'ADD' },
      { opcode: 'PUSH', operand: 30 },
      { opcode: 'MUL' },
    ];

    const vm = new VirtualMachine(100);
    expect(() => vm.execute(instructions)).not.toThrow();

    const vmWithLowGas = new VirtualMachine(15);
    expect(() => vmWithLowGas.execute(instructions)).toThrow('Out of gas');
  });
});