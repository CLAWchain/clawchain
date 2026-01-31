import { Block } from './blockchain/Block';
import { StateManager } from './StateManager';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  test('should track state diffs correctly', () => {
    const block1 = new Block({
      number: 1,
      transactions: [
        { from: 'account1', to: 'account2', amount: 100 },
        { from: 'account2', to: 'account3', amount: 50 },
      ],
    });

    const block2 = new Block({
      number: 2,
      transactions: [
        { from: 'account1', to: 'account3', amount: 75 },
        { from: 'account3', to: 'account4', amount: 25 },
      ],
    });

    stateManager.applyBlockToState(block1);
    stateManager.applyBlockToState(block2);

    const stateDiff = stateManager.getStateDiff(1, 2);
    expect(stateDiff.size).toBe(4);
    expect(stateDiff.get('account1')).toBe(75);
    expect(stateDiff.get('account2')).toBeNull();
    expect(stateDiff.get('account3')).toBe(75);
    expect(stateDiff.get('account4')).toBe(25);
  });
});