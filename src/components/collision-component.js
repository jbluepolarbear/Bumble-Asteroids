import { IComponent } from '../component.js';

export class CollisionComponent extends IComponent {
    constructor() {
        super('collisionComponent');
        this.collidable = true;
        this.collidableType = 'any';
        this.collidableTypes = [];
    }
}