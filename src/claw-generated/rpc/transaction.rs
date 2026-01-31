use std::sync::Arc;

use crate::{
    chain::Chain,
    transaction::{Transaction, TransactionError},
};

pub struct TransactionRpcService {
    chain: Arc<Chain>,
}

impl TransactionRpcService {
    pub fn new(chain: Arc<Chain>) -> Self {
        TransactionRpcService { chain }
    }

    pub async fn send_transaction(
        &self,
        signed_tx_bytes: Vec<u8>,
    ) -> Result<(), TransactionError> {
        let tx = Transaction::from_bytes(&signed_tx_bytes)?;
        self.chain.process_transaction(&tx).await?;
        Ok(())
    }
}