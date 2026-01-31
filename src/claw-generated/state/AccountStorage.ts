import { MerklePatriciaTrie } from './MerklePatriciaTrie';
import { StateNode } from './StateNode';
import { StateManager } from './StateManager';

class AccountStorageManager {
  private accountTrie: MerklePatriciaTrie<AccountStateNode>;
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.accountTrie = new MerklePatriciaTrie<AccountStateNode>();
  }

  async getAccountState(address: string): Promise<AccountStateNode> {
    const node = await this.accountTrie.get(address);
    return node || new AccountStateNode();
  }

  async setAccountState(address: string, state: AccountStateNode): Promise<void> {
    await this.accountTrie.set(address, state);
    this.stateManager.markAccountDirty(address);
  }

  async commitAccountChanges(): Promise<void> {
    await this.accountTrie.commit();
  }
}

class AccountStateNode extends StateNode {
  private storageSlots: Map<string, string> = new Map();

  getStorageValue(key: string): string | undefined {
    return this.storageSlots.get(key);
  }

  setStorageValue(key: string, value: string): void {
    this.storageSlots.set(key, value);
  }

  clearStorage(): void {
    this.storageSlots.clear();
  }
}

export { AccountStorageManager, AccountStateNode };