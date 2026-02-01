import { VirtualMachine } from './vm';
import { Instruction } from './instructions';

describe('VirtualMachine', () => {
  it('should execute PUSH and POP instructions', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([0x00, 0x42, 0x01]);
    vm.execute(bytecode);
    expect(vm.pop()).toEqual(42);
  });

  it('should execute ADD and SUB instructions', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([0x00, 0x10, 0x00, 0x05, 0x02, 0x03]);
    vm.execute(bytecode);
    expect(vm.pop()).toEqual(5);
    expect(vm.pop()).toEqual(15);
  });

  it('should throw for unknown opcodes', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([0x04]);
    expect(() => vm.execute(bytecode)).toThrowError('Unknown opcode: 4');
  });
});

describe('Instruction', () => {
  it('should decode PUSH instruction', () => {
    const instruction = Instruction.decode(new Uint8Array([0x00, 0x42]), 0);
    expect(instruction.opcode).toEqual('PUSH');
    expect(instruction.operand).toEqual(66);
    expect(instruction.size).toEqual(2);
  });

  it('should decode POP instruction', () => {
    const instruction = Instruction.decode(new Uint8Array([0x01]), 0);
    expect(instruction.opcode).toEqual('POP');
    expect(instruction.operand).toBeNull();
    expect(instruction.size).toEqual(1);
  });

  it('should throw for unknown opcodes', () => {
    expect(() => Instruction.decode(new Uint8Array([0x04]), 0)).toThrowError('Unknown opcode: 4');
  });
});