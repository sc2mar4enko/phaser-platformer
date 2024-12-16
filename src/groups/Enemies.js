import {ENEMY_TYPES} from "../types/types";
import collidable from "../mixins/collidable";

export default class Enemies extends Phaser.GameObjects.Group {
    constructor(scene) {
        super(scene);
        
        Object.assign(this, collidable);
    }
    getEnemyTypes() {
        return ENEMY_TYPES;
    }
}