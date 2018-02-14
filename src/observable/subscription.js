class Subscription {
    constructor(observable, subscriptionId) {
        this.__obersvable = observable;
        this.__subscriptionId = subscriptionId;
    }

    unsubscribe() {
        this.__obersvable.unsubscribe(this.__subscriptionId);
    }
}