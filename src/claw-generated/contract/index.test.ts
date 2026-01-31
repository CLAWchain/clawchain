import { ContractStorage } from './index';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  it('should set, get, and delete key-value pairs', () => {
    storage.set('foo', 'bar');
    expect(storage.get('foo')).toEqual('bar');
    storage.delete('foo');
    expect(storage.has('foo')).toEqual(false);
  });

  it('should handle array storage', () => {
    storage.setArray('numbers', [1, 2, 3]);
    expect(storage.getArray('numbers')).toEqual([1, 2, 3]);
    storage.pushToArray('numbers', 4);
    expect(storage.getArray('numbers')).toEqual([1, 2, 3, 4]);
    storage.removeFromArray('numbers', 2);
    expect(storage.getArray('numbers')).toEqual([1, 3, 4]);
  });
});