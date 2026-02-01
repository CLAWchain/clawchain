import { assert } from 'chai';
import { rpcCall } from '../api/rpc';

describe('RPC API', () => {
  describe('rpcCall()', () => {
    it('should return a valid response for a known method', async () => {
      const response = await rpcCall('getBalance', ['0x1234']);
      assert.hasAllKeys(response, ['result', 'error', 'id']);
      assert.isString(response.result);
    });

    it('should return an error for an invalid method', async () => {
      try {
        await rpcCall('invalidMethod', []);
        assert.fail('Expected an error');
      } catch (err) {
        assert.hasAllKeys(err, ['code', 'message']);
      }
    });

    it('should return an error for invalid parameters', async () => {
      try {
        await rpcCall('getBalance', [123]);
        assert.fail('Expected an error');
      } catch (err) {
        assert.hasAllKeys(err, ['code', 'message']);
      }
    });
  });
});