import { VM } from './index';
import { instructions } from './instructions';

describe('VM', () => {
  it('should execute basic arithmetic operations', () => {
    const vm = new VM();
    vm.execute([
      { opcode: 'PUSH', operand: 5 },
      { opcode: 'PUSH', operand: 3 },
      { opcode: 'ADD' },
      { opcode: 'PUSH', operand: 2 },
      { opcode: 'MUL' },
    ]);
    expect(vm.stack).toEqual([16]);
  });

  it('should throw an error for unknown opcodes', () => {
    const vm = new VM();
    expect(() => {
      vm.execute([{ opcode: 'UNKNOWN' }]);
    }).toThrowError('Unknown opcode: UNKNOWN');
  });
});