import { IComponent } from '../component.js';

export class PlayerControlledComponent extends IComponent {
    constructor() {
        super('playerControlledComponent');
        this.controlled = true;
    }
}