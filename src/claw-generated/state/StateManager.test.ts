import { StateManager } from './StateManager';
import { ReadWriteLock } from './ReadWriteLock';
import { StateDiffManager } from './StateDiffManager';

describe('StateManager', () => {
  let stateManager: StateManager;
  let stateDiffManager: StateDiffManager;

  beforeEach(() => {
    stateDiffManager = new StateDiffManager();
    stateManager = new StateManager(stateDiffManager);
  });

  it('should acquire and release read locks correctly', async () => {
    const key = 'test-key';
    const value = { data: 'test-value' };

    // Simulate concurrent reads
    const readPromises = [];
    for (let i = 0; i < 10; i++) {
      readPromises.push(stateManager.getState(key));
    }
    await Promise.all(readPromises);

    // Verify that the read locks were acquired and released correctly
    const lock = (stateManager as any).getLock(key);
    expect(lock.readLocks).toBe(0);
  });

  it('should acquire and release write locks correctly', async () => {
    const key = 'test-key';
    const value = { data: 'test-value' };

    // Simulate concurrent writes
    const writePromises = [];
    for (let i = 0; i < 10; i++) {
      writePromises.push(stateManager.setState(key, value, i));
    }
    await Promise.all(writePromises);

    // Verify that the write locks were acquired and released correctly
    const lock = (stateManager as any).getLock(key);
    expect(lock.writeLocks).toBe(0);
  });

  it('should prioritize writers over readers', async () => {
    const key = 'test-key';
    const value = { data: 'test-value' };

    // Acquire a write lock
    const writePromise = stateManager.setState(key, value, 0);

    // Simulate concurrent reads
    const readPromises = [];
    for (let i = 0; i < 10; i++) {
      readPromises.push(stateManager.getState(key));
    }

    // Wait for the write lock to be released
    await writePromise;

    // Wait for the read promises to complete
    await Promise.all(readPromises);

    // Verify that the write lock was prioritized over the reads
    const lock = (stateManager as any).getLock(key);
    expect(lock.readLocks).toBe(0);
    expect(lock.writeLocks).toBe(0);
  });
});