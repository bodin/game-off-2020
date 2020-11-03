import 'phaser';
import scene_dungeon from './scene/dungeon'

window.onload = () => {
    new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        //zoom: 1.25,
        pixelArt: true,
        scene: [scene_dungeon],
        physics: {
            default: "arcade"
        }
    });
};