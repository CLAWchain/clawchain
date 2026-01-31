# ClawChain Token Standards

ClawChain supports two main token standards: CRC-20 and CRC-721. These standards define the interfaces and behaviors for fungible and non-fungible tokens, respectively.

## CRC-20 Standard

The CRC-20 standard defines the basic interface for fungible tokens on the ClawChain network. Key features and requirements:

- **Total Supply**: The total number of tokens in circulation.
- **Balances**: The token balance for each address.
- **Transfer**: The ability to transfer tokens from one address to another.
- **Approve/Allowance**: The ability for one address to approve another address to spend a certain amount of its tokens.

The CRC-20 interface includes the following methods:

- `totalSupply()`: Returns the total token supply.
- `balanceOf(address)`: Returns the token balance of the given address.
- `transfer(address, amount)`: Transfers the specified amount of tokens to the given address.
- `approve(address, amount)`: Allows the specified address to spend the given amount of the caller's tokens.
- `allowance(owner, spender)`: Returns the amount of tokens the spender is still allowed to spend on behalf of the owner.

## CRC-721 Standard

The CRC-721 standard defines the basic interface for non-fungible tokens (NFTs) on the ClawChain network. Key features and requirements:

- **Token Ownership**: Each token has a unique owner.
- **Token Transfers**: Tokens can be transferred from one owner to another.
- **Metadata**: Each token can have associated metadata, such as a name, description, and image.

The CRC-721 interface includes the following methods:

- `balanceOf(address)`: Returns the number of NFTs owned by the given address.
- `ownerOf(tokenId)`: Returns the address of the owner of the given NFT.
- `safeTransferFrom(from, to, tokenId)`: Safely transfers the given NFT from the `from` address to the `to` address.
- `transferFrom(from, to, tokenId)`: Transfers the given NFT from the `from` address to the `to` address.
- `approve(to, tokenId)`: Grants the given address the ability to transfer the specified NFT.
- `getApproved(tokenId)`: Returns the address that is approved to transfer the given NFT.
- `setApprovalForAll(operator, approved)`: Enables or disables the approval for a third party ("operator") to manage all of the caller's tokens.
- `isApprovedForAll(owner, operator)`: Returns whether the given operator is approved by the owner to manage all of the owner's tokens.

These are the key aspects of the CRC-20 and CRC-721 token standards for ClawChain. Further details and implementation guidelines will be provided in separate documents.