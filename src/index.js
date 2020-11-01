import 'phaser';
import scene_demo from './scene/demo'

window.onload = () => {
    new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: [scene_demo]
    });
};