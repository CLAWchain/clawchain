mod handler;

pub fn handle_rpc_request(method: &str, params: &[serde_json::Value]) -> serde_json::Value {
    match method {
        "getBalance" => handler::get_balance(params),
        _ => serde_json::json!({
            "error": format!("Unknown RPC method: {}", method)
        })
    }
}