import ContractStorage from './index';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  it('should set, get, and delete a value', async () => {
    await storage.set('key', 'value');
    const value = await storage.get('key');
    expect(value).toEqual('value');
    await storage.delete('key');
    const deletedValue = await storage.get('key');
    expect(deletedValue).toBeUndefined();
  });

  it('should set, get, and delete a mapping', async () => {
    await storage.setMapping('users', '1', { name: 'Alice' });
    const user = await storage.getMapping('users', '1');
    expect(user).toEqual({ name: 'Alice' });
    await storage.deleteMapping('users', '1');
    const deletedUser = await storage.getMapping('users', '1');
    expect(deletedUser).toBeUndefined();
  });

  it('should set, get, and delete an array', async () => {
    await storage.setArray('numbers', [1, 2, 3]);
    const numbers = await storage.getArray('numbers');
    expect(numbers).toEqual([1, 2, 3]);
    await storage.deleteArray('numbers');
    const deletedNumbers = await storage.getArray('numbers');
    expect(deletedNumbers).toEqual([]);
  });
});