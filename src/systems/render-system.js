class RenderSystem extends ISystem {
    constructor() {
        super();
    }

    update(entities, bumble) {
        bumble.clearScreen();
        for (let entity of entities.filter((entity) => entity.components.shapeComponent)) {
            const shape = entity.components.shapeComponent.shape;
            const transform = new BumbleTransformation(shape.width, shape.height);
            // may make component
            transform.anchor = shape.getAnchorToCenterPoint();
            if (entity.components.positionComponent) {
                transform.position = entity.components.positionComponent.position;
            }
            if (entity.components.rotationComponent) {
                transform.rotation = entity.components.rotationComponent.rotation;
            }
            bumble.applyTransformation(transform.build());
            
            shape.draw();
        }
    }
}