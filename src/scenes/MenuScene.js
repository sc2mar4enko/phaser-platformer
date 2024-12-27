import BaseScene from './BaseScene';
class MenuScene extends BaseScene {
    constructor(config) {
        super('MenuScene', config);
        this.menu = [
            {scene: 'PlayScene', text: 'Play'},
            {scene: 'LevelScene', text: 'Levels'},
            {scene: null, text: 'Exit'},
        ]
        this.maxScore = Number(localStorage.getItem('maxScore'));
        this.player2Available = false;
    }
    create() {
        super.create();
        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
        this.createSkins();
        this.createHighscore();
    }
    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive();
        textGO.on('pointerover', () => {
            textGO.setStyle({fill: '#ff0'});
        })
        textGO.on('pointerout', () => {
            textGO.setStyle({fill: '#713E01'});
        })
        textGO.on('pointerup', () => {
            menuItem.scene && this.scene.start(menuItem.scene);
            if (menuItem.text === 'Exit') {
                this.game.destroy(true);
            }
            if (menuItem.text === 'Play') {
                localStorage.setItem('currentScore', '0');
            }
        })
    }

    createSkins() {
        this.player1 = this.add.image(50, 50, 'player', 0).setScale(2).setInteractive().setTint(0xfffff);
        this.player2 = this.add.image(135, 50, 'player2', 11).setScale(3.6).setOrigin(0.5, 0.42);
        
        if (this.maxScore > 10) {
            this.player2.setInteractive();
            this.player2Available = true;
            this.player2.clearTint();
        }
        else {
            this.player2.setTint('grey');
        }
    }
    
    createHighscore() {
        const hsText = this.add.text(10, 150, `Highest score: ${localStorage.getItem('maxScore')}`, {color: "#713E01", fontSize: "32px", bold: true});
        this.add.image(hsText.getBounds().right + 8, 150, 'diamond').setScale(2).setOrigin(0, 0);
    }
    
    update() {
        this.player1.on('pointerup', () => {
            this.player1.setTint(0xfffff);
            if (this.player2Available)
                this.player2.clearTint();
            localStorage.setItem('skin', "1");
        })

        this.player2.on('pointerup', () => {
            this.player2.setTint(0xfffff);
            this.player1.clearTint();
            localStorage.setItem('skin', "2");
        })
    }
}
export default MenuScene;