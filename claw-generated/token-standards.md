# ClawChain Token Standards

ClawChain supports two primary token standards: CRC-20 and CRC-721. This document outlines the key features and requirements of each standard.

## CRC-20 Token Standard

The CRC-20 (ClawChain Request for Comments 20) token standard defines a common set of rules and functions for fungible tokens on the ClawChain blockchain. This allows for the creation of interoperable token contracts and ensures consistent behavior across different token implementations.

### Required Functions
- `totalSupply()`: Returns the total token supply.
- `balanceOf(address account)`: Returns the token balance of the specified account.
- `transfer(address recipient, uint256 amount)`: Transfers the specified amount of tokens from the caller's account to the recipient's account.
- `approve(address spender, uint256 amount)`: Allows the specified spender to withdraw from the caller's account up to the specified amount.
- `allowance(address owner, address spender)`: Returns the remaining number of tokens that the spender is allowed to withdraw from the owner.

### Optional Functions
- `name()`: Returns the name of the token.
- `symbol()`: Returns the symbol of the token.
- `decimals()`: Returns the number of decimals the token uses for its representation.

### Events
- `Transfer(address indexed from, address indexed to, uint256 value)`: Emitted when tokens are transferred from one account to another.
- `Approval(address indexed owner, address indexed spender, uint256 value)`: Emitted when an account grants another account permission to spend a specified amount of tokens.

### Implementation Example
Here's an example of a basic CRC-20 token implementation in Solidity:

```solidity
pragma solidity ^0.8.0;

contract CRC20Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
```

## CRC-721 Non-Fungible Token (NFT) Standard

The CRC-721 (ClawChain Request for Comments 721) token standard defines a common interface for non-fungible tokens on the ClawChain blockchain. This allows for the creation of unique, indivisible digital assets that can be traded, collected, and used in various applications.

### Required Functions
- `ownerOf(uint256 tokenId)`: Returns the address of the owner of the specified token ID.
- `transferFrom(address from, address to, uint256 tokenId)`: Transfers the specified token ID from the `from` address to the `to` address.
- `approve(address to, uint256 tokenId)`: Grants the specified address permission to transfer the specified token ID.
- `getApproved(uint256 tokenId)`: Returns the address that is approved to transfer the specified token ID.
- `setApprovalForAll(address operator, bool approved)`: Enables or disables the specified operator to manage all of the caller's tokens.
- `isApprovedForAll(address owner, address operator)`: Returns whether the specified operator is approved by the owner to manage all of the owner's tokens.

### Events
- `Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`: Emitted when a token is transferred from one address to another.
- `Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)`: Emitted when an address is approved for a token ID.
- `ApprovalForAll(address indexed owner, address indexed operator, bool approved)`: Emitted when an operator is enabled or disabled for an owner.

### Implementation Example
Here's an example of a basic CRC-721 token implementation in Solidity:

```solidity
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CRC721Token is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function safeMint(address to) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _burn(tokenId);
    }
}
```

In this example, we use the OpenZeppelin ERC721 implementation as a starting point. The `safeMint` function allows new tokens to be minted, and the `burn` function allows owners to destroy their tokens.

## Conclusion
ClawChain's support for the CRC-20 and CRC-721 token standards provides a solid foundation for building a wide range of decentralized applications, from fungible cryptocurrencies to unique digital collectibles. By following these standards, developers can create interoperable token contracts that integrate seamlessly with the ClawChain ecosystem.