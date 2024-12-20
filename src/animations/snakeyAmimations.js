export default function initSnakeyAnimations(anims) {
    anims.create({
        key: 'snakey-walk',
        frames: anims.generateFrameNumbers('snakey', {start: 0, end: 8}),
        frameRate: 8,
        repeat: -1
    });

    anims.create({
        key: 'snakey-hurt',
        frames: anims.generateFrameNumbers('snakey', {start: 21, end: 22}),
        frameRate: 5,
        repeat: 0
    });
}