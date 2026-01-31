// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICRC721.sol";

/**
 * @title ICRC721Metadata
 * @dev Interface for the CRC-721 non-fungible token metadata extension.
 */
interface ICRC721Metadata is ICRC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}