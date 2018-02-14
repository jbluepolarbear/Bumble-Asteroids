class ISystem {
    constructor() {
        this.__observable = new Observable();
    }

    update(entities, bumble) {

    }

    get observable() {
        return this.__observable;
    }
}