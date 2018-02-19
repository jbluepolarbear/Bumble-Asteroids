import { Bumble, BumbleUtility, BumbleVector, BumbleColor, BumbleKeyCodes, BumblePolygon } from './bumble.js';
import { Entity } from './entity.js';
import { TimeInterval } from './observable/time-Interval.js';

// Components
import { CollisionComponent } from './components/collision-component.js';
import { PhysicsComponent } from './components/physics-component.js';
import { ShapeComponent } from './components/shape-component.js';
import { RotationComponent } from './components/rotation-component.js';
import { AsteroidComponent } from './components/asteroid-component.js';
import { PositionComponent } from './components/position-component.js';
import { WrapComponent } from './components/wrap-component.js';
import { BulletComponent } from './components/bullet-component.js';
import { RemoveOffscreenComponent } from './components/remove-offscreen-component.js';
import { BlinkingComponent } from './components/blinking-component.js';
import { FriendShipComponent } from './components/friend-ship-component.js';
import { PlayerControlledComponent } from './components/player-controlled-component.js';

// System
import { CollisionSystem } from './systems/collision-system.js';
import { PhysicsSystem } from './systems/physics-system.js';
import { WrapSystem } from './systems/wrap-system.js';
import { BlinkingSystem } from './systems/blinking-system.js';
import { FriendShipSystem } from './systems/friend-ship-system.js';
import { RemoveOffscreenSystem } from './systems/remove-offscreen-system.js';
import { AsteroidSystem } from './systems/asteroid-system.js';
import { UserInputSystem } from './systems/user-input-system.js';
import { RenderSystem } from './systems/render-system.js';

const HighScoreKey = 'high score';
export class Game {
    constructor() {
        this.__bumble = new Bumble('asteroids', 720, 480, BumbleColor.fromRGB(0, 0, 0), 60);
        this.__bumble.runCoroutine(this.init.bind(this));
        this.__bumble.debug.showFramerate = true; 
        this.__asteroidSizes = {
            large: 25,
            medium: 15,
            small: 5
        };
        const gamestate = this.__bumble.gameState;
        let highScore = gamestate.getState(HighScoreKey);
        if (highScore === null) {
            highScore = 0;
        }
        gamestate.setState(HighScoreKey, highScore);
    }

    buildAsteroidShape(radius, noise, sections) {
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
        const shape = this.__bumble.getShape(points, BumbleColor.fromRGB(0, 255, 0));
        shape.fill = false;
        return shape;
    }

    buildAsteroid(size, position) {
        const entity = new Entity();
        entity.addComponent(new CollisionComponent());
        entity.addComponent(new PhysicsComponent());
        entity.addComponent(new ShapeComponent());
        entity.addComponent(new RotationComponent());
        entity.addComponent(new AsteroidComponent());
        entity.addComponent(new PositionComponent());
        entity.addComponent(new WrapComponent());
        entity.components.physicsComponent.velocity = new BumbleVector(BumbleUtility.randomSign() * (BumbleUtility.randomFloat(20.0) + 10.0), BumbleUtility.randomSign() * (BumbleUtility.randomFloat(20.0) + 10.0));
        entity.components.positionComponent.position = position ? position : new BumbleVector(BumbleUtility.randomFloat(this.__bumble.width), BumbleUtility.randomFloat(this.__bumble.height));
        entity.components.rotationComponent.rotation = BumbleUtility.randomFloat(Math.PI * 2.0);
        entity.components.shapeComponent.shape = this.buildAsteroidShape(size, size * 0.3, 10);
        entity.components.collisionComponent.collidableType = 'asteroid';
        entity.components.asteroidComponent.size = size;

        return entity;
    }

    splitAsteroid(size, position) {
        let newSize = size;
        if (size === this.__asteroidSizes.large) {
            newSize = this.__asteroidSizes.medium;
        } else if (size === this.__asteroidSizes.medium) {
            newSize = this.__asteroidSizes.small;
        } else if (size === this.__asteroidSizes.small) {
            return;
        }

        const dir = BumbleUtility.randomFloat(Math.PI * 2.0);
        const radius = BumbleUtility.randomFloat(size);
        {
            const newPosition = new BumbleVector(Math.cos(dir), Math.sin(dir)).multiplyValue(radius).add(position);
            const entity = this.buildAsteroid(newSize, newPosition);
            this.__entities.push(entity);
            this.addBlinking(entity);
        }

        {
            const newPosition = new BumbleVector(Math.cos(-dir), Math.sin(-dir)).multiplyValue(radius).add(position);
            const entity = this.buildAsteroid(newSize, newPosition);
            this.__entities.push(entity);
            this.addBlinking(entity);
        }
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
        entity.components.collisionComponent.collidableType = 'bullet';
        entity.components.collisionComponent.collidableTypes.push('asteroid')
        this.__entities.push(entity);
    }

    markEntityForRemoval(entity) {
        entity.active = false;
        this.__entitiesToRemove.push(entity);
    }

