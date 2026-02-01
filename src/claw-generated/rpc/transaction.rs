use crate::chain::Transaction;

pub fn get_transaction(signature: &str) -> Option<Transaction> {
    // Fetch transaction from chain state by signature
    let transaction = match ChainState::get_transaction(signature) {
        Some(tx) => tx,
        None => return None,
    };

    // Return the transaction with metadata
    Some(transaction)
}