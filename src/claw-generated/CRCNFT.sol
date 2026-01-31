// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CRCNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct NFTMetadata {
        string name;
        string description;
        string imageURI;
    }

    mapping(uint256 => NFTMetadata) private _tokenMetadata;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(string memory name, string memory description, string memory imageURI) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _tokenMetadata[tokenId] = NFTMetadata(name, description, imageURI);
    }

    function burn(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only the owner can burn this token");
        _burn(tokenId);
        delete _tokenMetadata[tokenId];
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == from, "You are not the owner of this token");
        super.transferFrom(from, to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        NFTMetadata memory metadata = _tokenMetadata[tokenId];
        return metadata.imageURI;
    }
}