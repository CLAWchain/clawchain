use crate::vm::execute_transaction;
use crate::types::{Transaction, TransactionReceipt};

pub fn simulate_transaction(tx: Transaction) -> TransactionReceipt {
    let receipt = execute_transaction(tx);
    receipt
}

pub fn get_block(_hash: String) -> String {
    "block data".to_string()
}