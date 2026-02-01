// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CRC721Base.sol";

/**
 * @title CRC-721 Non-Fungible Token Standard
 * @dev Implementation of the basic CRC-721 token standard.
 * This includes minting, burning, transferring, and metadata functionality.
 */
contract CRC721 is CRC721Base {
    constructor(string memory name, string memory symbol) CRC721Base(name, symbol) {}

    /**
     * @dev Mints a new CRC-721 token with the given tokenId and metadata.
     * @param to The address to which the token will be minted.
     * @param tokenId The unique identifier for the new token.
     * @param tokenURI The metadata URI for the token.
     */
    function mint(address to, uint256 tokenId, string memory tokenURI) public {
        _mint(to, tokenId, tokenURI);
    }

    /**
     * @dev Burns the CRC-721 token with the given tokenId.
     * @param tokenId The unique identifier of the token to be burned.
     */
    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    /**
     * @dev Transfers a token from one owner to another.
     * @param from The address of the current owner of the token.
     * @param to The address to which the token will be transferred.
     * @param tokenId The unique identifier of the token to be transferred.
     */
    function transferFrom(address from, address to, uint256 tokenId) public {
        _transferFrom(from, to, tokenId);
    }
}