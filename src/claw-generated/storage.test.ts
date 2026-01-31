// src/claw-generated/storage.test.ts
import { ContractStorage } from './storage';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  it('should set, get, and delete mapping values', () => {
    const contractId = 'contract-1';
    storage.set(contractId, 'key1', 'value1');
    storage.set(contractId, 'key2', 'value2');

    expect(storage.get(contractId, 'key1')).toEqual('value1');
    expect(storage.get(contractId, 'key2')).toEqual('value2');

    storage.delete(contractId, 'key1');
    expect(storage.get(contractId, 'key1')).toBeUndefined();
    expect(storage.get(contractId, 'key2')).toEqual('value2');
  });

  it('should push and get array values', () => {
    const contractId = 'contract-2';
    storage.push(contractId, 'myArray', 1);
    storage.push(contractId, 'myArray', 2);
    storage.push(contractId, 'myArray', 3);

    const array = storage.getArray(contractId, 'myArray');
    expect(array).toEqual([1, 2, 3]);
  });
});