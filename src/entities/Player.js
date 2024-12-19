import initAnimations from "../animations/playerAnimations";
import collidable from "../mixins/collidable";
import Healthbar from "../hud/Healthbar";
import Projectile from "../attacks/Projectile";
import Projectiles from "../attacks/Projectiles";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Mixins
        Object.assign(this, collidable);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 500;
        this.playerSpeed = 150;
        this.jumpCount = 0;
        this.consecutiveJumps = 1;
        this.hasBeenHit = false;
        this.bounceVelocity = 250;
        this.setOrigin(0.5, 1);
        this.body.setSize(this.width - 8, this.height - 2);
        this.body.setOffset(6, 2);
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        this.projectiles = new Projectiles(this.scene);
        
        this.health = 100;
        this.hp = new Healthbar(this.scene, this.scene.config.leftTopCorner.x + 5, this.scene.config.leftTopCorner.y + 5, this.health, 1.5);
        
        this.body.setGravityY(this.gravity);
        this.setCollideWorldBounds(true);
        initAnimations(this.scene.anims);
        
        this.scene.input.keyboard.on('keydown-Q', () => {
            this.projectiles.fireProjectile(this);
        })
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update() {
        if (this.hasBeenHit) return;
        const {left, right, space, up} = this.cursors;
        const isJumpButtonJustDown = Phaser.Input.Keyboard.JustDown(space) || Phaser.Input.Keyboard.JustDown(up);
        const onFloor = this.body.onFloor();

        if (left.isDown) {
            this.setVelocityX(-this.playerSpeed);
            this.setFlipX(true);
        } else if (right.isDown) {
            this.setVelocityX(this.playerSpeed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        if (isJumpButtonJustDown && (onFloor || this.jumpCount < this.consecutiveJumps)) {
            this.jumpCount++;
            this.setVelocityY(-this.playerSpeed * 2);
        }

        if (onFloor)
            this.jumpCount = 0;

        onFloor ?
            this.body.velocity.x !== 0 ? this.play('run', true) : this.play('idle', true)
            : this.play('jump', true);
    }

    playDamageTween() {
        return this.scene.tweens.add({
            targets: this,
            duration: 100,
            repeat: -1,
            tint: 0xffffff
        })
    }

    bounceOff() {
        this.body.touching.right ?
            this.setVelocity(-this.bounceVelocity, -this.bounceVelocity) :
            this.setVelocity(this.bounceVelocity, -this.bounceVelocity);

        setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
    }

    takesHit(initiator) {
        if (this.hasBeenHit) {
            return;
        }
        this.hasBeenHit = true;
        this.bounceOff();
        const hitAnimation = this.playDamageTween();

        this.health -= initiator.damage;
        this.hp.decrease(this.health);

        this.scene.time.delayedCall(1000, () => {
            this.hasBeenHit = false;
            hitAnimation.stop();
            this.clearTint();
        });

        // this.scene.time.addEvent({
        //     delay: 1000,
        //     callback: () => {
        //         this.hasBeenHit = false;
        //     },
        //     loop: false
        // })
    }
}