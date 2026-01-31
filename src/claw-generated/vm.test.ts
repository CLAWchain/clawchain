import { VirtualMachine } from './vm';

describe('VirtualMachine', () => {
  it('should execute PUSH, ADD, and MUL opcodes correctly', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([0x01, 5, 0x01, 3, 0x02, 0x03]);
    vm.execute(bytecode);
    expect(vm.stack).toEqual([8]);
  });

  it('should execute JUMP opcode correctly', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([0x01, 5, 0x04, 2, 0x01, 10, 0x01, 20]);
    vm.execute(bytecode);
    expect(vm.stack).toEqual([10, 20]);
  });

  it('should throw an error for unknown opcodes', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([0x05]);
    expect(() => vm.execute(bytecode)).toThrowError('Unknown opcode: 5');
  });
});