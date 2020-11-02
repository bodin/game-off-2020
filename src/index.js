import 'phaser';
import scene_dungeon from './scene/dungeon'

window.onload = () => {
    new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: [scene_dungeon]
    });
};