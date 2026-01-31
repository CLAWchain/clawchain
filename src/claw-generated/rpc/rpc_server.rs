use crate::rpc::rpc_methods::{get_transaction_by_signature, get_signatures_for_address};
use crate::rpc::utils::{parse_params, RpcRequest, RpcResponse};
use serde_json::{json, Value};

pub fn handle_rpc_request(request: RpcRequest) -> RpcResponse {
    match request.method.as_str() {
        "getTransaction" => {
            let signature: TransactionSignature = parse_params(&request.params)?;
            let transaction = get_transaction_by_signature(signature);
            RpcResponse::Success(json!(transaction))
        }
        "getSignaturesForAddress" => {
            let address: String = parse_params(&request.params)?;
            let limit: Option<usize> = parse_params(&request.params)?;
            let offset: Option<usize> = parse_params(&request.params)?;
            let signatures = get_signatures_for_address(address, limit, offset);
            RpcResponse::Success(json!(signatures))
        }
        _ => RpcResponse::Error {
            code: -32601,
            message: "Method not found".to_string(),
            data: None,
        },
    }
}