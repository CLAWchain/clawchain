import { VM } from './vm';
import { Opcode } from './opcodes';

describe('VM', () => {
  it('should execute basic arithmetic', () => {
    const vm = new VM();
    const bytecode = new Uint8Array([
      Opcode.PUSH, 5,
      Opcode.PUSH, 3,
      Opcode.ADD,
      Opcode.PUSH, 2,
      Opcode.MUL,
      Opcode.STOP
    ]);
    vm.execute(bytecode);
    expect(vm.ctx.stack).toEqual([16]);
  });

  it('should execute conditional jumps', () => {
    const vm = new VM();
    const bytecode = new Uint8Array([
      Opcode.PUSH, 0,
      Opcode.JUMPI, 6,
      Opcode.PUSH, 1,
      Opcode.PUSH, 2,
      Opcode.ADD,
      Opcode.STOP,
      Opcode.PUSH, 3,
      Opcode.PUSH, 4,
      Opcode.ADD,
      Opcode.STOP
    ]);
    vm.execute(bytecode);
    expect(vm.ctx.stack).toEqual([7]);
  });
});