pragma solidity ^0.8.0;

import "../utils/SafeMath.sol";

contract StakingPool {
    using SafeMath for uint256;

    struct Delegation {
        address delegator;
        address validator;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Delegation[]) public delegations;
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastClaimTimestamp;
    uint256 public rewardsPerYear = 10; // 10% annual interest rate

    event Staked(address indexed delegator, address indexed validator, uint256 amount);
    event Unstaked(address indexed delegator, address indexed validator, uint256 amount);
    event Rewards(address indexed validator, uint256 amount);

    function stake(address validator, uint256 amount) public {
        // Add delegation
        Delegation memory newDelegation = Delegation(
            msg.sender,
            validator,
            amount,
            block.timestamp
        );
        delegations[msg.sender].push(newDelegation);

        // Update total staked
        stakedAmount[validator] = stakedAmount[validator].add(amount);

        emit Staked(msg.sender, validator, amount);
    }

    function unstake(address validator, uint256 amount) public {
        // Find delegation
        Delegation[] storage userDelegations = delegations[msg.sender];
        for (uint256 i = 0; i < userDelegations.length; i++) {
            if (userDelegations[i].validator == validator) {
                // Withdraw amount
                userDelegations[i].amount = userDelegations[i].amount.sub(amount);
                stakedAmount[validator] = stakedAmount[validator].sub(amount);
                emit Unstaked(msg.sender, validator, amount);
                return;
            }
        }
        revert("No matching delegation found");
    }

    function claimRewards(address validator) public {
        uint256 rewards = calculateRewards(validator);
        // Send rewards to validator
        lastClaimTimestamp[validator] = block.timestamp;
        emit Rewards(validator, rewards);
    }

    function calculateRewards(address validator) internal view returns (uint256) {
        uint256 totalStaked = stakedAmount[validator];
        uint256 timeSinceLastClaim = block.timestamp - lastClaimTimestamp[validator];
        uint256 annualRewards = totalStaked.mul(rewardsPerYear).div(100);
        uint256 rewards = annualRewards.mul(timeSinceLastClaim).div(365 days);
        return rewards;
    }
}