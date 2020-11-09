export default class Player extends Phaser.Physics.Arcade.Sprite {

    /**
     * Create the player.
     * @param {object} scene - scene creating the player.
     * @param {number} x - Start location x value.
     * @param {number} y - Start location y value.
     * @param {number} [frame] -
     */
    constructor(scene, x, y, frame) {
        super(scene, x, y, frame);
        this.scene = scene
        
        scene.physics.world.enable(this);
        scene.add.existing(this);
        
        this.setTexture('player');
        this.setScale(.2);
        this.setBodySize(this.width,this.height,true)
                       
        this.currentRoom = 0      
        this.velocity = 200
        this.canMove = true;
    }

    preUpdate(time, delta){
        this.setVelocity(0, 0)

        if(!this.canMove) return
        
        let cursors = this.scene.input.keyboard.createCursorKeys()

        if (cursors.left.isDown) {
            this.setVelocityX(this.velocity * -1)
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.velocity)
        }

        if (cursors.down.isDown) {
            this.setVelocityY(this.velocity)
        } else if (cursors.up.isDown) {
            this.setVelocityY(this.velocity * -1)
        }  
    }
}