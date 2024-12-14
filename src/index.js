import Phaser from 'phaser';
import PlayScene from "./scenes/PlayScene";
import PreloadScene from "./scenes/PreloadScene";

const WIDTH = 1600;
const HEIGHT = 700;

let SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT
}

const scenes = [PreloadScene, PlayScene];
const createScene = Scene => new Scene(SHARED_CONFIG)
const initScenes = () => scenes.map(createScene)

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  },
  scene: initScenes()
}

new Phaser.Game(config);