use std::collections::HashMap;

pub struct Transaction {
    pub signature: String,
    // Other transaction fields
}

pub struct Block {
    pub transactions: Vec&lt;Transaction&gt;,
    // Other block fields
}

pub struct Chain {
    pub blocks: Vec&lt;Block&gt;,
    pub transaction_index: HashMap&lt;String, (usize, usize)&gt;, // (block_index, tx_index)
}

impl Chain {
    pub fn new() -> Self {
        Chain {
            blocks: Vec::new(),
            transaction_index: HashMap::new(),
        }
    }

    pub fn get_transaction(&amp;self, signature: &amp;str) -&gt; Option&lt;Transaction&gt; {
        self.transaction_index.get(signature).and_then(|(block_index, tx_index)| {
            self.blocks.get(*block_index).and_then(|block| {
                block.transactions.get(*tx_index).cloned()
            })
        })
    }
}