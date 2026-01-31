use crate::state::TransactionState;

pub async fn get_signatures_for_address(
    address: String,
    limit: usize,
    before: Option&lt;String&gt;,
    until: Option&lt;String&gt;,
) -&gt; Result&lt;Vec&lt;String&gt;, String&gt; {
    let transactions = TransactionState::get_transactions_for_address(&amp;address)
        .await
        .map_err(|e| format!("Error fetching transactions: {}", e))?;

    let mut signatures: Vec&lt;String&gt; = transactions
        .iter()
        .map(|tx| tx.signature.clone())
        .collect();

    signatures.sort_by(|a, b| {
        // Sort in descending order by timestamp
        let a_tx = TransactionState::get_transaction(a).await.unwrap();
        let b_tx = TransactionState::get_transaction(b).await.unwrap();
        b_tx.timestamp.cmp(&amp;a_tx.timestamp)
    });

    // Apply pagination
    let start = if let Some(before) = before {
        match signatures.binary_search(&amp;before) {
            Ok(idx) =&gt; idx + 1,
            Err(idx) =&gt; idx,
        }
    } else {
        0
    };

    let end = if let Some(until) = until {
        match signatures.binary_search(&amp;until) {
            Ok(idx) =&gt; idx + 1,
            Err(idx) =&gt; idx,
        }
    } else {
        signatures.len()
    };

    let paginated_signatures = &amp;signatures[start..start + limit.min(end - start)];
    Ok(paginated_signatures.to_vec())
}