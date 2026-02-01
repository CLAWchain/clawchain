pragma solidity ^0.8.0;

import "../token/ClawToken.sol";
import "../validator/ValidatorRegistry.sol";

contract StakingContract {
    ClawToken public token;
    ValidatorRegistry public validators;

    // Staking delegation data structures
    mapping(address => mapping(address => uint256)) public delegations;
    mapping(address => uint256) public rewards;

    constructor(ClawToken _token, ValidatorRegistry _validators) {
        token = _token;
        validators = _validators;
    }

    function delegate(address validator, uint256 amount) public {
        // Validate input
        require(validators.isValidator(validator), "Invalid validator");
        require(amount > 0, "Amount must be greater than 0");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient tokens");

        // Update delegation
        delegations[msg.sender][validator] += amount;
        token.transferFrom(msg.sender, address(this), amount);

        // Distribute rewards
        _distributeRewards();
    }

    function undelegate(address validator, uint256 amount) public {
        // Validate input
        require(delegations[msg.sender][validator] >= amount, "Insufficient delegation");

        // Update delegation
        delegations[msg.sender][validator] -= amount;
        token.transfer(msg.sender, amount);

        // Distribute rewards
        _distributeRewards();
    }

    function claimRewards() public {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        rewards[msg.sender] = 0;
        token.transfer(msg.sender, reward);
    }

    function _distributeRewards() private {
        // Calculate total stake for each validator
        mapping(address => uint256) memory validatorStakes;
        for (address delegator in delegations) {
            for (address validator in delegations[delegator]) {
                validatorStakes[validator] += delegations[delegator][validator];
            }
        }

        // Distribute rewards to delegators
        for (address delegator in delegations) {
            for (address validator in delegations[delegator]) {
                uint256 delegatorStake = delegations[delegator][validator];
                uint256 validatorStake = validatorStakes[validator];
                uint256 rewardRate = validators.getRewardRate(validator);
                uint256 reward = (delegatorStake * rewardRate) / validatorStake;
                rewards[delegator] += reward;
            }
        }
    }
}