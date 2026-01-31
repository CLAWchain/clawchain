use super::get_balance;

pub fn handle_rpc_request(method: &str, params: &[String]) -> Result<serde_json::Value, String> {
    match method {
        "getBalance" => {
            if params.len() != 1 {
                return Err("Invalid params".to_string());
            }
            let pubkey = &params[0];
            let balance = get_balance(pubkey);
            Ok(serde_json::json!({ "jsonrpc": "2.0", "result": balance, "id": 1 }))
        },
        _ => Err(format!("Unknown method: {}", method))
    }
}