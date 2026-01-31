class Block {
  constructor(transactions, previousHash, timestamp) {
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
  }

  calculateHash() {
    // TODO: Implement hash calculation
    return '0x1234567890';
  }
}

module.exports = { Block };