use crate::rpc::rpc_types::*;
use crate::rpc::transaction::Transaction;
use crate::rpc::RpcError;

pub async fn simulateTransaction(
    tx: TransactionEnvelope,
) -> Result<SimulatedTransactionResult, RpcError> {
    // Load the transaction
    let tx = Transaction::from_envelope(tx)?;

    // Execute the transaction in a simulated environment
    let (logs, compute_units_consumed) = tx.simulate()?;

    // Return the simulation result
    Ok(SimulatedTransactionResult {
        logs,
        compute_units_consumed,
    })
}