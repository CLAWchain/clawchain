use std::collections::HashMap;

pub type TransactionSignature = String;

#[derive(Debug, Clone)]
pub struct Transaction {
    pub signature: TransactionSignature,
    // Add transaction fields here
}

pub struct TransactionPool {
    pub transactions: HashMap&lt;TransactionSignature, Transaction&gt;,
}

impl TransactionPool {
    pub fn new() -&gt; Self {
        TransactionPool {
            transactions: HashMap::new(),
        }
    }

    pub fn add_transaction(&amp;mut self, tx: Transaction) {
        self.transactions.insert(tx.signature.clone(), tx);
    }

    pub fn get_transaction(&amp;self, signature: &amp;TransactionSignature) -&gt; Option&lt;&amp;Transaction&gt; {
        self.transactions.get(signature)
    }
}