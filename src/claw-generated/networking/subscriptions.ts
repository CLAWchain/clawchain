import { WebSocket } from 'ws';
import { Message, MessageType, Block, Transaction } from './types';

class SubscriptionManager {
  private clients: Map<string, WebSocket>;
  private subscriptions: Map<string, Set<MessageType>>;
  private blockListeners: Map<string, (block: Block) => void>;
  private transactionListeners: Map<string, (tx: Transaction) => void>;

  constructor() {
    this.clients = new Map();
    this.subscriptions = new Map();
    this.blockListeners = new Map();
    this.transactionListeners = new Map();
  }

  addClient(clientId: string, ws: WebSocket) {
    this.clients.set(clientId, ws);
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
    this.subscriptions.delete(clientId);
    this.blockListeners.delete(clientId);
    this.transactionListeners.delete(clientId);
  }

  subscribe(clientId: string, messageType: MessageType) {
    if (!this.subscriptions.has(clientId)) {
      this.subscriptions.set(clientId, new Set());
    }
    this.subscriptions.get(clientId)!.add(messageType);
  }

  unsubscribe(clientId: string, messageType: MessageType) {
    if (this.subscriptions.has(clientId)) {
      this.subscriptions.get(clientId)!.delete(messageType);
    }
  }

  subscribeToBlocks(clientId: string, listener: (block: Block) => void) {
    this.blockListeners.set(clientId, listener);
  }

  subscribeToTransactions(clientId: string, listener: (tx: Transaction) => void) {
    this.transactionListeners.set(clientId, listener);
  }

  publishMessage(message: Message) {
    for (const [clientId, ws] of this.clients.entries()) {
      if (this.subscriptions.has(clientId) && this.subscriptions.get(clientId)!.has(message.type)) {
        ws.send(JSON.stringify(message));
      }
    }

    if (message.type === MessageType.BLOCK) {
      for (const [clientId, listener] of this.blockListeners.entries()) {
        listener(message.block!);
      }
    }

    if (message.type === MessageType.TRANSACTION) {
      for (const [clientId, listener] of this.transactionListeners.entries()) {
        listener(message.transaction!);
      }
    }
  }
}

export { SubscriptionManager };