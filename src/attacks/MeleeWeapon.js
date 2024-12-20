import EffectManager from "../effects/EffectManager";

export default class MeleeWeapon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, weaponName) {
        super(scene, x, y, weaponName);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = 15;
        this.attackSpeed = 1000;
        this.weaponName = weaponName;
        this.weaponAnimation = weaponName + '-swing';
        this.attacker = null;

        this.effectManager = new EffectManager(this.scene);

        this.setOrigin(0.5, 1);
        this.setDepth(10);

        this.activateWeapon(false);

        this.on('animationcomplete', animation => {
            if (animation.key === this.weaponAnimation) {
                this.activateWeapon(false);
                this.body.reset(0, 0);
                this.body.checkCollision.none = false;
            }
        })
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active) return;

        if (this.attacker.lastDirection === Phaser.Physics.Arcade.FACING_RIGHT) {
            this.setFlipX(false);
            this.body.reset(this.attacker.x + 15, this.attacker.y);
        } else {
            this.setFlipX(true);
            this.body.reset(this.attacker.x - 15, this.attacker.y);
        }
    }

    attack(attacker) {
        this.attacker = attacker;
        this.activateWeapon(true);
        this.anims.play(this.weaponAnimation, true);
    }

    deliversHit(target) {
        const impactPosition = {x: this.x, y: this.getRightCenter().y};
        this.effectManager.playEffectOn('hit-effect', target, impactPosition);
        this.body.checkCollision.none = true;
    }

    activateWeapon(isActive) {
        this.setActive(isActive);
        this.setVisible(isActive);
    }
}