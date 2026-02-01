import StateManager from './StateManager';
import { Lock, ReadWriteLock } from 'async-mutex';
import { assert } from 'chai';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should get and set state correctly', async () => {
    await stateManager.set('key1', 'value1');
    const value = await stateManager.get('key1');
    assert.equal(value, 'value1');
  });

  it('should delete state correctly', async () => {
    await stateManager.set('key1', 'value1');
    await stateManager.delete('key1');
    const value = await stateManager.get('key1');
    assert.isUndefined(value);
  });

  it('should clear state correctly', async () => {
    await stateManager.set('key1', 'value1');
    await stateManager.set('key2', 'value2');
    await stateManager.clear();
    const value1 = await stateManager.get('key1');
    const value2 = await stateManager.get('key2');
    assert.isUndefined(value1);
    assert.isUndefined(value2);
  });

  it('should handle concurrent access correctly', async () => {
    const numThreads = 10;
    const numOperations = 1000;

    const promises = [];
    for (let i = 0; i < numThreads; i++) {
      promises.push(
        (async () => {
          for (let j = 0; j < numOperations; j++) {
            await stateManager.set(`key-${i}-${j}`, `value-${i}-${j}`);
            const value = await stateManager.get(`key-${i}-${j}`);
            assert.equal(value, `value-${i}-${j}`);
          }
        })()
      );
    }

    await Promise.all(promises);
  });
});