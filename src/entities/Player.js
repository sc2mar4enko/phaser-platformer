import initPlayerAnimations from "../animations/playerAnimations";
import collidable from "../mixins/collidable";
import Healthbar from "../hud/Healthbar";
import Projectiles from "../attacks/Projectiles";
import animations from "../mixins/animations";
import MeleeWeapon from "../attacks/MeleeWeapon";
import {getTimestamp} from "../utils/functions";
import EventEmitter from '../events/Emitter';
import initPlayer2Animations from "../animations/player2Animations";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Mixins
        Object.assign(this, collidable);
        Object.assign(this, animations);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 500;
        this.playerSpeed = 150;
        this.jumpCount = 0;
        this.consecutiveJumps = 1;
        this.hasBeenHit = false;
        this.isInvincible = false;
        this.invincibleUntil = 0;
        this.blinkUntil = 0;
        this.blinkInterval = 100;
        this.hitRecoveryUntil = 0;
        this.hitAnimation = null;
        this.isSliding = false;
        this.bounceVelocity = 250;
        this.setOrigin(0.5, 1);

        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;

        this.projectiles = new Projectiles(this.scene, 'iceball-1');
        this.meleeWeapon = new MeleeWeapon(this.scene, 0, 0, 'sword-default');
        this.timeFromLastSwing = null;

        this.maxHealth = 150;
        this.health = this.maxHealth;
        this.hp = new Healthbar(this.scene, this.scene.config.leftTopCorner.x + 5, this.scene.config.leftTopCorner.y + 5, this.health, 1.5);

        this.body.setGravityY(this.gravity);
        this.setCollideWorldBounds(true);
        if (localStorage.getItem('skin') === "2") {
            this.removeAllAnims();
            initPlayer2Animations(this.scene.anims);
            this.body.setSize(this.width - 16, this.height - 16);
            this.setScale(1.5);
            this.body.setOffset(8, 4);
        }
        else {
            this.removeAllAnims();
            initPlayerAnimations(this.scene.anims);
            this.setScale(1);
            this.body.setSize(this.width - 8, this.height - 2);
            this.body.setOffset(6, 2);
        }
        this.handleAttacks();
        this.handleMovements();
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.once(Phaser.GameObjects.Events.DESTROY, () => {
            if (this.hitAnimation) {
                this.hitAnimation.stop();
                this.hitAnimation = null;
            }
        });
    }

    update() {
        this.updateDamageState();
        if (this.hasBeenHit || this.isSliding || !this.body) return;
        if (this.getBounds().top > this.scene.config.height) {
            EventEmitter.emit('PLAYER_LOSS');
            return;
        }
        const {left, right, space, up, down} = this.cursors;
        const isJumpButtonJustDown = Phaser.Input.Keyboard.JustDown(space) || Phaser.Input.Keyboard.JustDown(up);
        const onFloor = this.body.onFloor();

        if (left.isDown) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
            this.setVelocityX(-this.playerSpeed);
            this.setFlipX(true);
        } else if (right.isDown) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
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

        if (down.isDown) {
            this.play('slide', true);
        }

        if (this.isPlayingAnimations('throw') || this.isPlayingAnimations('slide'))
            return;

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

    bounceOff(source) {
        if (source.body) {
            this.body.touching.right ?
                this.setVelocityX(-this.bounceVelocity) :
                this.setVelocityX(this.bounceVelocity);
        } else {
            this.body.blocked.right ?
                this.setVelocityX(-this.bounceVelocity) :
                this.setVelocityX(this.bounceVelocity);
        }

        setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
    }

    takesHit(source) {
        if (this.hasBeenHit || this.isInvincible) {
            return;
        }
        this.health -= source.damage || source.properties.damage || 0;
        if (this.health <= 0) {
            EventEmitter.emit('PLAYER_LOSS');
            return;
        }
        
        this.hasBeenHit = true;
        this.bounceOff(source);
        this.hitAnimation = this.playDamageTween();
        
        this.hp.decrease(this.health);
        source.deliversHit && source.deliversHit(this);
        this.startInvincibility();
    }

    startInvincibility() {
        this.isInvincible = true;
        const now = this.scene.time.now;
        this.invincibleUntil = now + 800;
        this.blinkUntil = now + this.blinkInterval;
        this.hitRecoveryUntil = now + 1000;
    }

    endInvincibility() {
        this.isInvincible = false;
        this.alpha = 1;
        this.invincibleUntil = 0;
        this.blinkUntil = 0;
    }

    updateDamageState() {
        const now = this.scene.time.now;
        if (this.isInvincible) {
            if (now >= this.invincibleUntil) {
                this.endInvincibility();
            } else if (now >= this.blinkUntil) {
                this.alpha = this.alpha === 1 ? 0.4 : 1;
                this.blinkUntil = now + this.blinkInterval;
            }
        }
        if (this.hasBeenHit && now >= this.hitRecoveryUntil) {
            this.hasBeenHit = false;
            if (this.hitAnimation) {
                this.hitAnimation.stop();
                this.hitAnimation = null;
            }
            this.clearTint();
        }
    }

    handleAttacks() {
        this.scene.input.keyboard.on('keydown-Q', () => {
            this.play('throw', true);
            this.projectiles.fireProjectile(this, 'iceball');
        });

        this.scene.input.keyboard.on('keydown-E', () => {
            if (this.timeFromLastSwing && this.timeFromLastSwing + this.meleeWeapon.attackSpeed > getTimestamp()) return;
            this.play('throw', true);
            this.meleeWeapon.attack(this);
            this.timeFromLastSwing = getTimestamp();
        });
    }

    handleMovements() {
        this.scene.input.keyboard.on('keydown-DOWN', () => {
            this.body.setSize(this.width, this.height / 2);
            this.setOffset(0, this.height / 2);
            this.setVelocityX(0)
            this.play('slide', true);
            this.isSliding = true;
        });

        this.scene.input.keyboard.on('keyup-DOWN', () => {
            this.body.setSize(this.width, 38);
            this.setOffset(0, 0);
            this.isSliding = false;
        });
    }

    removeAllAnims() {
        this.scene.anims.remove('run');
        this.scene.anims.remove('idle');
        this.scene.anims.remove('jump');
        this.scene.anims.remove('throw');
        this.scene.anims.remove('slide');
    }
}
