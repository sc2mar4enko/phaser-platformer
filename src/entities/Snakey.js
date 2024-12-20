import Enemy from "./Enemy";
import initSnakeyAnimations from "../animations/snakeyAmimations";

export default class Snakey extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'snakey');
        initSnakeyAnimations(scene.anims);
    }

    init() {
        super.init();
        this.speed = 55;

        this.setSize(12, 45);
        this.setOffset(10, 15);
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.active)
            return;
        if (this.isPlayingAnimations('snakey-hurt'))
            return;
        this.play('snakey-walk', true);
    }

    takesHit(source) {
        super.takesHit(source);
        this.play('snakey-hurt', true);
        console.log('hit')
    }
}