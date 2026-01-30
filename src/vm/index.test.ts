import { VirtualMachine } from './index';

describe('VirtualMachine', () => {
  let vm: VirtualMachine;

  beforeEach(() => {
    vm = new VirtualMachine();
  });

  it('should execute PUSH and POP correctly', () => {
    const bytecode = new Uint8Array([0x01, 0x42, 0x02]);
    vm.execute(bytecode);
    expect(vm.stack).toEqual([]);
  });

  it('should execute ADD correctly', () => {
    const bytecode = new Uint8Array([0x01, 0x2, 0x01, 0x3, 0x03]);
    vm.execute(bytecode);
    expect(vm.stack).toEqual([5]);
  });

  it('should execute MUL correctly', () => {
    const bytecode = new Uint8Array([0x01, 0x2, 0x01, 0x3, 0x04]);
    vm.execute(bytecode);
    expect(vm.stack).toEqual([6]);
  });

  it('should execute JMP correctly', () => {
    const bytecode = new Uint8Array([0x01, 0x2, 0x05, 0x01, 0x3, 0x01, 0x4]);
    vm.execute(bytecode);
    expect(vm.stack).toEqual([4]);
  });

  it('should execute JMPZ correctly', () => {
    const bytecode = new Uint8Array([0x01, 0x0, 0x06, 0x01, 0x3, 0x01, 0x4]);
    vm.execute(bytecode);
    expect(vm.stack).toEqual([4]);
  });
});