import { ISystem } from '../system.js';

export class AsteroidSystem extends ISystem {
    constructor() {
        super();
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => entity.components.asteroidComponent)) {
            if (entity.components.rotationComponent) {
                entity.components.rotationComponent.rotation = (entity.components.rotationComponent.rotation + 0.01) % (Math.PI * 2);
            }
        }
    }
}