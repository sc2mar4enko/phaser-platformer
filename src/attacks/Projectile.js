export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key)

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.speed = 300;
        this.maxDistance = 200;
        this.travelledDistance = 0;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.travelledDistance += this.body.deltaAbsX();
        if (this.travelledDistance >= this.maxDistance) {
            this.setActive(false);
            this.setVisible(false);
            this.travelledDistance = 0;
        }
    }

    fire(x, y) {
        console.log('FIRE');
        this.setActive(true);
        this.setVisible(true);
        this.body.reset(x, y);
        this.setVelocityX(this.speed);
    }

}