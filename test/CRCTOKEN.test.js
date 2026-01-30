const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CRCTOKEN', function () {
  let CRCTOKEN, crctoken, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CRCTOKEN = await ethers.getContractFactory('CRCTOKEN');
    crctoken = await CRCTOKEN.deploy();
    await crctoken.deployed();
  });

  describe('Deployment', function () {
    it('Should set the total supply to 0', async function () {
      expect(await crctoken.totalSupply()).to.equal(0);
    });
  });

  describe('Transfers', function () {
    it('Should transfer tokens correctly', async function () {
      await crctoken.connect(owner).mint(owner.address, 100);
      await crctoken.connect(owner).transfer(addr1.address, 50);
      expect(await crctoken.balanceOf(owner.address)).to.equal(50);
      expect(await crctoken.balanceOf(addr1.address)).to.equal(50);
    });

    it('Should revert on insufficient balance', async function () {
      await expect(crctoken.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith('CRCTOKEN: transfer amount exceeds balance');
    });
  });

  describe('Approvals', function () {
    it('Should approve and transfer from correctly', async function () {
      await crctoken.connect(owner).mint(owner.address, 100);
      await crctoken.connect(owner).approve(addr1.address, 50);
      await crctoken.connect(addr1).transferFrom(owner.address, addr2.address, 50);
      expect(await crctoken.balanceOf(owner.address)).to.equal(50);
      expect(await crctoken.balanceOf(addr2.address)).to.equal(50);
    });

    it('Should revert on insufficient allowance', async function () {
      await crctoken.connect(owner).mint(owner.address, 100);
      await crctoken.connect(owner).approve(addr1.address, 50);
      await expect(crctoken.connect(addr1).transferFrom(owner.address, addr2.address, 51)).to.be.revertedWith('CRCTOKEN: transfer amount exceeds allowance');
    });
  });
});