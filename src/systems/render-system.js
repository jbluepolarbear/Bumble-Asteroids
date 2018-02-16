import { ISystem } from '../system.js';
import { BumbleTransformation } from '../bumble.js';

export class RenderSystem extends ISystem {
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

            let opacity = 1.0;
            if (entity.components.opacityComponent) {
                opacity = entity.components.opacityComponent.opacity;
            }

            if (entity.components.blinkingComponent && !entity.components.blinkingComponent.show) {
                opacity *= 0.1;
            }

            bumble.context.globalAlpha = opacity;
            
            shape.draw();
        }
    }
}