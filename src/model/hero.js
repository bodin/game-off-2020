    
    
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

        this.setScale(2);

        this.canMove = true 
        this.roomId = undefined
        this.door = C.UNKNOWN
        this.skipNextRoom = false

        this.scene.anims.create({
            key: 'hero-walk-up',
            frameRate:10,   
            frames: this.scene.anims.generateFrameNumbers(texture, { start: 1, end: 2 }),
            repeat: -1
        });     
        this.scene.anims.create({
            key: 'hero-walk-right',         
            frameRate:10,   
            frames: this.scene.anims.generateFrameNumbers(texture, { start: 3, end: 4 }),
            repeat: 0
        }); 
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta)

        this.setVelocity(0, 0)

        if(!this.canMove) return
    
        let room = this.scene.heroRoom
        if (this.roomId != room.id) {
            this.roomId = room.id
           
            let offsetX = C.ROOM_WIDTH/2
            let offsetY =  C.ROOM_HEIGHT/2

            if(this.door != C.UNKNOWN){            
                if(this.door == C.TOP) offsetY = C.ROOM_HEIGHT
                else if(this.door == C.BOTTOM) offsetY = 0
                else if(this.door == C.LEFT) offsetX = C.ROOM_WIDTH
                else if(this.door == C.RIGHT) offsetX = 0
            }

            this.setX((C.ROOM_WIDTH * room.column) + offsetX)
            this.setY((C.ROOM_HEIGHT * room.row) + offsetY)

        } else if (this.scene.playerRoom.id == this.scene.heroRoom.id) {
            let playerX = this.scene.player.x, playerY = this.scene.player.y
            this.setVelocityX(-1 * (this.x - playerX))
            this.setVelocityY(-1 * (this.y - playerY))
            this.play("hero-walk-up", true)
            this.skipNextRoom = true
            console.log(-1 * (this.x - playerX), -1 * (this.y - playerY))
        }        
    }

    nextRoom(dungeon, playerRoom, heroRoom) {
        this.door = C.UNKNOWN

        if(!this.skipNextRoom){
            let choices = []
            if(heroRoom.doors[C.TOP] == C.DOOR) choices.push(C.TOP)
            if(heroRoom.doors[C.BOTTOM] == C.DOOR) choices.push(C.BOTTOM)
            if(heroRoom.doors[C.LEFT] == C.DOOR) choices.push(C.LEFT)
            if(heroRoom.doors[C.RIGHT] == C.DOOR) choices.push(C.RIGHT)

            let choice = choices[Math.floor(Math.random() * choices.length)];
            if(choice == C.TOP){
                this.door = C.TOP;
                return dungeon.getRoom(heroRoom.column, heroRoom.row - 1)
            } else if(choice == C.BOTTOM){
                this.door = C.BOTTOM;
                return dungeon.getRoom(heroRoom.column, heroRoom.row + 1)
            } else if(choice == C.LEFT){
                this.door = C.LEFT;
                return dungeon.getRoom(heroRoom.column-1, heroRoom.row)
            } else if(choice == C.RIGHT){
                this.door = C.RIGHT;
                return dungeon.getRoom(heroRoom.column+1, heroRoom.row)
            } 
        }
        this.skipNextRoom = false
        return heroRoom
    }
}