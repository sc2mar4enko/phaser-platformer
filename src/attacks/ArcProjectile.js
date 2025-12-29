import EffectManager from "../effects/EffectManager";

export default class ArcProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.cooldown = 1000;
        this.damage = 15;
        this.gravityY = 500;
        this.flightTime = 700;
        this.maxLifetime = 2500;
        this.spawnTime = 0;

        this.body.setSize(this.width - 15, this.height - 15);
        this.body.setAllowGravity(true);

        this.effectManager = new EffectManager(this.scene);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active) {
            return;
        }
        if (this.spawnTime && time - this.spawnTime > this.maxLifetime) {
            this.deactivateProjectile();
        }
    }

    fireArc(x, y, target, anim, config = {}) {
        const gravityY = config.gravityY ?? this.gravityY;
        const flightTime = (config.flightTime ?? this.flightTime) / 1000;
        const targetPoint = target.getCenter ? target.getCenter() : target;
        const dx = targetPoint.x - x;
        const dy = targetPoint.y - y;
        const velocityX = dx / flightTime;
        const velocityY = (dy - 0.5 * gravityY * flightTime * flightTime) / flightTime;

        this.activateProjectile(true);
        this.body.reset(x, y);
        this.spawnTime = this.scene.time.now;
        this.setGravityY(gravityY);
        this.setVelocity(velocityX, velocityY);
        this.setFlipX(velocityX < 0);

        anim && this.play(anim, true);
    }

    deliversHit(target) {
        this.deactivateProjectile();
        const impactPosition = {x: this.x, y: this.y};
        this.body.reset(0, 0);
        this.effectManager.playEffectOn('hit-effect', target, impactPosition);
    }

    activateProjectile(isActive) {
        this.setActive(isActive);
        this.setVisible(isActive);
    }

    deactivateProjectile() {
        this.activateProjectile(false);
        this.body.reset(0, 0);
        this.spawnTime = 0;
    }
}
