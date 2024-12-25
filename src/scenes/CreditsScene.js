import BaseScene from './BaseScene';

export default class CreditsScene extends BaseScene {
    constructor(config) {
        super('CreditsScene', {...config, canGoBack: true});
        this.menu = [
            {scene: null, text: 'Thank you for playing'}
        ]
    }

    create() {
        super.create();
        this.createMenu(this.menu, () => {
        });
    }
}