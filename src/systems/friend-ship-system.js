import { ISystem } from '../system.js';
import { BumbleVector, BumbleKeyCodes } from '../bumble.js';

export class FriendShipSystem extends ISystem {
    constructor() {
        super();
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => { return entity.components.friendShipComponent; })) {
            const physicsComponent = entity.components.physicsComponent;
            physicsComponent.acceleration = new BumbleVector(0.0, 0.0);
            const rotationComponent = entity.components.rotationComponent;
            const randomNum = Math.random();
            const playerTurnSpeed = 0.05;
            const playerBoostSpeed = 200.0;
            if (randomNum < 0.25) {
                rotationComponent.rotation = (rotationComponent.rotation - playerTurnSpeed) % (-Math.PI * 2.0);
            } else if (randomNum > 0.95) {
                rotationComponent.rotation = (rotationComponent.rotation + playerTurnSpeed) % (Math.PI * 2.0);
            }
            
            const boostRandomNum = Math.random();
            if (boostRandomNum > 0.4)
            {
                const direction = new BumbleVector(Math.cos(rotationComponent.rotation), Math.sin(rotationComponent.rotation)).normalized();
                physicsComponent.acceleration = direction.multiplyValue(playerBoostSpeed);
            }
            
            const fireRandomNum = Math.random();
            if (fireRandomNum > 0.6) {
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