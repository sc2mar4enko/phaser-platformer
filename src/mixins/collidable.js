export default {
    addCollider(otherGameObject, callback) {
        this.scene.physics.add.collider(this, otherGameObject, callback, null, this);
        return this;
    },
    
    bodyPositionDifferenceX: 0,
    previousRay: null,
    previousHasHit: null,
    
    raycast(body, layer, rayLength = 30, precision = 0) {
        const {x, y, width, halfHeight} = body;
        
        this.bodyPositionDifferenceX += body.x - body.prev.x;
        
        if ((Math.abs(this.bodyPositionDifferenceX) <= precision && this.previousHasHit !== null)) {
            return {ray: this.previousRay, hasHit: this.previousHasHit}
        }
        
        const line = new Phaser.Geom.Line();
        let hasHit = false;

        line.x1 = x + width;
        line.y1 = y + halfHeight;
        line.x2 = line.x1 + rayLength;
        line.y2 = line.y1 + rayLength;

        const hits = layer.getTilesWithinShape(line);

        if (hits.length > 0) {
            hasHit = this.previousHasHit = hits.some(hit => hit.index !== 1);
            console.log('Raycasting!');
        }
        
        this.previousRay = line;
        this.bodyPositionDifferenceX = 0;

        return {ray: line, hasHit: hasHit};
    }
}