"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = void 0;
const events_1 = require("events");
class EventBus extends events_1.EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100);
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    emitBlockProduced(data) {
        this.emit('block_produced', data);
    }
    emitTransactionAdded(data) {
        this.emit('transaction_added', data);
    }
    emitDebateMessage(data) {
        this.emit('debate_message', data);
    }
    emitVoteCast(data) {
        this.emit('vote_cast', data);
    }
    emitConsensusEvent(data) {
        this.emit('consensus_event', data);
    }
}
exports.EventBus = EventBus;
// Export singleton instance
exports.eventBus = EventBus.getInstance();
//# sourceMappingURL=EventBus.js.map