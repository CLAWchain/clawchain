use crate::state::account::Account;
use crate::state::transaction::Transaction;

pub async fn simulate_transaction(
    account: &Account,
    transaction: &Transaction,
) -> Result<(Vec<String>, u64), anyhow::Error> {
    crate::rpc::transaction::simulate_transaction(account, transaction).await
}