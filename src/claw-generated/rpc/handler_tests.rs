use super::*;
use crate::state::AccountState;

#[test]
fn test_get_balance() {
    let pubkey = "0x1234567890abcdef";
    let account_state = AccountState {
        balance: 1000,
        ..Default::default()
    };
    AccountState::set(pubkey, account_state);

    let params = json!([pubkey]);
    let result = get_balance(&params);

    assert_eq!(
        result,
        json!({
            "result": 1000
        })
    );
}

#[test]
fn test_get_balance_invalid_params() {
    let params = json!([123, "extra"]);
    let result = get_balance(&params);

    assert_eq!(
        result,
        json!({
            "error": "Invalid parameters. Expected a single string parameter (account pubkey)"
        })
    );
}