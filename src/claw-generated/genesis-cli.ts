import { GenesisConfig, DEFAULT_GENESIS_CONFIG } from './genesis-config';
import { generateGenesisBlock } from './genesis-generator';
import { writeFile } from 'fs/promises';

async function main() {
  let config: GenesisConfig = DEFAULT_GENESIS_CONFIG;

  // Allow overriding config from command line arguments
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i];
    const value = process.argv[i + 1];
    switch (key) {
      case '--chain-id':
        config.chainId = value;
        break;
      case '--timestamp':
        config.timestamp = parseInt(value);
        break;
      case '--block-time':
        config.blockTime = parseInt(value);
        break;
      case '--block-size':
        config.blockSize = parseInt(value);
        break;
      case '--initial-accounts':
        config.initialAccounts = JSON.parse(value);
        break;
    }
  }

  const genesisBlock = generateGenesisBlock(config);
  await writeFile('genesis.json', JSON.stringify(genesisBlock, null, 2));
  console.log('Genesis block generated:', genesisBlock);
}

main().catch((err) => {
  console.error('Error generating genesis block:', err);
  process.exit(1);
});