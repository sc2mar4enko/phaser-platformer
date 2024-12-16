import Phaser from "phaser";
import Player from "../entities/Player";
import Birdman from "../entities/Birdman";
import {getEnemyTypes} from "../types/types";
import Enemies from "../groups/Enemies";

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
        const enemies = this.createEnemies(layers.enemySpawns);
        this.createPlayerColliders(player, {
            colliders: {
                platformColliders: layers.platformColliders
            }
        });
        this.createEnemyColliders(enemies, {
            colliders: {
                platformColliders: layers.platformColliders,
                player
            }
        });
        this.createEndOfLevel(playerZones, player);
        this.setupFollowupCameraOn(player);

        this.plotting = false;
        this.graphics = this.add.graphics();
        this.line = new Phaser.Geom.Line();
        this.graphics.lineStyle(5, 0x00ff00);
        this.input.on('pointerdown', this.startDrawing, this);
        this.input.on('pointerup', pointer => this.finishDrawing(pointer, layers.platforms), this);
    }

    update() {
        if (this.plotting) {
            const pointer = this.input.activePointer;
            this.line.x2 = pointer.worldX;
            this.line.y2 = pointer.worldY;

            this.graphics.clear();
            this.graphics.strokeLineShape(this.line);
        }
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
        const enemySpawns = map.getObjectLayer('EnemySpawns');

        platformColliders.setCollisionByProperty({collides: true});
        return {environment, platforms, platformColliders, playerZones, enemySpawns};
    }

    createPlayer(playerZones) {
        return new Player(this, playerZones.start.x, playerZones.start.y);
    }

    createPlayerColliders(player, {colliders}) {
        player.addCollider(colliders.platformColliders);
    }

    createEnemies(spawnLayer) {
        let enemies = new Enemies(this);
        const enemyTypes = enemies.getEnemyTypes();
        spawnLayer.objects.forEach(spawnPoint => {
            const enemy = new enemyTypes[spawnPoint.type](this, spawnPoint.x, spawnPoint.y);
            enemies.add(enemy);
        })
        return enemies;
    }

    createEnemyColliders(enemies, {colliders}) {
        enemies.addCollider(colliders.platformColliders).addCollider(colliders.player);
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
            .setOrigin(0.5, 1);

        const endOfLevelOverlap = this.physics.add.overlap(player, endOfLevel, () => {
            endOfLevelOverlap.active = false;
            this.add.text(player.body.x + 50, player.body.y - 15, playerZones.rofl.text.text);
        })
    }
    
    drawDebug(layer) {
        const collidingTileColor = new Phaser.Display.Color(243, 134, 40);
        layer.renderDebug(this.graphics, {tileColor: null, collidingTileColor})
    }

    startDrawing(pointer) {

        if (this.tileHits && this.tileHits.length > 0) {
            this.tileHits.forEach(tile => {
                tile.index !== -1 && tile.setCollision(false);
            })
        }
        
        this.line.x1 = pointer.worldX;
        this.line.y1 = pointer.worldY;
        this.plotting = true;
    }

    finishDrawing(pointer, layer) {
        this.line.x2 = pointer.worldX;
        this.line.y2 = pointer.worldY;
        this.graphics.clear();
        this.graphics.strokeLineShape(this.line);

        this.tileHits = layer.getTilesWithinShape(this.line);

        if (this.tileHits.length > 0) {
            this.tileHits.forEach(tile => {
                tile.index !== -1 && tile.setCollision(true);
            })
        }
        this.drawDebug(layer);

        this.plotting = false;
    }
}

export default PlayScene;