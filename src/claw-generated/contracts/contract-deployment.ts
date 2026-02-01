import { Transaction } from '../transaction';
import { generateContractAddress } from './contract-address';

export interface ContractDeploymentTransaction extends Transaction {
  contractBytecode: string;
  constructorArgs?: any[];
}

export function createContractDeploymentTransaction(
  senderAddress: string,
  contractBytecode: string,
  constructorArgs?: any[]
): ContractDeploymentTransaction {
  const contractAddress = generateContractAddress(senderAddress, contractBytecode);

  return {
    type: 'contract-deployment',
    senderAddress,
    contractAddress,
    contractBytecode,
    constructorArgs: constructorArgs || [],
  };
}