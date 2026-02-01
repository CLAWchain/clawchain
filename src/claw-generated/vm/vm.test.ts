import { VirtualMachine } from './index';
import { Opcode } from './types';

describe('VirtualMachine', () => {
  it('should execute simple arithmetic operations', () => {
    const vm = new VirtualMachine();
    const bytecode: Opcode[] = [
      Opcode.PUSH, 5,
      Opcode.PUSH, 3,
      Opcode.ADD,
      Opcode.PUSH, 2,
      Opcode.SUB,
    ];
    const result = vm.execute(bytecode);
    expect(result).toBe(6);
  });

  it('should throw on stack underflow', () => {
    const vm = new VirtualMachine();
    const bytecode: Opcode[] = [
      Opcode.POP,
    ];
    expect(() => vm.execute(bytecode)).toThrowError('Stack underflow');
  });

  // Add more test cases here
});