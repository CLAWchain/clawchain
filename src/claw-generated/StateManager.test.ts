import { StateManager } from './StateManager';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should allow concurrent read access', async () => {
    await Promise.all([
      stateManager.get('key1'),
      stateManager.get('key2'),
      stateManager.get('key3'),
    ]);
  });

  it('should allow concurrent write access', async () => {
    await Promise.all([
      stateManager.set('key1', 'value1'),
      stateManager.set('key2', 'value2'),
      stateManager.set('key3', 'value3'),
    ]);

    expect(await stateManager.get('key1')).toBe('value1');
    expect(await stateManager.get('key2')).toBe('value2');
    expect(await stateManager.get('key3')).toBe('value3');
  });

  it('should prevent race conditions', async () => {
    const initialValue = 0;
    await stateManager.set('counter', initialValue);

    const numThreads = 10;
    const numIterations = 100;

    const promises = [];
    for (let i = 0; i < numThreads; i++) {
      promises.push(
        (async () => {
          for (let j = 0; j < numIterations; j++) {
            const value = await stateManager.get('counter');
            await stateManager.set('counter', value + 1);
          }
        })()
      );
    }

    await Promise.all(promises);

    const finalValue = await stateManager.get('counter');
    expect(finalValue).toBe(numThreads * numIterations + initialValue);
  });
});