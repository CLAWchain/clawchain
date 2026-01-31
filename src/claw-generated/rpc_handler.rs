use jsonrpc_core::{Error, IoHandler, Params};
use jsonrpc_derive::rpc;

mod simulate_transaction;

#[rpc]
pub trait RPCHandler {
    #[rpc(name = "simulateTransaction")]
    fn simulate_transaction(&self, params: Params) -> Result<simulate_transaction::SimulateTransactionResult, Error>;
}

pub struct RPCHandlerImpl;

impl RPCHandler for RPCHandlerImpl {
    fn simulate_transaction(&self, params: Params) -> Result<simulate_transaction::SimulateTransactionResult, Error> {
        simulate_transaction::simulate_transaction(params.parse()?)
    }
}

pub fn create_rpc_handler() -> IoHandler {
    let mut io = IoHandler::new();
    io.extend_with(RPCHandlerImpl.to_delegate());
    io
}