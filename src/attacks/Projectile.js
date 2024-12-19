import EffectManager from "../effects/EffectManager";

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key)

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.speed = 300;
        this.maxDistance = 200;
        this.travelledDistance = 0;
        this.cooldown = 500;
        this.damage = 10;
        
        this.body.setSize(this.width - 15, this.height - 15);

        this.effectManager = new EffectManager(this.scene);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.travelledDistance += this.body.deltaAbsX();
        if (this.isOutOfRange()) {
            this.body.reset(0, 0);
            this.activateProjectile(false);
            this.travelledDistance = 0;
        }
    }

    fire(x, y) {
        console.log('FIRE');
        this.activateProjectile(true);
        this.body.reset(x, y);
        this.setVelocityX(this.speed);
    }

    deliversHit(target) {
        this.activateProjectile(false);
        this.travelledDistance = 0;
        const impactPosition = {x: this.x, y: this.y};
        this.body.reset(0, 0);
        this.effectManager.playEffectOn('hit-effect', target, impactPosition);
    }

    activateProjectile(isActive) {
        this.setActive(isActive);
        this.setVisible(isActive);
    }

    isOutOfRange() {
        return this.travelledDistance && this.travelledDistance >= this.maxDistance;
    }

}