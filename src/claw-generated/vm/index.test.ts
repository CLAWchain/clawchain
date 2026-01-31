// src/claw-generated/vm/index.test.ts
import { VM } from './index';

describe('VM', () => {
  it('should execute basic bytecode', () => {
    const vm = new VM();
    const bytecode = [0x01, 10, 0x01, 20, 0x02, 0x01, 30, 0x03, 0x04, 0];
    vm.execute(bytecode);
    expect(vm.pop()).toBe(10);
  });
});