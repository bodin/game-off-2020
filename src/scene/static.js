import {Scene} from 'phaser'
import * as C from '../model/constants'

export default class StaticScene extends Scene {
   
    constructor(key, image, count, next) {
        super(key)
        this.key = key
        this.image = image
        this.count = count
        this.next = next
    }

    preload () {
        console.log(this.key, this.image)
        this.load.spritesheet('scene-' + this.key, this.image, {
            frameWidth: C.SCREEN_WIDTH,
            frameHeight: C.SCREEN_HEIGHT
        })              
    }

    create () {
        let sprite = this.add.sprite(0,0,'scene-' + this.key).setOrigin(0,0);

        if(this.count > 1){
            this.anims.create({
                key: 'play',         
                frameRate: 5,   
                frames: this.anims.generateFrameNumbers('scene-' + this.key, { start: 0, end: this.count-1 }),
                repeat: 0
            });            
          
            this.input.keyboard.once('keydown-ENTER', () => {           
                this.cameras.main.fadeOut(1000, 0, 0, 0)
            })
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.start(this.next)
            })
        
            sprite.play('play')
        }else{
            this.input.keyboard.once('keydown-ENTER', () => {           
                this.scene.start(this.next)
            })
        }
        this.cameras.main.fadeIn(200, 0, 0, 0)
    }
}