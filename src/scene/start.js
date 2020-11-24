import {Scene} from 'phaser'
import TILE from '../model/tiles'
import Player from '../model/player'
import Hero from '../model/hero'

import Map from '../model/map'
import {Dungeon, TOP, BOTTOM, LEFT, RIGHT, DOOR} from '../model/dungeon'
import * as C from '../model/constants'

export default class StartScene extends Scene {
   
    constructor() {
        super('start-scene')
      
    }

    preload () {
        this.load.spritesheet("scene", "./assets/start-scene.png", {
            frameWidth: C.SCREEN_WIDTH,
            frameHeight: C.SCREEN_HEIGHT
        })              
    }

    create () {
        let sprite = this.add.sprite(0,0,'scene').setOrigin(0,0);
           
        this.anims.create({
           key: 'play',         
           frameRate: 5,   
           frames: this.anims.generateFrameNumbers('scene', { start: 0, end: 15 }),
           repeat: 0
        }); 

        this.input.keyboard.once('keydown-ENTER', () => {           
            this.cameras.main.fadeOut(1000, 0, 0, 0)
        })

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start('dungeon-scene')
        })

        sprite.play('play')       
    }
}