use super::transaction::TransactionReceipt;
use crate::memory_store::MemoryStore;
use crate::vm::VM;

pub async fn get_transaction(
    store: &MemoryStore,
    signature: &str,
) -> Option<TransactionReceipt> {
    // Retrieve the transaction from the store by signature
    store.get_transaction(signature)
}

pub async fn simulate_transaction(
    store: &MemoryStore,
    vm: &VM,
    transaction: &str,
) -> Result<(TransactionReceipt, u64), String> {
    // Decode the transaction
    let tx = vm.decode_transaction(transaction)?;

    // Simulate the transaction
    let receipt = vm.simulate_transaction(&tx)?;

    // Return the transaction receipt and compute units used
    Ok((receipt, receipt.compute_units_consumed))
}