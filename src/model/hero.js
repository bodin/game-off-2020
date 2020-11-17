    
    
import * as C from './constants'

export default class Hero extends Phaser.Physics.Arcade.Sprite {

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
        this.setBounce(.2, .2)
        this.canMove = true 
        this.roomId = undefined
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta)

        if(!this.canMove) return
    
        let room = this.scene.heroRoom
        if(this.roomId != room.id) {

            this.roomId = room.id
            this.setX(C.ROOM_WIDTH * room.column + C.ROOM_WIDTH/2)
            this.setY(C.ROOM_HEIGHT * room.row + C.ROOM_HEIGHT/2)

            this.setVelocity(0,0)

        }else if (this.scene.playerRoom.id == this.scene.heroRoom.id) {
            let playerX = this.scene.player.x, playerY = this.scene.player.y
            this.setVelocityX(-1 * (this.x - playerX))
            this.setVelocityY(-1 * (this.y - playerY))
        }
    }

    nextRoom(dungeon, playerRoom, heroRoom) {
        
        let choices = []
        if(heroRoom.doors[C.TOP] == C.DOOR) choices.push(C.TOP)
        if(heroRoom.doors[C.BOTTOM] == C.DOOR) choices.push(C.BOTTOM)
        if(heroRoom.doors[C.LEFT] == C.DOOR) choices.push(C.LEFT)
        if(heroRoom.doors[C.RIGHT] == C.DOOR) choices.push(C.RIGHT)

        let choice = choices[Math.floor(Math.random() * choices.length)];
        if(choice == C.TOP) return dungeon.getRoom(heroRoom.column, heroRoom.row - 1)
        if(choice == C.BOTTOM) return dungeon.getRoom(heroRoom.column, heroRoom.row + 1)
        if(choice == C.LEFT) return dungeon.getRoom(heroRoom.column-1, heroRoom.row)
        if(choice == C.RIGHT) return dungeon.getRoom(heroRoom.column+1, heroRoom.row)

        return heroRoom
    }
}