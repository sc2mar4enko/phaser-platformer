import Enemy from "./Enemy";
import initBirdmanAnimations from "../animations/birdmanAnimations";
export default class Birdman extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'birdman');
        initBirdmanAnimations(scene.anims);
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.active)
            return;
        if (this.isPlayingAnimations('birdman-hurt')) 
            return;
        this.play('birdman-idle', true);
    }
    
    takesHit(source) {
        super.takesHit(source);
        this.play('birdman-hurt', true);
        console.log('hit')
    }
}