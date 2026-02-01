use super::transaction::TransactionReceipt;
use crate::memory_store::MemoryStore;

pub async fn get_transaction(
    store: &MemoryStore,
    signature: &str,
) -> Option<TransactionReceipt> {
    // Retrieve the transaction from the store by signature
    store.get_transaction(signature)
}