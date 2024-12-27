import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }


    preload() {
        this.load.tilemapTiledJSON('map1', 'assets/map.json');
        this.load.tilemapTiledJSON('map2', 'assets/map2.json');
        this.load.image('tileset-1', 'assets/main_lev_build_1.png');
        this.load.image('tileset-2', 'assets/main_lev_build_2.png');
        
        this.load.image('iceball-1', 'assets/weapons/iceball_001.png');
        this.load.image('iceball-2', 'assets/weapons/iceball_002.png');
        
        this.load.image('fireball-1', 'assets/weapons/improved_fireball_001.png');
        this.load.image('fireball-2', 'assets/weapons/improved_fireball_002.png');
        this.load.image('fireball-3', 'assets/weapons/improved_fireball_003.png');
        
        this.load.image('background', 'assets/background03_super_dark.png');
        this.load.image('back', 'assets/back.png');
        this.load.image('menu-bg', 'assets/background01.png');
        this.load.image('backgroundSky', 'assets/background_0.png');
        this.load.image('backgroundTileset', 'assets/bg_spikes_tileset.png');
        
        
        this.load.image('diamond', 'assets/collectibles/diamond.png');
        
        for (let i = 1; i <= 6; i++) {
            this.load.image(`diamond-${i}`, `assets/collectibles/diamond_big_0${i}.png`);
        }
        
        this.load.spritesheet('player', 'assets/player/move_sprite_1.png', {
            frameWidth: 32,
            frameHeight: 38,
            spacing: 32
        });
        this.load.spritesheet('player2', 'assets/player/cute-player.png', {
           frameWidth: 32,
           frameHeight: 32
        });
        this.load.spritesheet('player2-actions', 'assets/player/cute-player-actions.png', {
           frameWidth: 48,
           frameHeight: 48
        });
        this.load.spritesheet('birdman', 'assets/enemy/enemy_sheet.png', {
            frameWidth: 32,
            frameHeight: 64,
            spacing: 32
        });
        this.load.spritesheet('snakey', 'assets/enemy/enemy_sheet_2.png', {
            frameWidth: 32,
            frameHeight: 64,
            spacing: 32
        });
        this.load.spritesheet('player-throw', 'assets/player/throw_attack_sheet_1.png', {
            frameWidth: 32,
            frameHeight: 38,
            spacing: 32
        });
        this.load.spritesheet('hit-sheet', 'assets/weapons/hit_effect_sheet.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('sword-default', 'assets/weapons/sword_sheet_1.png', {
            frameWidth: 52,
            frameHeight: 32,
            spacing: 16
        });
        this.load.spritesheet('slide-sheet', 'assets/player/slide_sheet_copy.png', {
            frameWidth: 32,
            frameHeight: 38,
            spacing: 32
        });
        
        this.load.once('complete', () => {
            this.startGame();
        });
        localStorage.setItem('skin', "1");
    }
    
    startGame() {
        this.registry.set('level', 1);
        this.registry.set('unlocked-levels', 1);
        this.scene.start('MenuScene');
    }
    // create() {
    //     this.scene.start('PlayScene');
    // }
}

export default PreloadScene;