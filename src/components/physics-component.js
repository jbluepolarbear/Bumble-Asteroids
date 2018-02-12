class PhysicsComponent extends IComponent {
    constructor() {
        super('physicsComponent');
        this.velocity = new BumbleVector();
        this.acceleration = new BumbleVector();
        this.drag = 1.0;
    }
}