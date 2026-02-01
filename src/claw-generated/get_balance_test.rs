use std::sync::Arc;

use crate::{
    account::AccountState,
    rpc::{get_balance, RpcRequest},
};

#[tokio::test]
async fn test_get_balance() {
    let state = Arc::new(AccountState::new());
    state.set_balance("some_pubkey", 1000).await;

    let request = RpcRequest {
        params: RpcRequestParams {
            pubkey: "some_pubkey".to_string(),
        },
    };

    let response = get_balance(request, state).await;
    assert_eq!(response.result, 1000);
}