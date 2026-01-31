import { ContractStorage } from './storage';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  it('should set and get values', () => {
    storage.set('key1', 'value1');
    expect(storage.get('key1')).toEqual('value1');
  });

  it('should delete values', () => {
    storage.set('key2', 'value2');
    expect(storage.has('key2')).toBe(true);
    storage.delete('key2');
    expect(storage.has('key2')).toBe(false);
  });

  it('should handle arrays', () => {
    storage.setArray('myArray', [1, 2, 3]);
    expect(storage.getArray('myArray')).toEqual([1, 2, 3]);
  });

  it('should handle mappings', () => {
    storage.setMapping('myMapping', 'subkey1', 'value1');
    expect(storage.getMapping('myMapping', 'subkey1')).toEqual('value1');
  });
});