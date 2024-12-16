import collidable from "../mixins/collidable";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Mixins
        Object.assign(this, collidable);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 500;
        this.speed = 150;
        this.setOrigin(0.5, 1);
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.setImmovable();
        this.setSize(this.width - 5, this.height - 20);
        this.setOffset(5, 20);
        this.body.setGravityY(this.gravity);
        this.setCollideWorldBounds(true);
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }
    
    update(time, delta) {
        if (Math.floor(time / 100) % 12 >= 6) {
            this.setVelocityX(30);
            this.setFlipX(false);
        }
        else {
            this.setVelocityX(-30);
            this.setFlipX(true);
        }
    }
}