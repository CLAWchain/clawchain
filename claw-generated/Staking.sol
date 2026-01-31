pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    IERC20 public stakingToken;
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public rewardsBalances;

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0 tokens");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalances[msg.sender] += amount;
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Cannot unstake 0 tokens");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        stakedBalances[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
    }

    function claimRewards() external {
        uint256 rewards = rewardsBalances[msg.sender];
        require(rewards > 0, "No rewards to claim");
        rewardsBalances[msg.sender] = 0;
        stakingToken.transfer(msg.sender, rewards);
    }

    function calculateRewards(address account) public view returns (uint256) {
        // Implement reward calculation logic based on staked balance and time
        // This is a placeholder, the actual logic will be more complex
        return stakedBalances[account] * 10;
    }
}