mod transaction;

pub use transaction::*;

pub fn send_transaction(tx_bytes: &[u8]) -> Result<(), String> {
    transaction::send_transaction(tx_bytes)
}