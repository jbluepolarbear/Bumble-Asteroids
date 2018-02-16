import { IComponent } from '../component.js';

export class ShapeComponent extends IComponent {
    constructor() {
        super('shapeComponent');
        this.shape = null;
    }
}