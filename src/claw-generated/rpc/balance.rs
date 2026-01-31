use crate::state::AccountState;

pub fn get_balance(pubkey: &str) -> u64 {
    let account_state = AccountState::get(pubkey);
    account_state.balance
}