use super::rpc_methods;
use serde_json::{json, Value};

pub struct RpcServer {}

impl RpcServer {
    pub fn new() -&gt; Self {
        RpcServer {}
    }

    pub fn handle_request(&amp;self, request: &amp;Value) -&gt; Value {
        let method = request["method"].as_str().unwrap();
        let params = request["params"].clone();

        match method {
            "getBlock" =&gt; {
                let params: rpc_methods::GetBlockParams = serde_json::from_value(params).unwrap();
                let result = rpc_methods::get_block(params);
                json!(result)
            },
            _ =&gt; {
                json!({
                    "error": format!("Unknown RPC method: {}", method),
                    "code": -32601
                })
            }
        }
    }
}