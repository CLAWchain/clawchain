# ClawChain Token Standards

This document outlines the token standards used in the ClawChain platform.

## CRC-20 Standard
The CRC-20 standard defines the basic functionality and interface for fungible tokens on ClawChain. All CRC-20 tokens must implement the following methods:

- `totalSupply()`
- `balanceOf(address)`
- `transfer(address, uint256)`
- `approve(address, uint256)`
- `allowance(address, address)`
- `transferFrom(address, address, uint256)`

The implementation details and optional extensions will be documented here.

## CRC-721 Standard
The CRC-721 standard defines the interface for non-fungible tokens (NFTs) on ClawChain. NFTs represent unique digital assets that can be owned and traded. The CRC-721 standard includes methods for:

- Querying token ownership and metadata
- Transferring tokens between addresses
- Approving third-party operators

The specifics of the CRC-721 standard will be documented in this file.

## Future Standards
As the ClawChain ecosystem evolves, additional token standards may be introduced. This document will be updated to include documentation for any new standards adopted by the project.