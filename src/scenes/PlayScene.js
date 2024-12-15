import Phaser from "phaser";
import Player from "../entities/Player";

class PlayScene extends Phaser.Scene {

    constructor(config) {
        super('PlayScene');
        this.config = config;
    }

    create() {
        const map = this.createMap();
        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);
        const player = this.createPlayer(playerZones);
        this.createPlayerColliders(player, {
            colliders: {
                platformColliders: layers.platformColliders
            }
        });
        this.createEndOfLevel(playerZones, player);
        this.setupFollowupCameraOn(player);
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
        const playerZones = map.getObjectLayer('PlayerZones');

        platformColliders.setCollisionByProperty({collides: true});
        return {environment, platforms, platformColliders, playerZones};
    }

    createPlayer(playerZones) {
        return new Player(this, playerZones.start.x, playerZones.start.y);
    }

    createPlayerColliders(player, {colliders}) {
        player.addCollider(colliders.platformColliders);
    }

    setupFollowupCameraOn(player) {
        const {height, width, mapOffset, zoomFactor} = this.config;
        this.physics.world.setBounds(0, 0, width + mapOffset, height + 100);
        this.cameras.main.setBounds(0, 0, width + mapOffset, height)
            .setZoom(zoomFactor);
        this.cameras.main.startFollow(player);
    }

    getPlayerZones(playerZonesLayer) {
        const playerZones = playerZonesLayer.objects;
        return {
            start: playerZones.find(zone => zone.name === 'startZone'),
            end: playerZones.find(zone => zone.name === 'endZone'),
            rofl: playerZones.find(zone => zone.name === 'Pasxalka')
        }
    }

    createEndOfLevel(playerZones, player) {
        const endOfLevel = this.physics.add.sprite(playerZones.end.x, playerZones.end.y, 'end')
            .setSize(5, 200)
            .setAlpha(0)
            .setOrigin(0.5 ,1);
        
        const endOfLevelOverlap = this.physics.add.overlap(player, endOfLevel, () => {
            endOfLevelOverlap.active = false;
            this.add.text(player.body.x + 50, player.body.y - 15, playerZones.rofl.text.text);
        })
    }
}

export default PlayScene;