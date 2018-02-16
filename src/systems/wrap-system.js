import { ISystem } from '../system.js';

export class WrapSystem extends ISystem {
    constructor() {
        super()
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => entity.components.wrapComponent && entity.components.shapeComponent && entity.components.positionComponent)) {
            const positionComponent = entity.components.positionComponent;
            const shapeComponent = entity.components.shapeComponent;
            const radius = shapeComponent.shape.radius;
            if (positionComponent.position.x + radius < 0.0) {
                positionComponent.position.x = bumble.width + radius;
            } else if (positionComponent.position.x - radius > bumble.width) {
                positionComponent.position.x = -radius;
            }

            if (positionComponent.position.y + radius < 0.0) {
                positionComponent.position.y = bumble.height + radius;
            } else if (positionComponent.position.y - radius > bumble.height) {
                positionComponent.position.y = -radius;
            }
        }
    }
}