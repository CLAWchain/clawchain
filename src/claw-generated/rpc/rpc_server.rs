use jsonrpc_core::{IoHandler, Result};
use crate::rpc::rpc_methods;
use crate::transaction::Transaction;

pub struct RPCServer {
    pub handler: IoHandler,
}

impl RPCServer {
    pub fn new() -> Self {
        let mut handler = IoHandler::new();
        handler.add_method("simulateTransaction", |params: jsonrpc_core::Params| {
            let tx: Transaction = params.parse()?;
            let (logs, compute_units) = rpc_methods::simulate_transaction(tx);
            Ok(json!({
                "logs": logs,
                "computeUnits": compute_units
            }))
        });
        RPCServer { handler }
    }
}