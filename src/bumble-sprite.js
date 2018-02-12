class BumbleSprite {
    constructor(bumble, width, height) {
        this.__bumble = bumble;
        this.__transformation = new BumbleTransformation(width, height);
        this.__children = [];
        this.__parent = null;
        this.__debugDraw = false;
        this.__color = BumbleColor.fromRGB(255, 255, 255);
        this.__opacity = 1.0;
        this.__cachedTransformation = null;
        this.__dirty = true;
    }

    setDirty() {
        this.__dirty = true;
        for (let child of this.__children) {
            child.setDirty();
        }
    }

    get width() {
        return this.__transformation.width;
    }

    get height() {
        return this.__transformation.height;
    }
    
    setSize(width, height) {
        this.__transformation.width = width;
        this.__transformation.height = height;
        this.setDirty();
    }

    get debugDraw() { return this.__debugDraw; }
    set debugDraw(value) {
        this.__debugDraw = value;
    }

    get color() { return this.__color; }
    set color(value) {
        this.__color = value;
    }

    get opacity() { return this.__opacity; }
    set opacity(value) {
        this.__opacity = value;
        this.setDirty();
    }

    get transformation() { return this.__transformation; }
    set transformation(value) {
        this.__transformation = value;
        this.setDirty();
    }

    get rotation() { return this.__transformation.rotation; }
    set rotation(value) {
        this.__transformation.rotation = value;
        this.setDirty();
    }
    
    get position() { return this.__transformation.position; }
    set position(value) {
        this.__transformation.position = value;
        this.setDirty();
    }
    
    get anchor() { return this.__transformation.anchor; }
    set anchor(value) {
        this.__transformation.anchor = value;
        this.setDirty();
    }
    
    get scale() { return this.__transformation.scale; }
    set scale(value) {
        this.__transformation.scale = value;
        this.setDirty();
    }

    get parent() { return this.__parent; }
    set parent(value) {
        this.__parent = value;
        this.setDirty();
    }

    addChild(sprite) {
        this.__children.push(sprite);
        sprite.parent = this;
    }

    removeChild(sprite) {
        for (let i = 0; i < this.__children.length; ++i) {
            if (this.__children[i] == sprite) {
                this.__children.splice(i, 1);
                sprite.parent = null;
                break;
            }
        }
    }

    draw(parentAlpha = 1.0) {
        if (this.__debugDraw) {
            this.__bumble.applyTransformation(this.getTransform());
            this.__bumble.context.globalAlpha = parentAlpha * this.__opacity;
            this.__bumble.context.fillStyle = this.__color;
            this.__bumble.context.fillRect(0, 0, this.__transformation.width, this.__transformation.height);
        }
        const trans = this.getTransform();
        const alpha = parentAlpha * this.__opacity
        for (let child of this.__children) {
            child.draw(alpha);
        }
    }

    getTransform() {
        if (this.__dirty) {
            let trans = this.__transformation.build();
            let parent = this.__parent;
            while (parent !== null) {
                trans = parent.getTransform().multiply(trans);
                parent = parent.parent;
            }
            this.__cachedTransformation = trans;
            this.__dirty = false;
        }
        return this.__cachedTransformation;
    }

    get aabb() {
        const trans = this.getTransform();

        const points = [];
        const startPoint = new BumbleVector(0, 0).multiplyMatrix(trans);
        points.push(new BumbleVector(this.__transformation.width, 0).multiplyMatrix(trans));
        points.push(new BumbleVector(0, this.__transformation.height).multiplyMatrix(trans));
        points.push(new BumbleVector(this.__transformation.width, this.__transformation.height).multiplyMatrix(trans));

        const aabb = new BumbleRect(startPoint.x, startPoint.x, startPoint.y, startPoint.y);
        
        for (let point of points) {
            if (point.x < aabb.left) {
                aabb.left = point.x;
            }
            if (point.x > aabb.right) {
                aabb.right = point.x;
            }
            if (point.y < aabb.top) {
                aabb.top = point.y;
            }
            if (point.y > aabb.bottom) {
                aabb.bottom = point.y;
            }
        }

        return aabb;
    }

    get obb() {
        const trans = this.getTransform();

        const leftTop = new BumbleVector(0, 0).multiplyMatrix(trans);
        const rightTop = new BumbleVector(this.__transformation.width, 0).multiplyMatrix(trans);
        const leftBottom = new BumbleVector(0, this.__transformation.height).multiplyMatrix(trans);
        const rightBottom = new BumbleVector(this.__transformation.width, this.__transformation.height).multiplyMatrix(trans);

        const obb = new BumbleOrientedRect(leftTop, rightTop, rightBottom, leftBottom);
        return obb;
    }
}

