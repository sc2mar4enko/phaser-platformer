import Enemy from "./Enemy";
import initBirdmanAnimations from "../animations/birdmanAnimations";
export default class Birdman extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'birdman');
        initBirdmanAnimations(scene.anims);
    }

    update(time, delta) {
        super.update(time, delta);
        this.play('birdman-idle', true);
    }
}