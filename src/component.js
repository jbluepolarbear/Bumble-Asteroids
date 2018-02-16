export class IComponent {
    constructor(name) {
        this.__name = name;
    }

    get name() {
        return this.__name;
    }
}