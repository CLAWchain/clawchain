import { Block } from './block';

export class ChainReorg {
  private currentChain: Block[];
  private newChain: Block[];

  constructor(currentChain: Block[], newChain: Block[]) {
    this.currentChain = currentChain;
    this.newChain = newChain;
  }

  async reorg(): Promise&lt;void&gt; {
    const commonAncestor = this.findCommonAncestor();
    console.log(`Common ancestor found: ${commonAncestor?.hash}`);

    // Implement the rest of the reorg logic
  }

  private findCommonAncestor(): Block | undefined {
    // Traverse the chains to find the common ancestor
    let currentChainPtr = this.currentChain.length - 1;
    let newChainPtr = this.newChain.length - 1;

    while (currentChainPtr >= 0 && newChainPtr >= 0) {
      if (this.currentChain[currentChainPtr].hash === this.newChain[newChainPtr].hash) {
        return this.currentChain[currentChainPtr];
      }

      currentChainPtr--;
      newChainPtr--;
    }

    return undefined;
  }
}