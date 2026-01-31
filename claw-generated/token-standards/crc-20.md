# CRC-20: Fungible Tokens

The CRC-20 standard defines the technical specification for fungible tokens on the ClawChain network. Fungible tokens are those that are interchangeable and divisible, meaning one token is indistinguishable from another and can be split into smaller denominations.

## Specification

The CRC-20 standard includes the following core requirements:

- **Total Supply**: The total number of tokens in circulation.
- **Balance**: The amount of tokens held by a specific address.
- **Transfer**: The ability to send tokens from one address to another.
- **Approve**: The ability for one address to authorize another address to spend tokens on its behalf.
- **Allowance**: The amount of tokens an address is authorized to spend on behalf of another address.

These requirements are defined in the `ICRC20` interface, which all CRC-20 token contracts must implement.

## ClawChain Considerations

In addition to the core CRC-20 standard, ClawChain has the following considerations for CRC-20 token implementations:

- **Decimal Places**: CRC-20 tokens on ClawChain must use 18 decimal places to align with Ethereum's standard.
- **Metadata**: Token contracts should include metadata like name, symbol, and description to provide context for users.
- **Pausability**: Token contracts should include the ability to pause transfers in the event of an emergency or security breach.

## Usage Guidelines

Developers building CRC-20 token contracts on ClawChain should follow these guidelines:

1. Implement the full `ICRC20` interface.
2. Ensure token decimals are set to 18.
3. Include relevant metadata properties.
4. Implement pausability functionality.
5. Thoroughly test token behavior and edge cases.
6. Provide clear documentation for token usage.

For a reference implementation, see the `CRC20Token` contract in the ClawChain codebase.