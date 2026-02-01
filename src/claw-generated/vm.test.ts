import { VirtualMachine } from './vm';
import { Opcode } from './opcodes';

describe('VirtualMachine', () => {
  it('should execute basic operations', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([
      Opcode.PUSH, 5,
      Opcode.PUSH, 3,
      Opcode.ADD,
      Opcode.PUSH, 2,
      Opcode.SUB,
      Opcode.JUMP, 0
    ]);

    vm.execute(bytecode);

    expect(vm.stack).toEqual([6]);
  });
});