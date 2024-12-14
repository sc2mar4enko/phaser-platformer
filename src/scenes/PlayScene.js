import Phaser from "phaser";

class PlayScene extends Phaser.Scene {
    
    constructor() {
        super('PlayScene');
    }
    
    create() {
        const map = this.createMap();
        const layers = this.createLayers(map);
        const player = this.createPlayer();
        this.physics.add.collider(player, layers.platformColliders);
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
        const player = this.physics.add.sprite(100, 250, 'player').setOrigin(1, 0);
        player.body.setGravityY(500);
        player.setCollideWorldBounds(true);
        return player;
    }
}

export default PlayScene;