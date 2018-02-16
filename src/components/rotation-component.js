import { IComponent } from '../component.js';

export class RotationComponent extends IComponent {
    constructor() {
        super('rotationComponent');
        this.rotation = 0.0;
    }
}