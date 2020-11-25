import 'phaser';
import scene_dead from './scene/dead'
import scene_start from './scene/start'
import scene_start_static from './scene/start-static'
import scene_win from './scene/win'
import scene_dungeon from './scene/dungeon'


import * as C from './model/constants'

window.onload = () => {
    new Phaser.Game({
        type: Phaser.AUTO,
        width: C.SCREEN_WIDTH,
        height: C.SCREEN_HEIGHT,
        pixelArt: true,
        scene: [scene_start, scene_start_static, scene_dungeon, scene_dead, scene_win],
        physics: {
            default: "arcade",
            arcade: {             
                debug: false
            }
        }
    });
};