class BumbleImageSprite extends BumbleSprite {
    constructor(bumble, image) {
        super(bumble, image.image.width, image.image.height);
        this.__image = image;
        this.__transformation.anchor = new BumbleVector(0.5, 0.5);
    }

    setSize(width, height) {
        this.transformation.scale = new BumbleVector(width / this.width, height / this.height);
    }

    draw(parentAlpha = 1.0) {
        this.__bumble.context.globalAlpha = parentAlpha * this.__opacity;
        this.__bumble.applyTransformation(this.getTransform());
        this.__image.draw();
    }
}

class BumbleParticle extends BumbleImageSprite {
    constructor(bumble, width, height, image) {
        super(bumble, image);
        this.__bumble = bumble;
        this.__image = image;
        this.__image.anchor = new BumbleVector(0, 0);
        super.setSize(width, height);
        this.__alive = false;
    }

    draw(parentTransform = null, parentAlpha = 1.0) {
        this.__bumble.context.globalAlpha = parentAlpha * this.__opacity;
        this.__bumble.applyTransformation(this.getTransform());
        this.__image.draw();
    }

    get alive() { return this.__alive; }
    set alive(value) {
        this.__alive = value;
    }
}

class BumbleParticleEmitter extends BumbleSprite {
    constructor(bumble, life, rate, emitterFunc, particleCreater, particleNumber = 100) {
        super(bumble, 1, 1);
        this.__life = life;
        this.__rate = rate;
        this.__emitterFunc = emitterFunc;
        this.__particleCreater = particleCreater;
        this.__particleNumber = particleNumber;
        this.__currentLife = 0;
        this.__particles = [];
        for (let i = 0; i < particleNumber; ++i) {
            const particle = particleCreater();
            this.addChild(particle);
            this.__particles.push(particle);
        }
        this.__currentNumber = 0;
        this.__startTime = 0;
        this.__started = false;
        this.__transformation.width = 20;
        this.__transformation.height = 20;
    }

    start() {
        if (this.__started) {
            return;
        }

        this.__bumble.runCoroutine(function *() {
            while (this.__bumble.gameTime - this.__startTime < this.__life) {
                this.emit();
                yield BumbleUtility.wait(this.__rate);
            }
        }.bind(this));

        this.__startTime = this.__bumble.gameTime;
    }

    __getNextParticle() {
        if (this.__currentNumber === this.__particleNumber) {
            return null;
        }
        this.__currentNumber += 1;
        const particle = this.__particles[this.__currentNumber - 1];
        particle.opacity = 1.0;
        particle.rotation = 0;
        particle.position = new BumbleVector();
        particle.alive = true;
        return particle;
    }

    emit() {
        this.__emitterFunc(this.__getNextParticle.bind(this));
    }

    draw(parentAlpha = 1.0) {
        const trans = this.getTransform();
        const opacity = parentAlpha * this.__opacity;
        for (let i = 0; i < this.__currentNumber;) {
            if (this.__particles[i].alive) {
                this.__particles[i].draw(opacity);
                ++i;
            } else {
                const temp = this.__particles[this.__currentNumber - 1];
                this.__particles[this.__currentNumber - 1] = this.__particles[i];
                this.__particles[i] = temp;
                this.__currentNumber -= 1;
            }
        }
    }

    get aabb() {
        const rects = [];

        const aabb = super.aabb;

        if (this.__currentNumber === 0) {
            return aabb;
        }

        for (let i = 0; i < this.__currentNumber; ++i) {
            const particleAABB = this.__particles[i].aabb;
            if (particleAABB.left < aabb.left) {
                aabb.left = particleAABB.left;
            }
            if (particleAABB.right > aabb.right) {
                aabb.right = particleAABB.right;
            }
            if (particleAABB.top < aabb.top) {
                aabb.top = particleAABB.top;
            }
            if (particleAABB.bottom > aabb.bottom) {
                aabb.bottom = particleAABB.bottom;
            }
        }

        return aabb;
    }
}