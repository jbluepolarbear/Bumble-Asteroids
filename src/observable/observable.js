import { Subscription } from './subscription.js';

export class Observable {
    constructor() {
        this.__functionMap = new Map();
        this.__subscriptionId = 0;
    }

    subscribe(func) {
        const subscriptionId = ++this.__subscriptionId;
        this.__functionMap.set(subscriptionId, func);
        return new Subscription(this, subscriptionId);
    }

    unsubscribe(subscriptionId) {
        this.__functionMap.remove(subscriptionId);
    }

    next(value) {
        for (let func of this.__functionMap.values()) {
            func(value);
        }
    }
}