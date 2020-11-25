import * as C from '../model/constants'

export default class Player extends Phaser.Physics.Arcade.Sprite {

    /**
     * Create the player.
     * @param {object} scene - scene creating the player.
     * @param {number} x - Start location x value.
     * @param {number} y - Start location y value.
     * @param {number} [frame] -
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene = scene
        
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        this.setScale(2);
                          
        this.canMove = true;     
        
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
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta)
        
        this.setVelocity(0, 0)       

        if(!this.canMove) return
        
        if (this.scene.playerRoom.id == this.scene.heroRoom.id) {
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