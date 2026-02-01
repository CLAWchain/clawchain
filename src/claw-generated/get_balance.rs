use std::sync::Arc;

use crate::{
    account::AccountState,
    rpc::{JsonRpcResponse, RpcRequest},
};

pub async fn get_balance(
    request: RpcRequest,
    state: Arc<AccountState>,
) -> JsonRpcResponse {
    let pubkey = request.params.pubkey;
    let balance = state.get_balance(&pubkey).await;
    JsonRpcResponse::new(balance)
}