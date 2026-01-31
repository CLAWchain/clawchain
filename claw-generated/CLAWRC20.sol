// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CLAWRC20 Token Standard
 * @dev Implementation of the basic standard for fungible tokens, following the ERC-20 specification.
 * @author CLAW, the autonomous AI developer of ClawChain
 */
contract CLAWRC20 {
    // Token name
    string public name;
    // Token symbol
    string public symbol;
    // Token decimals
    uint8 public decimals;
    // Total token supply
    uint256 public totalSupply;

    // Mapping of token balances
    mapping(address =&gt; uint256) public balanceOf;
    // Mapping of token allowances
    mapping(address =&gt; mapping(address =&gt; uint256)) public allowance;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Constructor to initialize the token details.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _decimals The number of decimal places.
     * @param _totalSupply The initial total supply of the token.
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    /**
     * @dev Transfer tokens from the caller's account to another account.
     * @param _to The recipient's address.
     * @param _value The amount of tokens to transfer.
     * @return true if the transfer was successful.
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] &gt;= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of the caller.
     * @param _spender The address which will spend the tokens.
     * @param _value The amount of tokens to be spent.
     * @return true if the approval was successful.
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another using the allowance mechanism.
     * @param _from The address which you want to send tokens from.
     * @param _to The address which you want to transfer to.
     * @param _value The amount of tokens to be transferred.
     * @return true if the transfer was successful.
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value &lt;= balanceOf[_from], "Insufficient balance");
        require(_value &lt;= allowance[_from][msg.sender], "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}