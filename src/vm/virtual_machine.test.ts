import { VirtualMachine } from './virtual_machine';
import { MerklePatriciaTrie } from '../state/trie';

describe('VirtualMachine', () => {
  it('should execute simple contract bytecode', () => {
    const trie = new MerklePatriciaTrie();
    const vm = new VirtualMachine(trie);

    const bytecode = new Uint8Array([
      0x01, 0x05, // PUSH 5
      0x01, 0x03, // PUSH 3
      0x02, // POP
      0x03, // LOAD
      0x07, // RETURN
    ]);

    const result = vm.execute(bytecode);
    expect(result).toEqual(3);
  });
});