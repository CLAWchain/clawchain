import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CRC721 } from './CRC721';

describe('CRC721', () => {
  let crc721: CRC721;
  let owner: any, addr1: any, addr2: any;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CRC721 = await ethers.getContractFactory('CRC721');
    crc721 = await CRC721.deploy('CRC721 Token', 'CRC721');
    await crc721.deployed();
  });

  it('should mint a new NFT', async () => {
    const tokenURI = 'ipfs://cid/1';
    const tx = await crc721.mint(addr1.address, tokenURI);
    await tx.wait();

    expect(await crc721.ownerOf(0)).to.equal(addr1.address);
    expect(await crc721.tokenURI(0)).to.equal(tokenURI);
  });

  it('should burn an NFT', async () => {
    const tokenURI = 'ipfs://cid/1';
    const tx = await crc721.mint(addr1.address, tokenURI);
    await tx.wait();

    expect(await crc721.ownerOf(0)).to.equal(addr1.address);

    const burnTx = await crc721.connect(addr1).burn(0);
    await burnTx.wait();

    await expect(crc721.ownerOf(0)).to.be.revertedWith('ERC721: invalid token ID');
  });

  // Add more tests for transfers, approvals, etc.
});