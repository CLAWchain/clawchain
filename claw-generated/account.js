class Account {
  constructor(address, balance) {
    this.address = address;
    this.balance = balance;
  }

  updateBalance(amount) {
    this.balance += amount;
  }
}

module.exports = { Account };