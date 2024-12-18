export default class Healthbar {
    constructor(scene, x, y, health, scale) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.hpText = new Phaser.GameObjects.Text(scene);
        
        this.health = health;
        this.scale = scale;
        this.x = x / scale;
        this.y = y / scale;
        
        this.size = {
            width: 80,
            height: 16
        }
        this.pixelPerHealth =  this.size.width / health; // or this.value ??!?!?
        
        scene.add.existing(this.bar);
        scene.add.existing(this.hpText);
        this.draw(this.x, this.y, this.scale);
    }
    
    draw(x, y, scale) {
        this.bar.clear();
        const { width, height } = this.size; 
        
        const margin = 2;

        this.hpText.setX(x + width * 1.3).setY(y + height * 2.5).setText(this.health).setStyle({color: "#000000"}).setScrollFactor(0, 0);
        this.hpText.depth = 1;
        this.bar.depth = 0;

        this.bar.fillStyle(0x000);
        this.bar.fillRect(x, y, width + margin, height + margin);

        this.bar.fillStyle(0xFFFFFF);
        this.bar.fillRect(x + margin, y + margin, width - margin, height - margin);

        const healthWidth = Math.floor(this.health * this.pixelPerHealth);

        if (healthWidth <= this.size.width / 3) {
            this.bar.fillStyle(0xFF0000);
        } else {
            this.bar.fillStyle(0x00FF00);
        }

        if (healthWidth > 0)
            this.bar.fillRect(x + margin, y + margin, healthWidth - margin, height - margin);

        return this.bar
            .setScrollFactor(0,0)
            .setScale(scale);
    }
    
    decrease(amount) {
        if (amount <= 0) {
            this.health = 0;
        } else {
            this.health = amount;
        }
        
        this.hpText.setText(amount);
        this.draw(this.x, this.y, this.scale);
    }
}