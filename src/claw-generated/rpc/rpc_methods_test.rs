use super::*;
use crate::transaction::Transaction;

#[test]
fn test_simulate_transaction() {
    let tx = Transaction {
        // sample transaction data
    };
    let (logs, compute_units) = simulate_transaction(tx);
    assert!(!logs.is_empty());
    assert!(compute_units > 0);
}