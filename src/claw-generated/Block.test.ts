import { expect } from 'chai';
import { Block, Transaction, generateRandomBase58, generateHash, hexToBase58 } from './Block';

describe('Block', () => {
  describe('constructor', () => {
    it('should create a new block with the correct header', () => {
      const transactions: Transaction[] = [
        {
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: 0,
          signature: generateRandomBase58()
        }
      ];

      const block = new Block(1, generateRandomBase58(), generateRandomBase58(), transactions);

      expect(block.header.height).to.equal(1);
      expect(block.header.parentHash).to.be.a('string');
      expect(block.header.producer).to.be.a('string');
      expect(block.header.timestamp).to.be.a('number');
      expect(block.header.nonce).to.equal(0);
      expect(block.header.difficulty).to.equal(1);
      expect(block.header.gasUsed).to.be.a('bigint');
      expect(block.header.gasLimit).to.equal(30000000n);
      expect(block.header.stateRoot).to.be.a('string');
      expect(block.header.transactionsRoot).to.be.a('string');
      expect(block.header.receiptsRoot).to.be.a('string');
      expect(block.header.hash).to.be.a('string');
      expect(block.transactions).to.deep.equal(transactions);
    });
  });

  describe('calculateHash', () => {
    it('should calculate the correct block hash', () => {
      const transactions: Transaction[] = [
        {
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: 0,
          signature: generateRandomBase58()
        }
      ];

      const block = new Block(1, generateRandomBase58(), generateRandomBase58(), transactions);
      const expectedHash = block.calculateHash();
      expect(block.header.hash).to.equal(expectedHash);
    });
  });

  describe('isValid', () => {
    it('should return true for a valid block', () => {
      const transactions: Transaction[] = [
        {
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: 0,
          signature: generateRandomBase58()
        }
      ];

      const prevBlock = new Block(1, generateRandomBase58(), generateRandomBase58(), transactions);
      const block = new Block(2, prevBlock.header.hash, generateRandomBase58(), transactions);

      expect(block.isValid(prevBlock)).to.be.true;
    });

    it('should return false for an invalid block', () => {
      const transactions: Transaction[] = [
        {
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: 0,
          signature: generateRandomBase58()
        }
      ];

      const prevBlock = new Block(1, generateRandomBase58(), generateRandomBase58(), transactions);
      const block = new Block(1, generateRandomBase58(), generateRandomBase58(), transactions);

      expect(block.isValid(prevBlock)).to.be.false;
    });
  });

  describe('toJSON', () => {
    it('should serialize the block to JSON', () => {
      const transactions: Transaction[] = [
        {
          hash: generateRandomBase58(),
          from: generateRandomBase58(),
          to: generateRandomBase58(),
          value: BigInt(1000),
          gasPrice: BigInt(10),
          gasLimit: BigInt(21000),
          nonce: 0,
          signature: generateRandomBase58()
        }
      ];

      const block = new Block(1, generateRandomBase58(), generateRandomBase58(), transactions);
      const json = block.toJSON();

      expect(json).to.have.property('height', 1);
      expect(json).to.have.property('hash', block.header.hash);
      expect(json).to.have.property('parentHash', block.header.parentHash);
      expect(json).to.have.property('producer', block.header.producer);
      expect(json).to.have.property('timestamp', block.header.timestamp);
      expect(json).to.have.property('nonce', 0);
      expect(json).to.have.property('difficulty', 1);
      expect(json).to.have.property('gasUsed', block.header.gasUsed.toString());
      expect(json).to.have.property('gasLimit', block.header.gasLimit.toString());
      expect(json).to.have.property('stateRoot', block.header.stateRoot);
      expect(json).to.have.property('transactionsRoot', block.header.transactionsRoot);
      expect(json).to.have.property('receiptsRoot', block.header.receiptsRoot);
      expect(json.transactions).to.be.an('array');
      expect(json.transactions[0]).to.have.property('value', transactions[0].value.toString());
      expect(json.transactions[0]).to.have.property('gasPrice', transactions[0].gasPrice.toString());
      expect(json.transactions[0]).to.have.property('gasLimit', transactions[0].gasLimit.toString());
    });
  });

  describe('helper functions', () => {
    it('should generate a random base58 string', () => {
      const randomBase58 = generateRandomBase58();
      expect(randomBase58).to.be.a('string');
      expect(randomBase58.length).to.be.within(43, 45);
    });

    it('should convert hex to base58', () => {
      const hex = '123456789abcdef';
      const base58 = hexToBase58(hex);
      expect(base58).to.be.a('string');
      expect(base58).to.equal('2Uasdf8o9Asdf9');
    });

    it('should generate a hash', () => {
      const data = 'hello, world';
      const hash = generateHash(data);
      expect(hash).to.be.a('string');
      expect(hash.length).to.equal(44);
    });
  });
});