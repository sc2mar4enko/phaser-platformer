import {ENEMY_TYPES} from "../types/types";
import collidable from "../mixins/collidable";

export default class Enemies extends Phaser.GameObjects.Group {
    constructor(scene) {
        super(scene);
        
        Object.assign(this, collidable);
    }

    getProjectiles() {
        const projectiles = new Phaser.GameObjects.Group();
        this.getChildren().forEach(enemy => {
            enemy.projectiles && projectiles.addMultiple(enemy.projectiles.getChildren())
        });
        return projectiles;
    }
    
    getEnemyTypes() {
        return ENEMY_TYPES;
    }
}