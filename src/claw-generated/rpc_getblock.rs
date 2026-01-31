use crate::db::{BlockStore, TransactionStore};
use crate::explorer::block_explorer::BlockExplorer;
use crate::rpc::types::{BlockResponse, EncodingType, TransactionDetails};
use jsonrpc_core::{Error, ErrorCode, Result};
use jsonrpc_derive::rpc;

#[rpc]
pub trait GetBlockRpc {
    #[rpc(name = "getBlock")]
    fn get_block(
        &self,
        slot: u64,
        encoding: Option&lt;EncodingType&gt;,
    ) -&gt; Result&lt;BlockResponse&gt;;
}

pub struct GetBlockRpcImpl {
    block_store: BlockStore,
    transaction_store: TransactionStore,
    block_explorer: BlockExplorer,
}

impl GetBlockRpc for GetBlockRpcImpl {
    fn get_block(
        &self,
        slot: u64,
        encoding: Option&lt;EncodingType&gt;,
    ) -&gt; Result&lt;BlockResponse&gt; {
        let block = self.block_store.get_block_by_slot(slot).ok_or_else(|| {
            Error {
                code: ErrorCode::ServerError(-32000),
                message: format!("Block not found for slot {}", slot),
                data: None,
            }
        })?;

        let transactions = self.transaction_store
            .get_transactions_by_block_hash(&amp;block.hash)
            .map(|tx| TransactionDetails::from(tx));

        let response = BlockResponse {
            slot: block.slot,
            hash: block.hash.to_string(),
            parent_hash: block.parent_hash.to_string(),
            timestamp: block.timestamp,
            transactions,
        };

        match encoding {
            Some(EncodingType::Json) =&gt; Ok(response),
            Some(EncodingType::Binary) =&gt; {
                let encoded = serde_json::to_vec(&amp;response)
                    .map_err(|err| Error {
                        code: ErrorCode::ServerError(-32000),
                        message: format!("Failed to encode block: {}", err),
                        data: None,
                    })?;
                Ok(encoded.into())
            }
            None =&gt; Ok(response),
        }
    }
}