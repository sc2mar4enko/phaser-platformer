import collidable from "../mixins/collidable";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.config = scene.config;

        // Mixins
        Object.assign(this, collidable);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 500;
        this.speed = 75;
        this.timeFromLastTurn = 0;
        this.maxPatrolDistance = 350;
        this.currentPatrolDistance = 0;

        this.platformCollidersLayer = null;
        this.rayGraphics = this.scene.add.graphics({lineStyle: {width: 2, color: 0xaa00aa, alpha: 1}});

        this.setOrigin(0.5, 1);
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.setImmovable();
        this.setSize(this.width - 5, this.height - 20);
        this.setOffset(5, 20);
        this.body.setGravityY(this.gravity);
        this.setCollideWorldBounds(true);
        this.setVelocityX(this.speed);
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update(time, delta) {
        this.patrol(time, delta)
    }

    patrol(time, delta) {
        if (!this.body || !this.body.onFloor())
            return;

        this.currentPatrolDistance += Math.abs(this.body.deltaX());
        const {ray, hasHit} = this.raycast(this.body, this.platformCollidersLayer, {
            rayLength: 30,
            precision: 3,
            steepness: 0.5
        });

        if ((!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) && this.timeFromLastTurn + 100 < time) {
            this.setFlipX(!this.flipX);
            this.setVelocityX(this.speed = -this.speed);
            this.timeFromLastTurn = time;
            this.currentPatrolDistance = 0;
        }
        
        if (this.config.debug) {
            this.rayGraphics.clear();
            this.rayGraphics.strokeLineShape(ray);
        }
    }

    setPlatformColliders(platformCollidersLayer) {
        this.platformCollidersLayer = platformCollidersLayer;
    }
}