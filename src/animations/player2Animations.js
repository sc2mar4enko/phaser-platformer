export default function initPlayer2Animations(anims) {
    anims.create({
        key: 'run',
        frames: anims.generateFrameNames('player2', {start: 24, end: 25}),
        frameRate: 8,
        repeat: -1
    });
    
    anims.create({
        key: 'idle',
        frames: anims.generateFrameNames('player2', {start: 6, end: 11}),
        frameRate: 8,
        repeat: -1
    });
    
    anims.create({
        key: 'jump',
        frames: anims.generateFrameNames('player2', {start: 26, end: 29}),
        frameRate: 2,
        repeat: 1
    });
    
    anims.create({
        key: 'throw',
        frames: anims.generateFrameNames('player2', {start: 42, end: 44}),
        frameRate: 8,
        repeat: 0
    });
    
    anims.create({
        key: 'slide',
        frames: anims.generateFrameNames('player2', {start: 54, end: 56}),
        frameRate: 8,
        repeat: 0
    });
}