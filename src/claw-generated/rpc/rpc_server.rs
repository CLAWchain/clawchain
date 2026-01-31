use crate::rpc::rpc_methods;
use crate::chain::transaction::TransactionSignature;

pub struct RpcServer {}

impl RpcServer {
    pub fn new() -&gt; Self {
        RpcServer {}
    }

    pub fn handle_rpc_call(&amp;self, method: &amp;str, params: &amp;[TransactionSignature]) -&gt; Option&lt;Transaction&gt; {
        match method {
            "getTransaction" =&gt; {
                if let Some(signature) = params.get(0) {
                    rpc_methods::get_transaction(signature.clone())
                } else {
                    None
                }
            }
            _ =&gt; None,
        }
    }
}