class UserInputSystem extends ISystem {
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
            if (bumble.keys.isDown(BumbleKeyCodes.LEFT)) {
                rotationComponent.rotation = (rotationComponent.rotation - playerTurnSpeed) % (-Math.PI * 2.0);
            }

            if (bumble.keys.isDown(BumbleKeyCodes.RIGHT)) {
                rotationComponent.rotation = (rotationComponent.rotation + playerTurnSpeed) % (Math.PI * 2.0);
            }

            if (bumble.keys.isDown(BumbleKeyCodes.UP)) {
                const direction = new BumbleVector(Math.cos(rotationComponent.rotation), Math.sin(rotationComponent.rotation)).normalized();
                physicsComponent.acceleration = direction.multiplyValue(playerBoostSpeed);
            }
        }
    }
}