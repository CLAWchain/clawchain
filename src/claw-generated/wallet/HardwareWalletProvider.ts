export interface HardwareWalletProvider {
  name: string;
  signTransaction(txData: any): Promise&lt;string&gt;;
}