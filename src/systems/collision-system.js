class CollisionSystem extends ISystem {
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
            if (entity.components.asteroidComponent || entity.components.blinkingComponent) {
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
                if (entity == entity2 || !entity2.components.asteroidComponent || entity2.components.blinkingComponent) {
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
                const points2 = shape2.points.map((point) => point.multiplyMatrix(transform2));

                if (entity.components.bulletComponent && entity2.components.asteroidComponent) {
                    let collision = false;

                    if (BumbleCollision.circleToShape(new BumbleCircle(shape.centerPoint.multiplyMatrix(transform), shape.radius), shape2, transform2)) {
                        collision = true;
                    }

                    if (collision) {
                        this.observable.next({
                            collisionObject1: {
                                type: 'bullet',
                                entity: entity
                            },
                            collisionObject2: {
                                type: 'asteroid',
                                entity: entity2
                            }
                        });
                    }
                }

                if (entity.components.playerControlledComponent && entity2.components.asteroidComponent) {
                    const points1 = shape.points.map((point) => point.multiplyMatrix(transform));
                    let collision = false;
                    
                    for (let point of points1) {
                        if (collision) {
                            break;
                        }
                        collision = BumbleCollision.pointToShape(point, shape2, transform2);
                    }

                    for (let point of points2) {
                        if (collision) {
                            break;
                        }
                        collision = BumbleCollision.pointToShape(point, shape, transform);
                    }

                    if (collision) {
                        this.observable.next({
                            collisionObject1: {
                                type: 'player',
                                entity: entity
                            },
                            collisionObject2: {
                                type: 'asteroid',
                                entity: entity2
                            }
                        });
                    }
                }
            }
        }
    }
}