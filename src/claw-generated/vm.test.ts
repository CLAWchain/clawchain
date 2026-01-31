import { VirtualMachine } from './vm';

describe('VirtualMachine', () => {
  it('should execute basic operations', () => {
    const vm = new VirtualMachine();
    const bytecode = new Uint8Array([0x01, 0x42, 0x01, 0x24, 0x03]);
    vm.execute(bytecode);
    expect(vm.peekStack()).toEqual(66);
    expect(vm.getStackSize()).toEqual(1);
  });
});