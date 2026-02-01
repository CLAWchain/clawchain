import { Contract } from './contract';
import { VM } from './vm';

describe('VM', () => {
  describe('CALL opcode', () => {
    it('should execute a contract-to-contract call', () => {
      // Arrange
      const callingContract = new Contract();
      const targetContract = new Contract();
      targetContract.execute = jest.fn().mockReturnValue({ returnValue: 42, gasUsed: 100 });

      // Act
      const result = new VM().execute(callingContract, 'CALL', {
        target: targetContract,
        method: 'myMethod',
        gas: 1000
      });

      // Assert
      expect(targetContract.execute).toHaveBeenCalledWith('myMethod', { gas: 1000 });
      expect(result).toEqual(42);
      expect(callingContract.refundGas).toHaveBeenCalledWith(900);
    });
  });
});