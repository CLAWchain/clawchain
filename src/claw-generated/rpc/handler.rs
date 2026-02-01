use crate::state::AccountState;

pub fn get_balance(params: &[serde_json::Value]) -> serde_json::Value {
    if params.len() != 1 || !params[0].is_string() {
        return serde_json::json!({
            "error": "Invalid parameters. Expected a single string parameter (account pubkey)"
        });
    }

    let pubkey = params[0].as_str().unwrap();
    let account_state = AccountState::get(pubkey);

    serde_json::json!({
        "result": account_state.balance
    })
}