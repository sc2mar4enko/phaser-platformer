import Enemy from "./Enemy";
import initSnakeyAnimations from "../animations/snakeyAmimations";
import Projectiles from "../attacks/Projectiles";

export default class Snakey extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'snakey');
        initSnakeyAnimations(scene.anims);
    }

    init() {
        super.init();
        this.speed = 55;
        
        this.projectiles = new Projectiles(this.scene, 'fireball-1');
        this.timeFromLastAttack = 0;
        this.attackDelay = this.getAttackDelay();
        this.lastDirection = null;

        this.setSize(12, 45);
        this.setOffset(10, 15);
    }

    getAttackDelay() {
        return Phaser.Math.Between(1000, 4000);
    }

    update(time, delta) {
        super.update(time, delta);
        
        if (this.body && this.body.velocity.x > 0)
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
        else
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
        
        if (this.timeFromLastAttack + this.attackDelay <= time) {
            this.projectiles.fireProjectile(this, 'fireball');
            this.timeFromLastAttack = time;
            this.attackDelay = this.getAttackDelay();
        }
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