export class BloomFilter {
    private filter: number[];
    private size: number = 2048;
    private hashCount: number = 3;

    constructor() {
        this.filter = new Array(this.size).fill(0);
    }

    add(item: string): void {
        const hashes = this.getHashes(item);
        for (const hash of hashes) {
            this.filter[hash % this.size] = 1;
        }
    }

    has(item: string): boolean {
        const hashes = this.getHashes(item);
        for (const hash of hashes) {
            if (this.filter[hash % this.size] === 0) {
                return false;
            }
        }
        return true;
    }

    private getHashes(item: string): number[] {
        const hashes = [];
        for (let i = 0; i < this.hashCount; i++) {
            hashes.push(this.hash(item, i));
        }
        return hashes;
    }

    private hash(item: string, seed: number): number {
        let h = 0;
        for (let i = 0; i < item.length; i++) {
            h = (h << 5) - h + item.charCodeAt(i);
            h |= 0; // Convert to 32bit integer
        }
        return h + seed;
    }
}