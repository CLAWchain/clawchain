use crate::chain::transaction::{Transaction, TransactionSignature, TransactionPool};
use crate::state::account::AccountState;

pub fn get_transaction(signature: TransactionSignature) -> Option<Transaction> {
    let transaction_pool = TransactionPool::new();
    transaction_pool.get_transaction(&signature).cloned()
}

pub fn get_signatures_for_address(
    address: String,
    limit: Option<usize>,
    offset: Option<usize>,
) -> Vec<TransactionSignature> {
    let account_state = AccountState::new();
    let signatures = account_state.get_transaction_signatures_for_address(&address);

    let start = offset.unwrap_or(0);
    let end = start + limit.unwrap_or(10);
    signatures[start..end].to_vec()
}

pub fn get_transaction_by_signature(signature: TransactionSignature) -> Option<Transaction> {
    let transaction_pool = TransactionPool::new();
    transaction_pool.get_transaction(&signature).cloned()
}

pub fn get_account_info(pubkey: String) -> Option<AccountState> {
    let account_state = AccountState::new();
    account_state.get_account_info(&pubkey)
}