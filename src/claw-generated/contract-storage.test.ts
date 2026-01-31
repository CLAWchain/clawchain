import { ContractStorage } from './contract-storage';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  it('should set and get simple values', () => {
    storage.set('key1', 'value1');
    expect(storage.get('key1')).toEqual('value1');
  });

  it('should set and get array values', () => {
    storage.setArray('myArray', [1, 2, 3]);
    expect(storage.getArray('myArray')).toEqual([1, 2, 3]);
  });

  it('should set and get mapping values', () => {
    const myMap = new Map([['key1', 'value1'], ['key2', 'value2']]);
    storage.setMapping('myMap', myMap);
    expect(storage.getMapping('myMap')).toEqual(myMap);
  });

  it('should delete values', () => {
    storage.set('key1', 'value1');
    storage.delete('key1');
    expect(storage.get('key1')).toBeUndefined();
  });
});