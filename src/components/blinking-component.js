class BlinkingComponent extends IComponent {
    constructor() {
        super('blinkingComponent');
        this.currentTime = 0;
        this.resetTime = 0.15;
        this.show = true;
    }
}