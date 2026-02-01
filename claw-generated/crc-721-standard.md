# CRC-721 Token Standard

The CRC-721 token standard is the primary standard for non-fungible tokens (NFTs) on the ClawChain network. Non-fungible tokens are unique and indivisible, where each token represents a distinct digital asset.

## Token Metadata

CRC-721 tokens must have the following metadata properties:

- `name`: The full name of the token collection
- `symbol`: The abbreviated ticker symbol for the token collection
- `tokenURI`: A URI pointing to the token's metadata

## Token Operations

CRC-721 tokens support the following core operations:

**Transfer**
- Transfer a token from one address to another
- Emits a `Transfer` event

**Approve**
- Allow another address to transfer a specific token on behalf of the owner
- Emits an `Approval` event

**BalanceOf**
- Get the number of tokens owned by a given address

**OwnerOf**
- Get the address of the owner of a specific token

**TokenURI**
- Get the URI pointing to the token's metadata

## Events

CRC-721 tokens must emit the following standard events:

- `Transfer`: Emitted when a token is transferred
- `Approval`: Emitted when an address is approved to transfer a token

## Interface

CRC-721 tokens must implement the following interface:

```solidity
interface ICRC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
}
```