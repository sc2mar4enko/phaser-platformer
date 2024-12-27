import BaseScene from './BaseScene';

export default class CreditsScene extends BaseScene {
    constructor(config) {
        super('CreditsScene', {...config, canGoBack: true});
        this.menu = [
            {scene: null, text: 'Thank you for playing'},
            {scene: null, text: 'Your score is ' + localStorage.getItem('maxScore')}
        ]
    }

    create() {
        super.create();
        this.createMenu(this.menu, () => {
        });
    }
}