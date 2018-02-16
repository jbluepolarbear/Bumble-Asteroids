import { ISystem } from '../system.js';
import { BumbleVector, BumbleKeyCodes } from '../bumble.js';

export class UserInputSystem extends ISystem {
    constructor() {
        super();
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => entity.components.positionComponent && entity.components.playerControlledComponent && entity.components.physicsComponent && entity.components.rotationComponent)) {
            const physicsComponent = entity.components.physicsComponent;
            physicsComponent.acceleration = new BumbleVector(0.0, 0.0);
            const rotationComponent = entity.components.rotationComponent;

            const playerTurnSpeed = 0.05;
            const playerBoostSpeed = 200.0;
            if (bumble.keys.isDown(BumbleKeyCodes.LEFT) || bumble.keys.isDown(BumbleKeyCodes.A)) {
                rotationComponent.rotation = (rotationComponent.rotation - playerTurnSpeed) % (-Math.PI * 2.0);
            }

            if (bumble.keys.isDown(BumbleKeyCodes.RIGHT) || bumble.keys.isDown(BumbleKeyCodes.D)) {
                rotationComponent.rotation = (rotationComponent.rotation + playerTurnSpeed) % (Math.PI * 2.0);
            }

            if (bumble.keys.isDown(BumbleKeyCodes.UP) || bumble.keys.isDown(BumbleKeyCodes.W)) {
                const direction = new BumbleVector(Math.cos(rotationComponent.rotation), Math.sin(rotationComponent.rotation)).normalized();
                physicsComponent.acceleration = direction.multiplyValue(playerBoostSpeed);
            }
            
            if (bumble.keys.isDown(BumbleKeyCodes.SPACE)) {
                this.observable.next({
                    key: BumbleKeyCodes.SPACE, 
                    extra: {
                        direction: new BumbleVector(Math.cos(rotationComponent.rotation), Math.sin(rotationComponent.rotation)).normalized(),
                        additionalVelocity: physicsComponent.velocity,
                        position: entity.components.positionComponent.position
                    }
                });
            }
        }
    }
}