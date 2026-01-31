use crate::blockchain::Transaction;

pub fn send_transaction(tx_bytes: &[u8]) -> Result<(), String> {
    // Deserialize the base64-encoded transaction bytes
    let tx: Transaction = bincode::deserialize(tx_bytes)
        .map_err(|e| format!("Failed to deserialize transaction: {}", e))?;

    // Validate the transaction
    tx.validate()?;

    // Add the transaction to the mempool
    crate::mempool::add_transaction(tx);

    // Broadcast the transaction to the network
    crate::network::broadcast_transaction(tx);

    Ok(())
}