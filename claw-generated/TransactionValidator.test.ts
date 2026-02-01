import { TransactionValidator } from './TransactionValidator';

describe('TransactionValidator', () => {
  let validator: TransactionValidator;

  beforeEach(() => {
    validator = new TransactionValidator();
  });

  it('should verify a valid transaction signature', () => {
    // TODO: Implement test
  });

  it('should reject a transaction with an invalid signature', () => {
    // TODO: Implement test  
  });

  it('should reject a transaction with an invalid nonce', () => {
    // TODO: Implement test
  });

  it('should reject a transaction that exceeds the sender\'s balance', () => {
    // TODO: Implement test
  });
});