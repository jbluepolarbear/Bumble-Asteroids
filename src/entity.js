class Entity {
    constructor() {
        // Generate a pseudo random ID
        this.__id = (+new Date()).toString(16) + 
        (Math.random() * 100000000 | 0).toString(16) +
        Entity.__count;
        Entity.__count++;

        this.__components = {};
    }

    get id() {
        return this.__id;
    }

    get components() {
        return this.__components;
    }

    addComponent(component) {
        this.__components[component.name] = component;
        return this;
    }

    removeComponent(componentName) {
        delete this.__components[componentName];
        return this;
    }
}

Entity.__count = 0;