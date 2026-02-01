// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CRC-721 Non-Fungible Token Standard Base
 * @dev Implements the core logic and data structures for the CRC-721 standard.
 */
abstract contract CRC721Base is IERC721, ERC165 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    string public name;
    string public symbol;

    mapping(uint256 => address) private _owners;
    mapping(address => Counters.Counter) private _ownedTokensCount;
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function balanceOf(address owner) public view virtual override returns (uint256) {
        return _ownedTokensCount[owner].current();
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        return _owners[tokenId];
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function _mint(address to, uint256 tokenId, string memory tokenURI) internal virtual {
        _owners[tokenId] = to;
        _ownedTokensCount[to].increment();
        _tokenURIs[tokenId] = tokenURI;
        emit Transfer(address(0), to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);
        _ownedTokensCount[owner].decrement();
        delete _owners[tokenId];
        delete _tokenURIs[tokenId];
        emit Transfer(owner, address(0), tokenId);
    }

    function _transferFrom(address from, address to, uint256 tokenId) internal virtual {
        require(ownerOf(tokenId) == from, "CRC721: transfer of token that is not own");
        _ownedTokensCount[from].decrement();
        _ownedTokensCount[to].increment();
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }
}