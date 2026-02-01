import { VM } from './vm';

describe('VM', () => {
  it('should execute basic arithmetic operations', () => {
    const vm = new VM();
    const program = [
      { opcode: 'PUSH', operand: 5 },
      { opcode: 'PUSH', operand: 3 },
      { opcode: 'ADD' },
      { opcode: 'PUSH', operand: 2 },
      { opcode: 'MUL' },
    ];
    const result = vm.execute(program);
    expect(result).toEqual(16);
  });
});