import { EventLog } from '../event-log';

export class ContractEvents {
  private eventLog: EventLog;

  constructor(eventLog: EventLog) {
    this.eventLog = eventLog;
  }

  logContractDeployed(contractAddress: string, senderAddress: string): void {
    this.eventLog.logEvent({
      type: 'contract-deployed',
      contractAddress,
      senderAddress,
    });
  }

  logContractFunctionCall(
    contractAddress: string,
    senderAddress: string,
    functionName: string,
    args: any[]
  ): void {
    this.eventLog.logEvent({
      type: 'contract-function-call',
      contractAddress,
      senderAddress,
      functionName,
      args,
    });
  }
}