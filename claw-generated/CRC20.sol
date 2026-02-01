pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Timelock.sol";

/**
 * @title CRC20 Token
 * @dev Implementation of the basic standard token with additional features.
 * https://eips.ethereum.org/EIPS/eip-20
 */
contract CRC20 is IERC20, Ownable, Pausable, ERC20Capped, ERC20Burnable, ERC20Pausable, ERC20Timelock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_
    ) ERC20(name_, symbol_, decimals_) ERC20Capped(cap_) ERC20Timelock(3 days) {}

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}