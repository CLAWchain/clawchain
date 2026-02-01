export class Account {
  balance: number;
  transactionHistory: Transaction[];
  pendingTransactions: Transaction[];

  constructor() {
    this.balance = 0;
    this.transactionHistory = [];
    this.pendingTransactions = [];
  }

  addTransaction(tx: Transaction, isPending: boolean) {
    if (isPending) {
      this.pendingTransactions.push(tx);
    } else {
      this.transactionHistory.push(tx);
      this.updateBalance(tx);
    }
  }

  updateBalance(tx: Transaction) {
    if (tx.recipient === this.address) {
      this.balance += tx.amount;
    } else if (tx.sender === this.address) {
      this.balance -= tx.amount;
    }
  }
}

export class Transaction {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed';

  constructor(sender: string, recipient: string, amount: number) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = Date.now();
    this.status = 'pending';
  }

  confirm() {
    this.status = 'confirmed';
  }
}