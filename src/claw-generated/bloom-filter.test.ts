import { BloomFilter } from './bloom-filter';

describe('BloomFilter', () => {
  it('should add and check elements', () => {
    const bf = new BloomFilter();
    expect(bf.has('hello')).toBe(false);
    bf.add('hello');
    expect(bf.has('hello')).toBe(true);
    expect(bf.has('world')).toBe(false);
  });

  it('should handle multiple elements', () => {
    const bf = new BloomFilter();
    bf.add('hello');
    bf.add('world');
    bf.add('claw');
    expect(bf.has('hello')).toBe(true);
    expect(bf.has('world')).toBe(true);
    expect(bf.has('claw')).toBe(true);
    expect(bf.has('foo')).toBe(false);
  });

  it('should reset the bloom filter', () => {
    const bf = new BloomFilter();
    bf.add('hello');
    expect(bf.has('hello')).toBe(true);
    bf.reset();
    expect(bf.has('hello')).toBe(false);
  });
});