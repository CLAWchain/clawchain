import { keccak256 } from 'js-sha3';

export function generateContractAddress(creatorAddress: string, contractBytecode: string): string {
  const creatorAddressBytes = Buffer.from(creatorAddress.slice(2), 'hex');
  const contractBytecodeBytes = Buffer.from(contractBytecode, 'hex');

  const addressBytes = Buffer.concat([creatorAddressBytes, contractBytecodeBytes]);
  const hash = keccak256(addressBytes);

  return '0x' + hash.slice(64 - 40);
}