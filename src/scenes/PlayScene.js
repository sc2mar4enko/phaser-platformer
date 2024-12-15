import Phaser from "phaser";
import Player from "../entities/Player";

class PlayScene extends Phaser.Scene {

    constructor() {
        super('PlayScene');
    }

    create() {
        const map = this.createMap();
        const layers = this.createLayers(map);

        const player = this.createPlayer();
        this.createPlayerColliders(player, {
            colliders: {
                platformColliders: layers.platformColliders
            }
        });
    }

    update() {
    }

    createMap() {
        const map = this.make.tilemap({key: 'map'});
        map.addTilesetImage('main_lev_build_1', 'tileset-1');
        return map;
    }

    createLayers(map) {
        const tileset = map.getTileset('main_lev_build_1')
        const platformColliders = map.createStaticLayer('PlatformColliders', tileset);
        const environment = map.createStaticLayer('Environment', tileset);
        const platforms = map.createStaticLayer('Platforms', tileset);
        platformColliders.setCollisionByProperty({collides: true});
        return {environment, platforms, platformColliders};
    }

    createPlayer() {
        return new Player(this, 100, 250);
    }

    createPlayerColliders(player, {colliders}) {
        player.addCollider(colliders.platformColliders);
    }
}

export default PlayScene;