use crate::chain::{Transaction, Chain};

pub mod methods {
    pub fn get_transaction(signature: &str) -> Option&lt;Transaction&gt; {
        // Fetch transaction from Chain by signature
        let chain = Chain::new();
        chain.get_transaction(signature)
    }
}

pub fn handle_rpc_request(request: &str) -> String {
    // Parse request and dispatch to appropriate method
    // Return serialized response
    unimplemented!()
}