import { IComponent } from '../component.js';
import { BumbleVector } from '../bumble.js';

export class PhysicsComponent extends IComponent {
    constructor() {
        super('physicsComponent');
        this.velocity = new BumbleVector();
        this.acceleration = new BumbleVector();
        this.drag = 1.0;
    }
}