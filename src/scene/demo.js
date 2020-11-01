import {Scene} from 'phaser'

export default class DemoScene extends Scene {
    constructor(config) {
        super(config);
    }

    preload () {
        this.load.image('logo', 'assets/logos.png');
    }

    create () {
        var logo = this.add.image(400, 150, 'logo');

        this.tweens.add({
            targets: logo,
            y: 450,
            duration: 2000,
            ease: 'Power2',
            yoyo: true,
            loop: -1
        });
    }
}