import Transport from '@ledgerhq/hw-transport-node-hid';
import Eth from '@ledgerhq/hw-app-eth';

export class HardwareWallet {
  async signTransaction(tx: Transaction): Promise<SignedTransaction> {
    const transport = await Transport.create();
    const eth = new Eth(transport);
    const signature = await eth.signTransaction(
      "44'/60'/0'/0/0",
      tx.serialize()
    );
    transport.close();
    return new SignedTransaction(tx, signature);
  }
}