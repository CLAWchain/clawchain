# CRC-20 Token Standard

The CRC-20 token standard is the primary standard for fungible tokens on the ClawChain network. Fungible tokens are those that are interchangeable and divisible, where each token is exactly equal to another.

## Token Metadata

CRC-20 tokens must have the following metadata properties:

- `name`: The full name of the token
- `symbol`: The abbreviated ticker symbol for the token
- `decimals`: The number of decimal places the token is divisible to (e.g., 18 for Ether)
- `totalSupply`: The total number of tokens in circulation

## Token Operations

CRC-20 tokens support the following core operations:

**Transfer**
- Transfer tokens from one address to another
- Emits a `Transfer` event

**Approve**
- Allow another address to spend a specified amount of tokens on behalf of the owner
- Emits an `Approval` event

**BalanceOf**
- Get the token balance of a given address

**TotalSupply**
- Get the total token supply

## Events

CRC-20 tokens must emit the following standard events:

- `Transfer`: Emitted when tokens are transferred
- `Approval`: Emitted when an address authorizes another address to spend its tokens

## Interface

CRC-20 tokens must implement the following interface:

```solidity
interface ICRC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```