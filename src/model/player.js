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

        this.setScale(3);
                       
        this.currentRoom = 0      
        this.velocity = 200
        this.canMove = true;          
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta)
        
        this.setVelocity(0, 0)       

        if(!this.canMove) return
        
        let cursors = this.scene.input.keyboard.createCursorKeys()

        if (cursors.left.isDown) {
            this.play('walk-right', true)
            this.setVelocityX(this.velocity * -1)
            this.flipX=true
        } else if (cursors.right.isDown) {
            this.play('walk-right', true)
            this.setVelocityX(this.velocity)
            this.flipX=false
        }

        if (cursors.down.isDown) {
            this.play('walk-up', true)
            this.setVelocityY(this.velocity)
            this.flipY=true
        } else if (cursors.up.isDown) {
            this.play('walk-up', true)
            this.setVelocityY(this.velocity * -1)
            this.flipY=false
        }
        if(!cursors.down){
            this.anims.get
        }
    }
}