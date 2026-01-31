// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CRC721.sol";
import "./ICRC721Metadata.sol";

/**
 * @title CRC721Metadata
 * @dev Extension of CRC721 contract that adds metadata functionality.
 */
contract CRC721Metadata is CRC721, ICRC721Metadata {
    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Mapping from token ID to URI
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "CRC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal virtual {
        require(_exists(tokenId), "CRC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = uri;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {
            _setTokenURI(tokenId, "");
        }
    }
}