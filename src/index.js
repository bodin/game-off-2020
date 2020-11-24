import 'phaser';
import scene_dead from './scene/dead'
import scene_start from './scene/start'
import scene_dungeon from './scene/dungeon'


import * as C from './model/constants'

window.onload = () => {
    new Phaser.Game({
        type: Phaser.AUTO,
        width: C.SCREEN_WIDTH,
        height: C.SCREEN_HEIGHT,
        pixelArt: true,
        scene: [new scene_start(), scene_dungeon, new scene_dead()],
        physics: {
            default: "arcade",
            arcade: {             
                debug: false
            }
        }
    });
};