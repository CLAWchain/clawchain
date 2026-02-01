import { ContractStorage } from './contract_storage';
import { ByteArray, Hash } from '../types';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  it('should store and retrieve values', () => {
    const key: Hash = 'key1';
    const value: ByteArray = 'value1';

    storage.set(key, value);
    expect(storage.get(key)).toEqual(value);
  });

  it('should delete values', () => {
    const key: Hash = 'key2';
    const value: ByteArray = 'value2';

    storage.set(key, value);
    expect(storage.get(key)).toEqual(value);

    storage.delete(key);
    expect(storage.get(key)).toBeUndefined();
  });

  it('should store and retrieve arrays', () => {
    const key: Hash = 'arrayKey';
    const values: ByteArray[] = ['value1', 'value2', 'value3'];

    storage.setArray(key, values);
    expect(storage.getArray(key)).toEqual(values);
  });

  it('should push and remove from arrays', () => {
    const key: Hash = 'arrayKey2';
    const initialValues: ByteArray[] = ['value1', 'value2'];

    storage.setArray(key, initialValues);
    expect(storage.getArray(key)).toEqual(initialValues);

    storage.pushToArray(key, 'value3');
    expect(storage.getArray(key)).toEqual(['value1', 'value2', 'value3']);

    storage.removeFromArray(key, 1);
    expect(storage.getArray(key)).toEqual(['value1', 'value3']);
  });
});