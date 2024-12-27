import Phaser from "phaser";
import Player from "../entities/Player";
import Enemies from "../groups/Enemies";
import initGenericAnimations from "../animations/genericAnimations";
import Collectable from "../collectables/Collectable";
import Collectables from "../groups/Collectables";
import Hud from "../hud/Hud";
import EventEmitter from "../events/Emitter";
class PlayScene extends Phaser.Scene {

    constructor(config) {
        super('PlayScene');
        this.config = config;
    }

    create({gameStatus}) {
        const map = this.createMap();
        this.scoreHud = new Hud(this, 0, 0).setDepth(999);
        this.score = 0;
        
        initGenericAnimations(this.anims);
        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);
        const player = this.createPlayer(playerZones);
        const enemies = this.createEnemies(layers.enemySpawns, layers.platformColliders);
        const collectables = this.createCollectables(layers.collectables);
        this.createBackground(map);
        this.createPlayerColliders(player, {
            colliders: {
                platformColliders: layers.platformColliders,
                projectiles: enemies.getProjectiles(),
                collectables,
                traps: layers.traps
            }
        });
        this.createEnemyColliders(enemies, {
            colliders: {
                platformColliders: layers.platformColliders,
                player
            }
        });
        this.createBackButton();
        this.createEndOfLevel(playerZones, player);
        this.setupFollowupCameraOn(player);
        
        if ({gameStatus} === 'PLAYER_LOSS') {
            return;
        }
        
        this.createGameEvents();
    }

    createMap() {
        const map = this.make.tilemap({key: `map${this.getCurrentLevel()}`});
        map.addTilesetImage('main_lev_build_1', 'tileset-1');
        map.addTilesetImage('bg_spikes_tileset', 'backgroundTileset');
        return map;
    }

    createLayers(map) {
        const tileset = map.getTileset('main_lev_build_1');
        const tilesetBackground = map.getTileset('bg_spikes_tileset');
        const platformColliders = map.createStaticLayer('PlatformColliders', tileset).setAlpha(0);
        const distanceLayer = map.createStaticLayer('Distance', tilesetBackground).setDepth(-6);
        const environment = map.createStaticLayer('Environment', tileset).setDepth(-5);
        const platforms = map.createStaticLayer('Platforms', tileset);
        const playerZones = map.getObjectLayer('PlayerZones');
        const enemySpawns = map.getObjectLayer('EnemySpawns');
        const collectables = map.getObjectLayer('Collectables');
        const traps = map.createStaticLayer('Traps', tileset);

        platformColliders.setCollisionByProperty({collides: true});
        traps.setCollisionByExclusion(-1);
        return {environment, platforms, platformColliders, playerZones, enemySpawns, collectables, traps};
    }

    createPlayer(playerZones) {
        return new Player(this, playerZones.start.x, playerZones.start.y);
    }

    createPlayerColliders(player, {colliders}) {
        player
            .addCollider(colliders.platformColliders)
            .addCollider(colliders.projectiles, this.onHit)
            .addCollider(colliders.traps, this.onHit)
            .addOverlap(colliders.collectables, this.onCollect, this);
    }

    createEnemies(spawnLayer, platformColliders) {
        let enemies = new Enemies(this);
        const enemyTypes = enemies.getEnemyTypes();
        spawnLayer.objects.forEach((spawnPoint) => {
            const enemy = new enemyTypes[spawnPoint.type](this, spawnPoint.x, spawnPoint.y);
            enemy.setPlatformColliders(platformColliders);
            enemies.add(enemy);
        })
        return enemies;
    }

    createEnemyColliders(enemies, {colliders}) {
        enemies
            .addCollider(colliders.platformColliders)
            .addCollider(colliders.player, this.onPlayerCollision)
            .addCollider(colliders.player.projectiles, this.onHit)
            .addOverlap(colliders.player.meleeWeapon, this.onHit);
    }

    createCollectables(collectableLayer) {
        const collectables = new Collectables(this).setDepth(-1);
        
        collectables.addFromLayer(collectableLayer);
        collectables.playAnimation('diamond-shine');
        return collectables;
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
    
    getCurrentLevel() {
        return this.registry.get('level') || 1;
    }

    createEndOfLevel(playerZones, player) {
        const endOfLevel = this.physics.add.sprite(playerZones.end.x, playerZones.end.y, 'end')
            .setSize(5, 200)
            .setAlpha(0)
            .setOrigin(0.5, 1);

        const endOfLevelOverlap = this.physics.add.overlap(player, endOfLevel, () => {
            endOfLevelOverlap.active = false;

            if (this.registry.get('level') === this.config.lastLevel) {
                this.scene.start('CreditsScene');
                return;
            }
            this.registry.inc('level', 1);
            this.registry.inc('unlocked-level', 1);
            this.scene.restart({gameStatus: 'LEVEL_COMPLETED'});
        })
    }

    onPlayerCollision(enemy, player) {
        player.takesHit(enemy);
    }

    onHit(entity, source) {
        entity.takesHit(source);
    }

    onCollect(entity, collectable) {
        console.log(collectable)
        this.score += collectable.score;
        this.scoreHud.updateScoreboard(this.score);
        collectable.disableBody(true, true);
    }

    createGameEvents() {
        EventEmitter.on('PLAYER_LOSS', () => {
            this.scene.restart({gameStatus:'PLAYER_LOSS'});
        })
    }

    createBackground(map) {
        const background = map.getObjectLayer('DistanceBackground').objects[0];
        this.spikesImage = this.add.tileSprite(background.x, background.y, this.config.width, background.height, 'background')
            .setOrigin(0, 1)
            .setDepth(-4444)
            .setScrollFactor(0,1);
        
        this.skyImage = this.add.tileSprite(0, 0, this.config.width, 180, 'backgroundSky')
            .setOrigin(0, 0 )
            .setDepth(-4446)
            .setScale(1.3)
            .setScrollFactor(0,1);
    }
    
    update() {
        this.spikesImage.tilePositionX = this.cameras.main.scrollX * 0.5;
        this.skyImage.tilePositionX = this.cameras.main.scrollX * 0.1;
    }

    createBackButton() {
        // console.log(this.config.rightTopCorner)
        const btn = this.add.image(this.config.rightTopCorner.x - 5, this.config.rightTopCorner.y + 25, 'back')
            .setOrigin(1, 1)
            .setScrollFactor(0)
            .setScale(1)
            .setInteractive()
        btn.on('pointerup', () => {
            this.scene.start('MenuScene');
            this.scene.stop();
        })
    }
}

export default PlayScene;