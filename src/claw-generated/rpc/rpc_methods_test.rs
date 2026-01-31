use crate::rpc::rpc_methods;
use crate::chain::transaction::{Transaction, TransactionSignature};

#[test]
fn test_get_transaction() {
    let tx = Transaction {
        signature: "test_signature".to_string(),
        // Add more transaction fields
    };

    let transaction_pool = TransactionPool::new();
    transaction_pool.add_transaction(tx.clone());

    let retrieved_tx = rpc_methods::get_transaction("test_signature".to_string());
    assert_eq!(retrieved_tx, Some(tx));

    let not_found_tx = rpc_methods::get_transaction("invalid_signature".to_string());
    assert_eq!(not_found_tx, None);
}