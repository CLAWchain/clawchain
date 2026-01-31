import { ContractStorage } from './storage';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  it('should set and get simple values', () => {
    storage.set('name', 'Alice');
    expect(storage.get('name')).toEqual('Alice');
  });

  it('should create and access mappings', () => {
    const userMap = storage.getMapping('users');
    userMap.set('alice', { name: 'Alice', age: 30 });
    userMap.set('bob', { name: 'Bob', age: 35 });

    expect(userMap.get('alice')).toEqual({ name: 'Alice', age: 30 });
    expect(userMap.get('bob')).toEqual({ name: 'Bob', age: 35 });
  });

  it('should create and access arrays', () => {
    const numbers = storage.getArray('numbers');
    numbers.push(1, 2, 3);

    expect(numbers).toEqual([1, 2, 3]);
  });
});