import { ISystem } from '../system.js';
import { BumbleTransformation, BumbleCollision, BumblePolygon } from '../bumble.js';

export class CollisionSystem extends ISystem {
    constructor() {
        super();
    }

    transformPoints(matrix, points) {
        const transformedPoints = [];
        for (let point of points) {
            transformedPoints.push(point.multiplyMatrix(matrix));
        }
    }

    update(entities, bumble) {
        for (let entity of entities.filter((entity) => { return entity.components.collisionComponent && entity.components.shapeComponent; })) {
            if (!entity.active || (!entity.components.collisionComponent.collidable && entity.components.collisionComponent.collidableTypes.length === 0)) {
                continue;
            }

            const shape = entity.components.shapeComponent.shape;
            const transformation = new BumbleTransformation(shape.width, shape.height);
            // may make component
            transformation.anchor = shape.getAnchorToCenterPoint();
            if (entity.components.positionComponent) {
                transformation.position = entity.components.positionComponent.position;
            }
            if (entity.components.rotationComponent) {
                transformation.rotation = entity.components.rotationComponent.rotation;
            }
            const transform = transformation.build();

            for (let entity2 of entities) {
                if (!entity2.active || entity == entity2 || !entity.components.collisionComponent.collidable || !entity.components.collisionComponent.collidableTypes.includes(entity2.components.collisionComponent.collidableType) || entity2.components.blinkingComponent) {
                    continue;
                }
                
                const shape2 = entity2.components.shapeComponent.shape;
                const transformation2 = new BumbleTransformation(shape2.width, shape2.height);
                // may make component
                transformation2.anchor = shape2.getAnchorToCenterPoint();
                if (entity2.components.positionComponent) {
                    transformation2.position = entity2.components.positionComponent.position;
                }
                if (entity2.components.rotationComponent) {
                    transformation2.rotation = entity2.components.rotationComponent.rotation;
                }
                const transform2 = transformation2.build();
                const points2 = shape2.points.slice(0, shape2.points.length - 1).map((point) => point.multiplyMatrix(transform2));

                const points1 = shape.points.slice(0, shape.points.length - 1).map((point) => point.multiplyMatrix(transform));
                let collision = false;
                
                for (let point of points1) {
                    if (collision) {
                        break;
                    }
                    collision = BumbleCollision.pointToPolygon(point, new BumblePolygon(points2));
                }

                for (let point of points2) {
                    if (collision) {
                        break;
                    }
                    collision = BumbleCollision.pointToPolygon(point, new BumblePolygon(points1));
                }

                if (collision) {
                    this.observable.next({
                        collisionObject1: {
                            type: entity.components.collisionComponent.collidableType,
                            entity: entity
                        },
                        collisionObject2: {
                            type: entity2.components.collisionComponent.collidableType,
                            entity: entity2
                        }
                    });
                    break;
                }
            }
        }
    }
}