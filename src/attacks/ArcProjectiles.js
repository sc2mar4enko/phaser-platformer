import ArcProjectile from "./ArcProjectile";
import {getTimestamp} from "../utils/functions";

export default class ArcProjectiles extends Phaser.Physics.Arcade.Group {
    constructor(scene, key) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 4,
            active: false,
            visible: false,
            key: key,
            classType: ArcProjectile
        });

        this.timeFromLastShot = null;
    }

    fireProjectile(initiator, target, anim, config) {
        const projectile = this.getFirstDead(false);
        if (!projectile) return;
        if (this.timeFromLastShot && this.timeFromLastShot + projectile.cooldown > getTimestamp()) return;

        const center = initiator.getCenter();
        projectile.fireArc(center.x, center.y - 10, target, anim, config);
        this.timeFromLastShot = getTimestamp();
    }
}
