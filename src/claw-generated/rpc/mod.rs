use std::sync::Arc;

use jsonrpc_core::{Error, IoHandler, Params};
use jsonrpc_derive::rpc;

use crate::chain::ChainState;
use crate::transaction::{SignedTransaction, TransactionError};

#[rpc]
pub trait RpcApi {
    #[rpc(name = "sendTransaction")]
    fn send_transaction(&self, params: Params) -> Result<(), Error>;
}

pub struct RpcServer {
    chain_state: Arc<ChainState>,
}

impl RpcApi for RpcServer {
    fn send_transaction(&self, params: Params) -> Result<(), Error> {
        // Parse the signed transaction from the params
        let signed_tx: SignedTransaction = params.parse()?;

        // Validate the transaction
        self.chain_state.validate_transaction(&signed_tx)?;

        // Add the transaction to the mempool
        self.chain_state.add_transaction(signed_tx);

        Ok(())
    }
}