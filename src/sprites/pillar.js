  import * as C from '../model/constants'

export default class Piller extends Phaser.Physics.Arcade.Sprite {

    /**
     * Create the player.
     * @param {object} scene - scene creating the player.
     * @param {number} x - Start location x value.
     * @param {number} y - Start location y value.
     * @param {number} [frame] -
     */
    constructor(scene, texture, room) {
        super(scene, 0, 0, texture);
        this.scene = scene
        this.room = room

        this.scene.physics.world.enable(this)
        this.scene.add.existing(this)
        this.setImmovable(true)
        this.setScale(2);
        
        this.setX(this.room.column * C.ROOM_WIDTH + C.ROOM_WIDTH/2)
        this.setY(this.room.row * C.ROOM_HEIGHT + C.ROOM_HEIGHT/2)
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta)
    }
}