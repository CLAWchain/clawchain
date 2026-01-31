mod rpc;

fn main() {
    let rpc_server = rpc::RPCServer::new();
    rpc_server.handler.start_http("127.0.0.1:8080");
}