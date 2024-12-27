class Hud extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);

        this.fontSize = 20;
        
        const { rightTopCorner } = scene.config;
        console.log(rightTopCorner);
        this.setPosition(rightTopCorner.x - 35, rightTopCorner.y + 1);
        this.setScrollFactor(0); 
        this.setupList();
    }
    setupList() {
        const scoreBoard = this.createScoreboard();
        this.add([scoreBoard]);
    }
    
    createScoreboard() {
        const scoreText = this.scene.add.text(0, 0, localStorage.getItem('currentScore'), {fontSize: `${this.fontSize}px`, fill: '#ffffff'});
        const scoreImage = this.scene.add.image(scoreText.width + 5, 15, 'diamond').setOrigin(0, 0.7).setScale(1);
        const scoreBoard = this.scene.add.container(-36,0, [scoreText, scoreImage]);
        scoreBoard.setName('scoreBoard');
        return scoreBoard
    }
    
    updateScoreboard() {
        const [scoreText, scoreImage] = this.getByName('scoreBoard').list;
        scoreText.setText(localStorage.getItem('currentScore'));
        scoreImage.setX(scoreText.width + 5);
        if (Number(localStorage.getItem('maxScore') <= Number(localStorage.getItem('currentScore')))) {
            localStorage.setItem('maxScore', localStorage.getItem('currentScore'));
            console.log(localStorage.getItem('maxScore'));
        }
    }
}
export default Hud;