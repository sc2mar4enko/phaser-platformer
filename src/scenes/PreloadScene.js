import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }


    preload() {
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.image('tileset-1', 'assets/main_lev_build_1.png');
        this.load.image('tileset-2', 'assets/main_lev_build_2.png');
        this.load.image('player', 'assets/player/movements/idle01.png');
    }

    create() {
        this.scene.start('PlayScene');
    }
}

export default PreloadScene;