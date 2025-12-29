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

    create({gameStatus} = {}) {
        const map = this.createMap();
        this.scoreHud = new Hud(this, 0, 0).setDepth(999);
        this.score = Number(localStorage.getItem('currentScore'));
        
        initGenericAnimations(this.anims);
        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);
        this.respawnPoint = {x: playerZones.start.x, y: playerZones.start.y};
        const player = this.createPlayer(playerZones);
        this.player = player;
        this.checkpointZones = this.createCheckpoints(map);
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
        this.createCheckpointOverlaps(player);
        
        if (gameStatus === 'PLAYER_LOSS') {
            return;
        }
        
        this.emitRofls();
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

    createCheckpoints(map) {
        const checkpointLayer = map.getObjectLayer('Checkpoints');
        if (!checkpointLayer) {
            return [];
        }
        return checkpointLayer.objects
            .filter((checkpoint) => checkpoint.type === 'checkpoint' || checkpoint.name === 'checkpoint')
            .map((checkpoint) => {
                const zone = this.add.zone(checkpoint.x, checkpoint.y, checkpoint.width || 16, checkpoint.height || 16);
                this.physics.add.existing(zone, true);
                zone.setData('activated', false);
                const marker = this.add.image(checkpoint.x, checkpoint.y, 'diamond')
                    .setOrigin(0.5, 1)
                    .setScale(0.6)
                    .setAlpha(0.4);
                zone.setData('marker', marker);
                return zone;
            });
    }

    createCheckpointOverlaps(player) {
        if (!this.checkpointZones || this.checkpointZones.length === 0) {
            return;
        }
        this.checkpointZones.forEach((zone) => {
            this.physics.add.overlap(player, zone, () => this.activateCheckpoint(zone));
        });
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
            this.registry.inc('unlocked-levels', 1);
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
        this.score += collectable.score;
        this.scoreHud.updateScoreboard();
        localStorage.setItem(('currentScore'), this.score.toString());
        collectable.disableBody(true, true);
    }

    activateCheckpoint(zone) {
        if (zone.getData('activated')) {
            return;
        }
        zone.setData('activated', true);
        this.respawnPoint = {x: zone.x, y: zone.y};
        const marker = zone.getData('marker');
        if (marker) {
            marker.setAlpha(1);
        }
    }

    respawnPlayer() {
        const {x, y} = this.respawnPoint;
        this.player.setPosition(x, y);
        this.player.setVelocity(0, 0);
        this.player.clearTint();
        this.player.hasBeenHit = false;
        this.player.health = this.player.maxHealth;
        this.player.hp.decrease(this.player.health);
    }

    createGameEvents() {
        EventEmitter.on('PLAYER_LOSS', () => {
            this.respawnPlayer();
        })
        EventEmitter.on('ROFLS', () => {
            const rofl = this.add.text(this.player.x, this.player.y - 50, 'homo bomba');
            this.time.delayedCall(500, () => {
                rofl.setText('');
            })
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

    emitRofls() {
        const button = document.getElementById('event-button');
        if (!button) {
            return;
        }
        if (!this.roflHandler) {
            this.roflHandler = () => EventEmitter.emit('ROFLS');
        }
        button.removeEventListener('click', this.roflHandler);
        button.addEventListener('click', this.roflHandler);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            button.removeEventListener('click', this.roflHandler);
        });
    }
}

export default PlayScene;
