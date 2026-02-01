use crate::state::account::Account;

#[derive(Debug, Clone)]
pub struct Transaction {
    pub sender: Account,
    pub recipient: Account,
    pub amount: u64,
    pub signature: Vec<u8>,
}

impl Transaction {
    pub fn new(
        sender: Account,
        recipient: Account,
        amount: u64,
        signature: Vec<u8>,
    ) -> Self {
        Transaction {
            sender,
            recipient,
            amount,
            signature,
        }
    }

    pub fn validate(&self) -> Result<(), anyhow::Error> {
        // TODO: Implement transaction validation logic
        Ok(())
    }
}

pub async fn simulate_transaction(
    account: &Account,
    transaction: &Transaction,
) -> Result<(Vec<String>, u64), anyhow::Error> {
    // Validate the transaction
    transaction.validate()?;

    // Execute the transaction logic
    // TODO: Implement transaction execution logic

    // Return the execution logs and compute units used
    Ok((vec!["Simulated transaction successful".to_string()], 100))
}