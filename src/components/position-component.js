import { IComponent } from '../component.js';
import { BumbleVector } from '../bumble.js';

export class PositionComponent extends IComponent {
    constructor() {
        super('positionComponent');
        this.position = new BumbleVector();
    }
}