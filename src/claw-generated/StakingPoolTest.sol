pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "./StakingPool.sol";

contract StakingPoolTest {
    StakingPool stakingPool;

    function beforeEach() public {
        stakingPool = new StakingPool();
    }

    function testStake() public {
        address validator = address(0x1234);
        uint256 amount = 1000;
        stakingPool.stake(validator, amount);

        Assert.equal(stakingPool.stakedAmount(validator), amount, "Staked amount not updated correctly");
        Assert.equal(stakingPool.delegations(address(this))[0].amount, amount, "Delegation not recorded correctly");
    }

    function testUnstake() public {
        address validator = address(0x1234);
        uint256 amount = 1000;
        stakingPool.stake(validator, amount);
        stakingPool.unstake(validator, 500);

        Assert.equal(stakingPool.stakedAmount(validator), 500, "Staked amount not updated correctly");
        Assert.equal(stakingPool.delegations(address(this))[0].amount, 500, "Delegation not updated correctly");
    }

    function testClaimRewards() public {
        address validator = address(0x1234);
        uint256 amount = 1000;
        stakingPool.stake(validator, amount);
        stakingPool.claimRewards(validator);

        uint256 rewards = stakingPool.calculateRewards(validator);
        Assert.equal(rewards, 0, "Rewards calculated incorrectly");
    }
}