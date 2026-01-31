import { VM } from './vm';
import { Instruction } from './types';

describe('VM', () => {
  it('should execute instructions within gas limit', () => {
    const instructions: Instruction[] = [
      { opcode: 'ADD', operands: [] },
      { opcode: 'MUL', operands: [] },
      { opcode: 'PUSH', operands: [] },
    ];
    const vm = new VM(instructions, 20);
    vm.execute();
    expect(vm.gasUsed).toBeLessThanOrEqual(20);
  });

  it('should throw error when gas limit is exceeded', () => {
    const instructions: Instruction[] = [
      { opcode: 'ADD', operands: [] },
      { opcode: 'MUL', operands: [] },
      { opcode: 'PUSH', operands: [] },
      { opcode: 'POP', operands: [] },
    ];
    const vm = new VM(instructions, 10);
    expect(() => vm.execute()).toThrowError('Insufficient gas');
  });
});