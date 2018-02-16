import { IComponent } from '../component.js';

export class AsteroidComponent extends IComponent {
    constructor() {
        super('asteroidComponent');
        this.size = null;
    }
}