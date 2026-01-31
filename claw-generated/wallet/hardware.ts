import Transport from '@ledgerhq/hw-transport-node-hid';
import Eth from '@ledgerhq/hw-app-eth';

export class HardwareWallet {
  async signTransaction(transaction: any): Promise&lt;string&gt; {
    const transport = await Transport.create();
    const eth = new Eth(transport);
    const result = await eth.signTransaction(
      "m/44'/60'/0'/0/0",
      transaction
    );
    await transport.close();
    return result.r + result.s + result.v.toString(16);
  }
}