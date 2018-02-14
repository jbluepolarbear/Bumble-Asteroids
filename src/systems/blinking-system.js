class BlinkingSystem extends ISystem {
    constructor() {
        super();
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => entity.components.blinkingComponent)) {
            const blinkingComponent = entity.components.blinkingComponent;
            blinkingComponent.currentTime += bumble.deltaTime;
            if (blinkingComponent.currentTime > blinkingComponent.resetTime) {
                blinkingComponent.show = !blinkingComponent.show;
                blinkingComponent.currentTime = 0.0;
            }
        }
    }
}