const bumble = new Bumble('mine sweeper', 720, 480, 'white', 60);
const gamestate = bumble.gameState;
let timeRun = gamestate.getState('times run');
if (timeRun === null) {
    timeRun = 1;
}
console.log('times run: ' + timeRun.toString());
gamestate.setState('times run', timeRun + 1);

bumble.preloader.loadAll([
    new BumbleResource('bumble', 'img/bumble.png', 'image'),
    new BumbleResource('smoke', 'img/smoke.png', 'image'),
    new BumbleResource('smoke_fire', 'img/smoke_fire.png', 'image'),
    new BumbleResource('bkg', 'img/bkg.png', 'image'),
    new BumbleResource('laser', 'audio/julien_matthey_science_fiction_laser_001.mp3', 'audio'),
    new BumbleResource('data', 'data/data.json', 'data')
]);

let entity = new Entity();

var shape;
bumble.runCoroutine(function *() {
    const bkg = bumble.getImage('bkg');
    const bkgTransform = new BumbleTransformation(bkg.width, bkg.height);
    bkgTransform.anchor = new BumbleVector(0.5, 0.5);
    bkgTransform.position = new BumbleVector(bkg.width / 2, bkg.height / 2);

    const laser = bumble.getAudio('laser');
    
    bumble.runCoroutine(function *() {
        while (true) {
            if (bumble.keys.isDown(BumbleKeyCodes.SPACE)) {
                laser.play();
                yield BumbleUtility.wait(0.75);
            }
            yield;
        }
    });

    const data = bumble.getData('data');
    console.log(data);

    const rootSprite = new BumbleSprite(bumble, bumble.width, bumble.height);
    rootSprite.color = 'red';
    rootSprite.debugDraw = false;
    rootSprite.position = new BumbleVector(bumble.width / 2.0, bumble.height / 2.0);

    bumble.debug.showFramerate = true; 

    // create a shape
    shape = bumble.getShape([
        new BumbleVector(64, 0),
        new BumbleVector(128, 128),
        new BumbleVector(0, 128),
        new BumbleVector(64, 0)
    ], BumbleColor.fromRGB(0, 0, 255));
    const shapeTransform = new BumbleTransformation(shape.width, shape.height);
    shapeTransform.anchor = shape.getAnchorToCenterPoint();
    shapeTransform.position = new BumbleVector(shape.width / 2, shape.height / 2);
    shape.position = new BumbleVector(shape.width, shape.height);
    shape.fill = false;

    let angle = 0;
    while (!bumble.keys.isDown(BumbleKeyCodes.R) && !bumble.mouse.mouseState.buttonState[2]) {
        bumble.clearScreen();

        bumble.applyTransformation(bkgTransform.build());
        bkg.draw();
        bumble.applyTransformation(shapeTransform.build());
        shape.draw();
        rootSprite.draw();
        yield;
    }
});
