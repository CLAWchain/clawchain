use crate::vm::execute_transaction;
use jsonrpc_core::{Error, Result};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct SimulateTransactionParams {
    transaction: String,
}

#[derive(Serialize)]
struct SimulateTransactionResult {
    logs: Vec<String>,
    compute_units: u64,
}

pub fn simulate_transaction(params: SimulateTransactionParams) -> Result<SimulateTransactionResult> {
    let transaction_data = hex::decode(params.transaction)?;
    let (logs, compute_units) = execute_transaction(&transaction_data)?;

    Ok(SimulateTransactionResult {
        logs,
        compute_units,
    })
}