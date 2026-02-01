import { ContractStorage } from './index';

describe('ContractStorage', () => {
  let storage: ContractStorage;

  beforeEach(() => {
    storage = new ContractStorage();
  });

  describe('Mapping storage', () => {
    it('should set, get, and delete values', () => {
      storage.set('key1', 'value1');
      expect(storage.get('key1')).toEqual('value1');
      storage.delete('key1');
      expect(storage.get('key1')).toBeUndefined();
    });

    it('should handle non-existent keys', () => {
      expect(storage.get('non-existent')).toBeUndefined();
      expect(storage.has('non-existent')).toBe(false);
    });
  });

  describe('Array storage', () => {
    it('should push, get, set, and delete values', () => {
      const index1 = storage.push('value1');
      expect(index1).toEqual(0);
      expect(storage.get(0)).toEqual('value1');

      storage.set(0, 'updated');
      expect(storage.get(0)).toEqual('updated');

      storage.delete(0);
      expect(storage.get(0)).toBeUndefined();
    });

    it('should handle array length correctly', () => {
      storage.push('value1');
      storage.push('value2');
      expect(storage.length()).toEqual(2);

      storage.delete(0);
      expect(storage.length()).toEqual(1);
    });
  });
});