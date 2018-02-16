import { ISystem } from '../system.js';
import { BumbleVector } from '../bumble.js';

export class PhysicsSystem extends ISystem {
    constructor() {
        super();
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => entity.components.physicsComponent)) {
            if (entity.components.positionComponent) {
                const physicsComponent = entity.components.physicsComponent;
                const acceleration = physicsComponent.acceleration.multiplyValue(bumble.deltaTime);
                physicsComponent.velocity = physicsComponent.velocity.add(acceleration);
                physicsComponent.velocity = physicsComponent.velocity.multiplyValue(physicsComponent.drag);
                if (physicsComponent.velocity.length() <= 0.001) {
                    physicsComponent.velocity = new BumbleVector(0.0, 0.0);
                }
                const velocity = physicsComponent.velocity.multiplyValue(bumble.deltaTime);
                entity.components.positionComponent.position = entity.components.positionComponent.position.add(velocity);
            }
        }
    }
}