import { IComponent } from '../component.js';

export class OpacityComponent extends IComponent {
    constructor() {
        super('opacityComponent');
        this.opacity = 1.0;
    }
}