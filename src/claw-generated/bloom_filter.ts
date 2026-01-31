class BloomFilter {
  private bitArray: boolean[];
  private hashFunctions: ((value: string) => number)[];

  constructor(size: number, errorRate: number) {
    this.bitArray = new Array(size).fill(false);
    this.hashFunctions = this.createHashFunctions(size, errorRate);
  }

  add(value: string): void {
    for (const hashFn of this.hashFunctions) {
      const index = hashFn(value);
      this.bitArray[index] = true;
    }
  }

  mayContain(value: string): boolean {
    for (const hashFn of this.hashFunctions) {
      const index = hashFn(value);
      if (!this.bitArray[index]) {
        return false;
      }
    }
    return true;
  }

  private createHashFunctions(size: number, errorRate: number): ((value: string) => number)[] {
    const k = Math.ceil(-(Math.log(errorRate) / Math.log(2)));
    const hashFunctions: ((value: string) => number)[] = [];

    for (let i = 0; i < k; i++) {
      const a = this.randomPrime(size);
      const b = this.randomPrime(size);
      hashFunctions.push((value) => {
        const hash = this.hashCode(value);
        return ((a * hash + b) % size) % size;
      });
    }

    return hashFunctions;
  }

  private hashCode(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private randomPrime(max: number): number {
    function isPrime(n: number): boolean {
      if (n <= 1) return false;
      if (n <= 3) return true;
      if (n % 2 === 0 || n % 3 === 0) return false;

      for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) {
          return false;
        }
      }

      return true;
    }

    let prime = 0;
    do {
      prime = Math.floor(Math.random() * max);
    } while (!isPrime(prime));
    return prime;
  }
}

export { BloomFilter };