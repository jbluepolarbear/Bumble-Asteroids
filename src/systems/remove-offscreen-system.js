class RemoveOffscreenSystem extends ISystem {
    constructor() {
        super()
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => entity.components.removeOffscreenComponent && entity.components.shapeComponent && entity.components.positionComponent)) {
            const positionComponent = entity.components.positionComponent;
            const shapeComponent = entity.components.shapeComponent;
            const radius = shapeComponent.shape.radius;
            if (positionComponent.position.x + radius < 0.0) {
                this.observable.next(entity);
            } else if (positionComponent.position.x - radius > bumble.width) {
                this.observable.next(entity);
            }

            if (positionComponent.position.y + radius < 0.0) {
                this.observable.next(entity);
            } else if (positionComponent.position.y - radius > bumble.height) {
                this.observable.next(entity);
            }
        }
    }
}