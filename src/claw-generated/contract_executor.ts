import { ExecutionContext } from './types';

export class ContractExecutor {
  execute(context: ExecutionContext): void {
    // Implement CALL opcode here
    const targetAddress = context.getTargetAddress();
    const targetContract = context.getContract(targetAddress);
    if (!targetContract) {
      throw new Error(`Contract at ${targetAddress} not found`);
    }

    const targetContext = new ExecutionContext(
      targetContract.code,
      context.getCalldata(),
      context.getGas(),
      targetAddress,
      context.getSender(),
      context.getValue()
    );

    targetContext.setParentContext(context);
    targetContract.execute(targetContext);

    // Handle return value and gas refund
    context.setReturnValue(targetContext.getReturnValue());
    context.setGasRefund(targetContext.getGasRefund());
  }
}