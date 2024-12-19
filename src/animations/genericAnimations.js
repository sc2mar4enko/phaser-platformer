export default function initGenericAnimations(anims) {
    anims.create({
        key: 'hit-effect',
        frames: anims.generateFrameNumbers('hit-sheet', {start: 0, end: 4}),
        frameRate: 16,
        repeat: 0
    })
}