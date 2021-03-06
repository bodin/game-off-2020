import * as C from '../model/constants'

export default class Player extends Phaser.Physics.Arcade.Sprite {

    /**
     * Create the player
     * 
     * @param {*} scene 
     * @param {*} x 
     * @param {*} y 
     * @param {*} texture 
     * @param {*} room 
     */
    constructor(scene, x, y, texture, room) {
        super(scene, x, y, texture);
        this.scene = scene
        
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        this.setScale(2);
                                         
        this.scene.anims.create({
            key: 'player-walk-up',
            frameRate:10,   
            frames: this.scene.anims.generateFrameNumbers(texture, { start: 1, end: 2 }),
            repeat: 0
        });     
        this.scene.anims.create({
            key: 'player-walk-right',         
            frameRate:10,   
            frames: this.scene.anims.generateFrameNumbers(texture, { start: 3, end: 4 }),
            repeat: 0
        }); 
        this.scene.anims.create({
            key: 'player-explode',         
            frameRate:10,   
            frames: this.scene.anims.generateFrameNumbers(texture, { start: 5, end: 14 }),
            repeat: 0
        });     

        //Custom Properties
        this.canMove = true
        this.room = room
    }

    /**
     * Called once before the scene updates
     * 
     * @param {*} time 
     * @param {*} delta 
     */
    preUpdate(time, delta){
        super.preUpdate(time, delta)
        
        this.setVelocity(0, 0)       

        this.room = this.scene.getRoomAt(this.x, this.y);

        if(!this.scene.render || !this.canMove) return

        if (this.room.id == this.scene.hero.room.id) {
            this.velocity = C.PLAYER_SPEED_RUNNING
        }else{
            this.velocity = C.PLAYER_SPEED_WALKING
        }

        let cursors = this.scene.input.keyboard.createCursorKeys()

        if (cursors.left.isDown) {
            this.play('player-walk-right', true)
            this.setVelocityX(this.velocity * -1)
            this.flipX=true
        } else if (cursors.right.isDown) {
            this.play('player-walk-right', true)
            this.setVelocityX(this.velocity)
            this.flipX=false
        }

        if (cursors.down.isDown) {
            this.play('player-walk-up', true)
            this.setVelocityY(this.velocity)
            this.flipY=true
        } else if (cursors.up.isDown) {
            this.play('player-walk-up', true)
            this.setVelocityY(this.velocity * -1)
            this.flipY=false
        }
    }
}