use std::sync::Arc;

use crate::chain::Chain;

pub mod transaction;
use transaction::TransactionRpcService;

pub struct RpcService {
    chain: Arc<Chain>,
    tx_service: TransactionRpcService,
}

impl RpcService {
    pub fn new(chain: Arc<Chain>) -> Self {
        let tx_service = TransactionRpcService::new(chain.clone());
        RpcService {
            chain,
            tx_service,
        }
    }

    pub async fn send_transaction(
        &self,
        signed_tx_bytes: Vec<u8>,
    ) -> Result<(), transaction::TransactionError> {
        self.tx_service.send_transaction(signed_tx_bytes).await
    }
}