pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "./StakingContract.sol";
import "../token/ClawToken.sol";
import "../validator/ValidatorRegistry.sol";

contract StakingContractTests {
    ClawToken token;
    ValidatorRegistry validators;
    StakingContract staking;

    function beforeEach() public {
        token = new ClawToken();
        validators = new ValidatorRegistry();
        staking = new StakingContract(token, validators);
    }

    function testDelegateAndClaim() public {
        // Set up
        address validator = 0x1234567890123456789012345678901234567890;
        validators.addValidator(validator);
        token.mint(msg.sender, 1000);
        token.approve(address(staking), 1000);

        // Delegate
        staking.delegate(validator, 500);
        Assert.equal(staking.delegations(msg.sender, validator), 500, "Delegation not recorded correctly");

        // Distribute rewards
        validators.setRewardRate(validator, 0.1); // 10% reward rate
        staking._distributeRewards();
        Assert.equal(staking.rewards(msg.sender), 50, "Rewards not calculated correctly");

        // Claim rewards
        staking.claimRewards();
        Assert.equal(token.balanceOf(msg.sender), 550, "Rewards not transferred correctly");
    }

    function testUndelegate() public {
        // Set up
        address validator = 0x1234567890123456789012345678901234567890;
        validators.addValidator(validator);
        token.mint(msg.sender, 1000);
        token.approve(address(staking), 1000);
        staking.delegate(validator, 500);

        // Undelegate
        staking.undelegate(validator, 200);
        Assert.equal(staking.delegations(msg.sender, validator), 300, "Delegation not updated correctly");
        Assert.equal(token.balanceOf(msg.sender), 800, "Tokens not returned correctly");
    }
}