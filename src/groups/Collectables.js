import Phaser from 'phaser';
import Collectable from '../collectables/Collectable';
export default class Collectables extends Phaser.Physics.Arcade.StaticGroup {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createFromConfig({
            classType: Collectable
        });
    }

    addFromLayer(layer) {
        const {score: defaultScore, type} = this.mapProperties(layer.properties);
        
        layer.objects.forEach((collectableObject) => {
            const collectable = this.get(collectableObject.x, collectableObject.y, type);
            const objectProps = this.mapProperties(collectableObject.properties);
            collectable.score = objectProps.score || defaultScore;
        });
    }
    
    mapProperties(propertiesList) {
        if (!propertiesList || propertiesList.length === 0) return {};
        return propertiesList.reduce((map, obj) => {
            map[obj.name] = obj.value;
            return map;
        }, {})
    }
}