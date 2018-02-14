class Game {
    constructor() {
        this.__bumble = new Bumble('asteroids', 720, 480, BumbleColor.fromRGB(0, 0, 0), 60);
        this.__bumble.runCoroutine(this.init.bind(this));
        this.__bumble.debug.showFramerate = true; 
    }

    buildAsteroid(radius, noise, sections) {
        const points = [];
        const step = Math.PI * 2.0 / sections;
        let cStep = 0.0;
        for (let i = 0; i < sections; ++i) {
            const nRadius = radius + (BumbleUtility.randomFloat(noise) * (Math.random() > 0.5 ? 1.0 : -1.0));
            const x = Math.cos(cStep) * nRadius;
            const y = Math.sin(cStep) * nRadius;
            points.push(new BumbleVector(x, y));
            cStep += step;
        }
        points.push(points[0]);
        // create a shape
        const shape = this.__bumble.getShape(points, BumbleColor.fromRGB(255, 255, 255));
        shape.fill = false;
        return shape;
    }

    fireBullet(direction, additionalVelocity, position) {
        const speed = 200;
        const points = [];
        const sections = 10;
        const step = Math.PI * 2.0 / sections;
        let cStep = 0.0;
        const nRadius = 2.0;
        for (let i = 0; i < sections; ++i) {
            const x = Math.cos(cStep) * nRadius;
            const y = Math.sin(cStep) * nRadius;
            points.push(new BumbleVector(x, y));
            cStep += step;
        }
        points.push(points[0]);
        // create a shape
        const shape = this.__bumble.getShape(points, BumbleColor.fromRGB(255, 255, 255));
        shape.fill = false;

        const entity = new Entity();
        entity.addComponent(new CollisionComponent());
        entity.addComponent(new PhysicsComponent());
        entity.addComponent(new ShapeComponent());
        entity.addComponent(new BulletComponent());
        entity.addComponent(new PositionComponent());
        entity.addComponent(new RemoveOffscreenComponent());
        entity.components.physicsComponent.velocity = direction.multiplyValue(speed).add(additionalVelocity);
        entity.components.positionComponent.position = position;
        entity.components.shapeComponent.shape = shape;
        this.__entities.push(entity);
    }

    markEntityForRemoval(entity) {
        entity.active = false;
        this.__entitiesToRemove.push(entity);
    }

    addBlinking(entity) {
        entity.addComponent(new BlinkingComponent());
        this.__bumble.runCoroutine(function *() {
            yield BumbleUtility.wait(1.5);
            if (entity.components.blinkingComponent && this.__entities.includes(entity)) {
                entity.removeComponent(entity.components.blinkingComponent.name);
            }
        }.bind(this));
    }

    resetPlayer() {
        const entity = this.__entities.find(entity => entity.components.playerControlledComponent);
        entity.addComponent(new CollisionComponent());
        entity.addComponent(new PhysicsComponent());
        entity.addComponent(new ShapeComponent());
        entity.addComponent(new RotationComponent());
        entity.addComponent(new PlayerControlledComponent());
        entity.addComponent(new PositionComponent());
        entity.addComponent(new WrapComponent());
        entity.components.physicsComponent.drag = 0.985;
        entity.components.rotationComponent.rotation = BumbleUtility.randomFloat(Math.PI * 2.0);
        // create a shape
        const shapeSize = 10.0;
        const shape = this.__bumble.getShape([
            new BumbleVector(shapeSize * 2, shapeSize * 0.75),
            new BumbleVector(0, shapeSize * 1.5),
            new BumbleVector(0, 0),
            new BumbleVector(shapeSize * 2, shapeSize * 0.75)
        ], BumbleColor.fromRGB(255, 255, 255));
        shape.fill = false;
        entity.components.shapeComponent.shape = shape;
        entity.components.positionComponent.position = new BumbleVector(this.__bumble.width / 2.0, this.__bumble.height / 2.0);
        this.addBlinking(entity);
    }

    __reset() {
        this.__running = true;

        this.__entities = [];
        this.__entitiesToRemove = [];
        for (let i = 0; i < 10; ++i) {
            const entity = new Entity();
            entity.addComponent(new CollisionComponent());
            entity.addComponent(new PhysicsComponent());
            entity.addComponent(new ShapeComponent());
            entity.addComponent(new RotationComponent());
            entity.addComponent(new AsteroidComponent());
            entity.addComponent(new PositionComponent());
            entity.addComponent(new WrapComponent());
            entity.components.physicsComponent.velocity = new BumbleVector(BumbleUtility.randomSign() * (BumbleUtility.randomFloat(20.0) + 10.0), BumbleUtility.randomSign() * (BumbleUtility.randomFloat(20.0) + 10.0));
            entity.components.positionComponent.position = new BumbleVector(BumbleUtility.randomFloat(this.__bumble.width), BumbleUtility.randomFloat(this.__bumble.height));
            entity.components.rotationComponent.rotation = BumbleUtility.randomFloat(Math.PI * 2.0);
            entity.components.shapeComponent.shape = this.buildAsteroid(20, 5, 10);
            this.__entities.push(entity);
        }
        
        const entity = new Entity();
        entity.addComponent(new PlayerControlledComponent());
        this.__entities.push(entity);
        this.resetPlayer();

        const userInputSystem = new UserInputSystem();
        userInputSystem.observable.subscribe(new TimeInterval(0.5, (data) => {
            if (data.key === BumbleKeyCodes.SPACE) {
                this.fireBullet(data.extra.direction, data.extra.additionalVelocity, data.extra.position);
            }
        }).func);
        const removeOffscreenSystem = new RemoveOffscreenSystem();
        removeOffscreenSystem.observable.subscribe((entity) => {
            this.markEntityForRemoval(entity);
        });
        const collisionSystem = new CollisionSystem();
        collisionSystem.observable.subscribe((data) => {
            if (data.collisionObject1.type === 'bullet') {
                this.markEntityForRemoval(data.collisionObject1.entity);
                this.markEntityForRemoval(data.collisionObject2.entity);
            } else if (data.collisionObject1.type === 'player') {
                this.resetPlayer();
            }
        });
        this.systems = [
            userInputSystem,
            new PhysicsSystem(),
            collisionSystem,
            removeOffscreenSystem,
            new AsteroidSystem(),
            new WrapSystem(),
            new BlinkingSystem(),
            new RenderSystem()
        ];
    }

    *init() {
        this.__bumble.runCoroutine(this.update.bind(this));

        // this.__bumble.mouse.addMouseUpEventListener(() => {
        //     this.__bumble.canvas.webkitRequestFullScreen();
        // });

        this.__reset();
    }

    *update() {
        while (this.__running) {
            if (this.__bumble.keys.isDown(BumbleKeyCodes.R)) {
                this.__reset();
            }

            for (let system of this.systems) {
                system.update(this.__entities.filter((entity) => { return entity.active; }), this.__bumble);
            }

            for (let entity of this.__entitiesToRemove) {
                this.__entities.splice(this.__entities.indexOf(entity), 1);
            }
            this.__entitiesToRemove = [];
            yield;
        }
    }

    __drawScore() {
        this.__bumble.context.save();
        this.__bumble.context.fillStyle = BumbleColor.fromRGBA(0, 0, 0, 0.5);
        this.__bumble.context.fillRect(this.__bumble.width - 40, 2, 38, this.__squareSize - 4);
        this.__bumble.context.fillStyle = BumbleColor.fromRGB(255, 255, 255);
        this.__bumble.context.font = "15px Arial";
        this.__bumble.context.textAlign = "center";
        this.__bumble.context.fillText(this.__timeTaken.toString().padStart(3, 0), this.__bumble.width - 19, this.__squareSize - 5, 36);
        this.__bumble.context.restore();
    }
}