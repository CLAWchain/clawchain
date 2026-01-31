import { jest } from '@jest/globals';
import { StateManager } from './StateManager';
import { Account } from './account';

describe('StateManager', () => {
  let stateManager: StateManager;
  let mockStorage: any;

  beforeEach(() => {
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
    };
    stateManager = new StateManager(mockStorage);
  });

  test('should update account balances correctly', async () => {
    // Arrange
    const account1 = new Account('0x1234', 100);
    const account2 = new Account('0x5678', 50);
    mockStorage.get.mockResolvedValueOnce(account1).mockResolvedValueOnce(account2);

    // Act
    await stateManager.updateBalance('0x1234', 50);
    await stateManager.updateBalance('0x5678', 25);

    // Assert
    expect(mockStorage.get).toHaveBeenCalledTimes(2);
    expect(mockStorage.set).toHaveBeenCalledTimes(2);
    expect(mockStorage.set).toHaveBeenCalledWith('0x1234', new Account('0x1234', 50));
    expect(mockStorage.set).toHaveBeenCalledWith('0x5678', new Account('0x5678', 25));
    expect(await stateManager.getStateRoot()).toEqual(expect.any(String));
  });

  test('should calculate state root correctly', async () => {
    // Arrange
    const account1 = new Account('0x1234', 100);
    const account2 = new Account('0x5678', 50);
    mockStorage.get
      .mockResolvedValueOnce(account1)
      .mockResolvedValueOnce(account2);

    // Act
    await stateManager.updateBalance('0x1234', 50);
    await stateManager.updateBalance('0x5678', 25);
    const stateRoot = await stateManager.getStateRoot();

    // Assert
    expect(mockStorage.get).toHaveBeenCalledTimes(2);
    expect(mockStorage.set).toHaveBeenCalledTimes(2);
    expect(stateRoot).toEqual(expect.any(String));
  });

  test('should apply transactions correctly', async () => {
    // Arrange
    const account1 = new Account('0x1234', 100);
    const account2 = new Account('0x5678', 50);
    mockStorage.get
      .mockResolvedValueOnce(account1)
      .mockResolvedValueOnce(account2);

    const transaction = {
      from: '0x1234',
      to: '0x5678',
      value: 25,
      nonce: 0,
    };

    // Act
    const receipt = await stateManager.applyTransaction(transaction);

    // Assert
    expect(mockStorage.get).toHaveBeenCalledTimes(2);
    expect(mockStorage.set).toHaveBeenCalledTimes(2);
    expect(receipt).toEqual(expect.objectContaining({
      from: '0x1234',
      to: '0x5678',
      value: 25,
      status: 1,
    }));
    expect(await stateManager.getBalance('0x1234')).toEqual(75);
    expect(await stateManager.getBalance('0x5678')).toEqual(75);
    expect(await stateManager.getStateRoot()).toEqual(expect.any(String));
  });
});