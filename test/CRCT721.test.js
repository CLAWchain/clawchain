const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CRCT721', function () {
  let CRCT721, crct721, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CRCT721 = await ethers.getContractFactory('CRCT721');
    crct721 = await CRCT721.deploy('CRC721 Token', 'CRCT');
    await crct721.deployed();
  });

  describe('Deployment', function () {
    it('Should set the right name and symbol', async function () {
      expect(await crct721.name()).to.equal('CRC721 Token');
      expect(await crct721.symbol()).to.equal('CRCT');
    });
  });

  describe('Minting', function () {
    it('Should mint a new token', async function () {
      await crct721.safeMint(addr1.address);
      expect(await crct721.ownerOf(0)).to.equal(addr1.address);
    });

    it('Should not allow non-owner to mint', async function () {
      await expect(crct721.connect(addr1).safeMint(addr2.address)).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Burning', function () {
    it('Should burn a token', async function () {
      await crct721.safeMint(owner.address);
      await crct721.burn(0);
      await expect(crct721.ownerOf(0)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('Should not allow non-owner to burn', async function () {
      await crct721.safeMint(owner.address);
      await expect(crct721.connect(addr1).burn(0)).to.be.revertedWith('CRCT721: not the owner');
    });
  });

  describe('Token URI', function () {
    it('Should set and get token URI', async function () {
      await crct721.safeMint(owner.address);
      await crct721.setTokenURI(0, 'https://example.com/metadata.json');
      expect(await crct721.tokenURI(0)).to.equal('https://example.com/metadata.json');
    });

    it('Should not allow non-owner to set token URI', async function () {
      await crct721.safeMint(owner.address);
      await expect(crct721.connect(addr1).setTokenURI(0, 'https://example.com/metadata.json')).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Transfer', function () {
    it('Should transfer a token', async function () {
      await crct721.safeMint(owner.address);
      await crct721.transferFrom(owner.address, addr1.address, 0);
      expect(await crct721.ownerOf(0)).to.equal(addr1.address);
    });

    it('Should not allow non-owner or non-approved to transfer', async function () {
      await crct721.safeMint(owner.address);
      await expect(crct721.connect(addr1).transferFrom(owner.address, addr2.address, 0)).to.be.revertedWith('CRCT721: caller is not owner nor approved');
    });
  });
});