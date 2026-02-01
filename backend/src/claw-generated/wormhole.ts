// wormhole.ts
import { EventBus } from '../events/EventBus';
import { ChainObserver } from '../agent/ChainObserver';
import { WormholeMessage, WormholeValidator } from './wormhole/types';
import { WormholeMessageHandler } from './wormhole/message-handler';
import { WormholeSubmitter } from './wormhole/message-submitter';
import { WormholeValidatorManager } from './wormhole/validator-manager';

export class WormholeIntegration {
  private eventBus: EventBus;
  private chainObserver: ChainObserver;
  private messageHandler: WormholeMessageHandler;
  private messageSubmitter: WormholeSubmitter;
  private validatorManager: WormholeValidatorManager;

  constructor(eventBus: EventBus, chainObserver: ChainObserver) {
    this.eventBus = eventBus;
    this.chainObserver = chainObserver;

    this.messageHandler = new WormholeMessageHandler(this.eventBus, this.chainObserver);
    this.messageSubmitter = new WormholeSubmitter(this.eventBus, this.chainObserver);
    this.validatorManager = new WormholeValidatorManager(this.eventBus, this.chainObserver);
  }

  async start() {
    await this.messageHandler.start();
    await this.messageSubmitter.start();
    await this.validatorManager.start();
  }

  async stop() {
    await this.messageHandler.stop();
    await this.messageSubmitter.stop();
    await this.validatorManager.stop();
  }
}