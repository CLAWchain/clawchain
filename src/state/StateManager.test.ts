import StateManager from './StateManager';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should set and get values', async () => {
    await stateManager.set('key1', 'value1');
    const value = await stateManager.get('key1');
    expect(value).toEqual('value1');
  });

  it('should delete values', async () => {
    await stateManager.set('key1', 'value1');
    await stateManager.delete('key1');
    const value = await stateManager.get('key1');
    expect(value).toBeUndefined();
  });

  it('should handle concurrent access', async () => {
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(stateManager.set(`key${i}`, `value${i}`));
    }
    await Promise.all(promises);

    const values = await Promise.all(
      Array.from({ length: 100 }).map((_, i) => stateManager.get(`key${i}`))
    );
    expect(values).toEqual(
      Array.from({ length: 100 }).map((_, i) => `value${i}`)
    );
  });
});