class Game {
    constructor() {
        this.__bumble = new Bumble('asteroids', 720, 480, BumbleColor.fromRGB(0, 0, 0), 60);
        this.__bumble.runCoroutine(this.init.bind(this));
        this.__bumble.preloader.loadAll([
            new BumbleResource('bumble', 'img/bumble.png', 'image'),
            new BumbleResource('smoke', 'img/smoke.png', 'image'),
            new BumbleResource('smoke_fire', 'img/smoke_fire.png', 'image'),
            //new BumbleResource('laser', 'audio/julien_matthey_science_fiction_laser_001.mp3', 'audio'),
            new BumbleResource('data', 'data/data.json', 'data')
        ]);
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

    __reset() {
        this.__running = true;

        this.__entities = [];
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
        entity.addComponent(new CollisionComponent());
        entity.addComponent(new PhysicsComponent());
        entity.addComponent(new ShapeComponent());
        entity.addComponent(new RotationComponent());
        entity.addComponent(new PlayerControlledComponent());
        entity.addComponent(new PositionComponent());
        entity.addComponent(new WrapComponent());
        entity.components.positionComponent.position = new BumbleVector(this.__bumble.width / 2.0, this.__bumble.height / 2.0);
        entity.components.physicsComponent.drag = 0.985;
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
        this.__entities.push(entity);

        this.systems = [
            new UserInputSystem(),
            new PhysicsSystem(),
            new AsteroidSystem(),
            new WrapSystem(),
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
            for (let system of this.systems) {
                system.update(this.__entities, this.__bumble);
            }
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