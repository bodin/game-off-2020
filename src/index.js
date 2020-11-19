import 'phaser';
import scene_dungeon from './scene/dungeon'

import * as C from './model/constants'

window.onload = () => {
    new Phaser.Game({
        type: Phaser.AUTO,
        width: C.SCREEN_WIDTH,
        height: C.SCREEN_HEIGHT,
        pixelArt: true,
        scene: [scene_dungeon],
        physics: {
            default: "arcade",
            arcade: {             
                debug: false
            }
        }
    });
};