    addBlinking(entity) {
        entity.addComponent(new BlinkingComponent());
        let oldCollidable = true;
        if (entity.components.collisionComponent) {
            oldCollidable = entity.components.collisionComponent.collidable;
            entity.components.collisionComponent.collidable = false;
        }
        this.__bumble.runCoroutine(function *() {
            yield BumbleUtility.wait(1.5);
            if (entity.components.blinkingComponent && this.__entities.includes(entity)) {
                entity.removeComponent(entity.components.blinkingComponent.name);
                
                if (entity.components.collisionComponent) {
                    entity.components.collisionComponent.collidable = oldCollidable;
                }
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
        entity.components.collisionComponent.collidableType = 'player';
        entity.components.collisionComponent.collidableTypes.push('asteroid');

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

    resetFriendShip() {
        const entity = this.__entities.find(entity => entity.components.friendShipComponent);
        entity.addComponent(new CollisionComponent());
        entity.addComponent(new PhysicsComponent());
        entity.addComponent(new ShapeComponent());
        entity.addComponent(new RotationComponent());
        entity.addComponent(new FriendShipComponent());
        entity.addComponent(new PositionComponent());
        entity.addComponent(new WrapComponent());
        entity.components.physicsComponent.drag = 0.985;
        entity.components.rotationComponent.rotation = BumbleUtility.randomFloat(Math.PI * 2.0);
        entity.components.collisionComponent.collidableType = 'ship';

        // create a shape
        const shapeSize = 10.0;
        const shape = this.__bumble.getShape([
            new BumbleVector(shapeSize * 2, shapeSize * 0.75),
            new BumbleVector(0, shapeSize * 1.5),
            new BumbleVector(0, 0),
            new BumbleVector(shapeSize * 2, shapeSize * 0.75)
        ], BumbleColor.fromRGB(0, 0, 255));
        shape.fill = false;
        entity.components.shapeComponent.shape = shape;
        entity.components.positionComponent.position = new BumbleVector(BumbleUtility.randomFloat(this.__bumble.width), BumbleUtility.randomFloat(this.__bumble.height));
        this.addBlinking(entity);
    }

    __bonusMuliplier() {
        const timeDiffBonus = 60.0 * 1000;
        const timeDiff = Date.now() - this.__startTime;
        const percentage = Math.max(0, (timeDiffBonus - timeDiff) / timeDiffBonus);
        return 1.0 + percentage * 2.0;
    }

    __reset() {
        this.__score = 0;
        this.__running = true;
        this.__startTime = Date.now();
        this.__lives = 3;
        this.__ended = false;

        this.__entities = [];
        this.__entitiesToRemove = [];
        for (let i = 0; i < 10; ++i) {
            this.__entities.push(this.buildAsteroid(this.__asteroidSizes.large));
        }
        
        const entity = new Entity();
        entity.addComponent(new PlayerControlledComponent());
        this.__entities.push(entity);
        this.resetPlayer();
        
        const friendEntity = new Entity();
        friendEntity.addComponent(new FriendShipComponent());
        this.__entities.push(friendEntity);
        this.resetFriendShip();

        const userInputSystem = new UserInputSystem();
        userInputSystem.observable.subscribe(new TimeInterval(0.5, (data) => {
            if (data.key === BumbleKeyCodes.SPACE) {
                this.fireBullet(data.extra.direction, data.extra.additionalVelocity, data.extra.position);
            }
        }).func);
        const friendShipSystem = new FriendShipSystem();
        friendShipSystem.observable.subscribe(new TimeInterval(0.5, (data) => {
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
                if (data.collisionObject2.type === 'asteroid') {
                    const size = data.collisionObject2.entity.components.asteroidComponent.size;
                    
                    if (size === this.__asteroidSizes.large) {
                        this.__score += Math.floor(1000 * this.__bonusMuliplier());
                    } else if (size === this.__asteroidSizes.medium) {
                        this.__score += Math.floor(5000 * this.__bonusMuliplier());
                    } else if (size === this.__asteroidSizes.small) {
                        this.__score += Math.floor(25000 * this.__bonusMuliplier());
                    }
                    if (this.__score > this.__bumble.gameState.getState(HighScoreKey)) {
                        this.__bumble.gameState.setState(HighScoreKey, this.__score);
                    }

                    this.splitAsteroid(
                        size,
                        data.collisionObject2.entity.components.positionComponent.position
                    );
                }
            } else if (data.collisionObject1.type === 'player') {
                this.resetPlayer();
                this.__lives -= 1;
                if (this.__lives < 0) {
                    this.__ended = true;
                    this.__lives = -1;
                }
            }
        });
        this.systems = [
            userInputSystem,
            friendShipSystem,
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
                if (this.__ended) {
                    if (system instanceof RenderSystem) {
                        system.update(this.__entities.filter((entity) => { return entity.active; }), this.__bumble);
                    }
                } else {
                    system.update(this.__entities.filter((entity) => { return entity.active; }), this.__bumble);
                }
            }
            this.__drawScore();
            this.__drawHighScore();
            this.__drawLives();

            if (this.__ended) {
                if (this.__lives < 0) {
                    this.__drawLose();
                } else {
                    this.__drawWon();
                }
            }

            for (let entity of this.__entitiesToRemove) {
                this.__entities.splice(this.__entities.indexOf(entity), 1);
            }
            this.__entitiesToRemove = [];
            if (!this.__entities.find((entity) => entity.components.asteroidComponent)) {
                this.__ended = true;
            }
            yield;
        }
    }
    
    __drawLives() {
        const size = this.__bumble.width / 3.0;
        this.__bumble.context.setTransform(1, 0, 0, 1, 0, 0);
        this.__bumble.context.globalAlpha = 1.0;
        this.__bumble.context.fillStyle = BumbleColor.fromRGBA(0, 0, 0, 0.25);
        this.__bumble.context.fillRect(0, 0, size, 50);
        this.__bumble.context.fillStyle = BumbleColor.fromRGB(255, 255, 255);
        this.__bumble.context.font = "20px Arial";
        this.__bumble.context.textAlign = "center";
        this.__bumble.context.fillText(`LIVES: ${Math.max(0, this.__lives).toString().padStart(1, 0)}`, size / 4.0, 25, size);
    }

    __drawScore() {
        const size = this.__bumble.width / 3.0;
        this.__bumble.context.setTransform(1, 0, 0, 1, 0, 0);
        this.__bumble.context.globalAlpha = 1.0;
        this.__bumble.context.fillStyle = BumbleColor.fromRGBA(0, 0, 0, 0.25);
        this.__bumble.context.fillRect(this.__bumble.width / 2.0 - size / 2.0, 0, size, 50);
        this.__bumble.context.fillStyle = BumbleColor.fromRGB(255, 255, 255);
        this.__bumble.context.font = "20px Arial";
        this.__bumble.context.textAlign = "center";
        this.__bumble.context.fillText(`SCORE: ${this.__score.toString().padStart(7, 0)}`, this.__bumble.width / 2.0, 25, size);
    }

    __drawHighScore() {
        const size = this.__bumble.width / 3.0;
        this.__bumble.context.setTransform(1, 0, 0, 1, 0, 0);
        this.__bumble.context.globalAlpha = 1.0;
        this.__bumble.context.fillStyle = BumbleColor.fromRGBA(0, 0, 0, 0.25);
        this.__bumble.context.fillRect(this.__bumble.width - size, 0, size, 50);
        this.__bumble.context.fillStyle = BumbleColor.fromRGB(255, 255, 255);
        this.__bumble.context.font = "20px Arial";
        this.__bumble.context.textAlign = "center";
        this.__bumble.context.fillText(`HIGH SCORE: ${this.__bumble.gameState.getState(HighScoreKey).toString().padStart(7, 0)}`, this.__bumble.width - size / 2.0, 25, this.__bumble.width / 3.0);
    }

    __drawLose() {
        this.__bumble.context.setTransform(1, 0, 0, 1, 0, 0);
        this.__bumble.context.fillStyle = BumbleColor.fromRGBA(0, 255, 0, 0.25);
        this.__bumble.context.fillRect(this.__bumble.width * 0.15, this.__bumble.height * 0.15, this.__bumble.width * 0.7, this.__bumble.height * 0.7);
        this.__bumble.context.fillStyle = BumbleColor.fromRGB(255, 255, 255);
        this.__bumble.context.font = "60px Arial";
        this.__bumble.context.textAlign = "center";
        this.__bumble.context.fillText('Game Over', this.__bumble.width / 2.0, this.__bumble.height / 2.0 - 35, this.__bumble.width * 0.85);
        this.__bumble.context.fillText('(R) to restart', this.__bumble.width / 2.0, this.__bumble.height / 2.0 + 65, this.__bumble.width * 0.85);
    }

    __drawWon() {
        this.__bumble.context.setTransform(1, 0, 0, 1, 0, 0);
        this.__bumble.context.fillStyle = BumbleColor.fromRGBA(0, 255, 0, 0.25);
        this.__bumble.context.fillRect(this.__bumble.width * 0.15, this.__bumble.height * 0.15, this.__bumble.width * 0.7, this.__bumble.height * 0.7);
        this.__bumble.context.fillStyle = BumbleColor.fromRGB(255, 255, 255);
        this.__bumble.context.font = "60px Arial";
        this.__bumble.context.textAlign = "center";
        this.__bumble.context.fillText('Game Won', this.__bumble.width / 2.0, this.__bumble.height / 2.0 - 35, this.__bumble.width * 0.85);
        this.__bumble.context.fillText('(R) to restart', this.__bumble.width / 2.0, this.__bumble.height / 2.0 + 65, this.__bumble.width * 0.85);
    }
}