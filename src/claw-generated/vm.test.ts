import { VirtualMachine } from './vm';

describe('VirtualMachine', () => {
  let vm: VirtualMachine;

  beforeEach(() => {
    vm = new VirtualMachine();
  });

  test('should push and pop values from the stack', () => {
    vm.push(10);
    vm.push(20);
    expect(vm.pop()).toBe(20);
    expect(vm.pop()).toBe(10);
  });

  test('should perform arithmetic operations', () => {
    vm.push(10);
    vm.push(5);
    vm.add();
    expect(vm.pop()).toBe(15);

    vm.push(20);
    vm.push(3);
    vm.sub();
    expect(vm.pop()).toBe(17);

    vm.push(4);
    vm.push(6);
    vm.mul();
    expect(vm.pop()).toBe(24);

    vm.push(15);
    vm.push(3);
    vm.div();
    expect(vm.pop()).toBe(5);
  });

  test('should perform logical operations', () => {
    vm.push(0b1010);
    vm.push(0b1100);
    vm.and();
    expect(vm.pop()).toBe(0b1000);

    vm.push(0b1010);
    vm.push(0b1100);
    vm.or();
    expect(vm.pop()).toBe(0b1110);

    vm.push(0b1010);
    vm.not();
    expect(vm.pop()).toBe(0b0101);
  });

  test('should execute control flow instructions', () => {
    const bytecode = [0x20, 0x04, 0x01, 0x02, 0x03, 0x04];
    vm.run(bytecode);
    expect(vm.stack).toEqual([1, 2, 3, 4]);

    const conditionalBytecode = [0x01, 0x02, 0x21, 0x04, 0x01, 0x02];
    vm.run(conditionalBytecode);
    expect(vm.stack).toEqual([1, 2, 1, 2]);
  });

  test('should execute contract call and return', () => {
    const bytecode = [0x30, 0x08, 0x01, 0x02, 0x31, 0x03, 0x04];
    vm.run(bytecode);
    expect(vm.stack).toEqual([3, 4]);
  });
});