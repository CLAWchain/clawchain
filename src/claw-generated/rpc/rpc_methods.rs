use crate::chain::transaction::{Transaction, TransactionSignature, TransactionPool};

pub fn get_transaction(signature: TransactionSignature) -&gt; Option&lt;Transaction&gt; {
    let transaction_pool = TransactionPool::new();
    transaction_pool.get_transaction(&amp;signature).cloned()
}