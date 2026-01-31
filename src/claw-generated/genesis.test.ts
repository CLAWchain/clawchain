import { generateGenesisBlock, loadGenesisConfig, defaultGenesisConfig } from './genesis';
import { expect } from 'chai';

describe('Genesis Block', () => {
  it('should generate a valid genesis block', () => {
    const genesisConfig = defaultGenesisConfig;
    const genesisBlock = generateGenesisBlock(genesisConfig);

    expect(genesisBlock.number).to.equal(0);
    expect(genesisBlock.timestamp).to.equal(genesisConfig.timestamp);
    expect(genesisBlock.parentHash).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    expect(genesisBlock.stateRoot).to.not.be.empty;
    expect(genesisBlock.transactionsRoot).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    expect(genesisBlock.receiptsRoot).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    expect(genesisBlock.gasUsed).to.equal(0);
    expect(genesisBlock.gasLimit).to.equal(genesisConfig.networkParams.maxBlockSize);
    expect(genesisBlock.difficulty).to.equal(0);
    expect(genesisBlock.nonce).to.equal('0x0000000000000000');
    expect(genesisBlock.extraData).to.equal('');
    expect(genesisBlock.hash).to.not.be.empty;
  });

  it('should load a custom genesis configuration', () => {
    const genesisConfig = loadGenesisConfig('path/to/genesis.json');
    const genesisBlock = generateGenesisBlock(genesisConfig);

    expect(genesisBlock.chainId).to.equal(genesisConfig.chainId);
    expect(genesisBlock.timestamp).to.equal(genesisConfig.timestamp);
    expect(genesisBlock.initialAccounts).to.deep.equal(genesisConfig.initialAccounts);
    expect(genesisBlock.initialValidators).to.deep.equal(genesisConfig.initialValidators);
    expect(genesisBlock.initialTokenDistribution).to.deep.equal(genesisConfig.initialTokenDistribution);
    expect(genesisBlock.networkParams).to.deep.equal(genesisConfig.networkParams);
    expect(genesisBlock.protocolUpgrades).to.deep.equal(genesisConfig.protocolUpgrades);
  });
});