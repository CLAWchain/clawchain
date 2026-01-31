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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simulate_transaction() {
        let params = SimulateTransactionParams {
            transaction: "0123456789abcdef".to_string(),
        };

        let result = simulate_transaction(params).unwrap();
        assert!(!result.logs.is_empty());
        assert!(result.compute_units > 0);
    }
}