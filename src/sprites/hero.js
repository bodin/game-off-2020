import * as C from '../model/constants'

export default class Hero extends Phaser.Physics.Arcade.Sprite {

    /**
     * Create the player.
     * @param {object} scene - scene creating the player.
     * @param {number} x - Start location x value.
     * @param {number} y - Start location y value.
     * @param {number} [frame] -
     */
    constructor(scene, x, y, texture, room) {
        super(scene, x, y, texture);
        this.scene = scene
        
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        this.setScale(2);

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

        //custom attributes
        this.room = room
        this.canMove = true 
        this.lastRoomId = undefined
        this.currentDoor = C.UNKNOWN
        this.skipNextRoom = false
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta)

        this.setVelocity(0, 0)
                
        if(!this.scene.render || !this.canMove) return
   
        // in room mode
        if (this.lastRoomId != this.room.id) {
            this.visible = false
            this.lastRoomId = this.room.id
           
            let offsetX = C.ROOM_WIDTH/2
            let offsetY = C.ROOM_HEIGHT/2

            if(this.currentDoor != C.UNKNOWN){            
                if(this.currentDoor == C.TOP) offsetY = -C.HERO_DOOR_OFFSET
                else if(this.currentDoor == C.BOTTOM) offsetY = C.ROOM_HEIGHT + C.HERO_DOOR_OFFSET                
                else if(this.currentDoor == C.LEFT) offsetX = -C.HERO_DOOR_OFFSET
                else if(this.currentDoor == C.RIGHT) offsetX = C.ROOM_WIDTH + C.HERO_DOOR_OFFSET
            }

            this.setX((C.ROOM_WIDTH * this.room.column) + offsetX)
            this.setY((C.ROOM_HEIGHT * this.room.row) + offsetY)

        // attack mode
        } else if (this.scene.player.room.id == this.room.id) {
            this.visible = true
            let vectorX = this.scene.player.x - this.x, vectorY = this.scene.player.y - this.y

            let normal = Math.max(Math.abs(vectorX), Math.abs(vectorY))
            vectorX = vectorX/normal
            vectorY = vectorY/normal

            this.setVelocity(C.HERO_SPEED_RUNNING*vectorX, C.HERO_SPEED_RUNNING*vectorY)

            this.play("hero-walk-up", true)
            this.skipNextRoom = true
        }        
    }

    switchRoom(dungeon, playerRoom) {
        this.currentDoor = C.UNKNOWN

        if(this.skipNextRoom){
            this.skipNextRoom = false
            return this.room            
        }

        if(this.scene.pillars.size == C.PILLARS){
            return this.getNextRoomRandom(dungeon, playerRoom)
        } else{ 
            return this.getNextRoomVector(dungeon, playerRoom)
        }
    }

    getNextRoomRandom(dungeon, playerRoom){

        let choices = []
        if(this.room.doors[C.TOP] == C.DOOR) choices.push(C.TOP)
        if(this.room.doors[C.BOTTOM] == C.DOOR) choices.push(C.BOTTOM)
        if(this.room.doors[C.LEFT] == C.DOOR) choices.push(C.LEFT)
        if(this.room.doors[C.RIGHT] == C.DOOR) choices.push(C.RIGHT)
        let choice = choices[Math.floor(Math.random() * choices.length)];

        return this.changeRoom(dungeon, choice)

    }

    getNextRoomVector(dungeon, playerRoom) {

        //positive right, negative left
        let vectorX = playerRoom.column - this.room.column
        //positive below, negative above
        let vectorY = playerRoom.row - this.room.row
        
        let choice = undefined
        
        if(Math.abs(vectorX) >= Math.abs(vectorY)){
            //left right
            if(vectorX < 0 && this.room.doors[C.LEFT] == C.DOOR){
                choice = C.LEFT
            }else if(vectorX > 0 && this.room.doors[C.RIGHT] == C.DOOR){
                choice = C.RIGHT
            }
        }
        if(choice == undefined){
            //up down
            if(vectorY < 0 && this.room.doors[C.TOP] == C.DOOR){
                choice = C.TOP
            }else if(vectorY > 0 && this.room.doors[C.BOTTOM] == C.DOOR){
                choice = C.BOTTOM
            }                
        }

        if(choice == undefined){        
            return this.getNextRoomRandom(dungeon, playerRoom)
        } else {
            return this.changeRoom(dungeon, choice);
        } 
    }
    changeRoom(dungeon, choice){
        if(choice == C.TOP){
            this.currentDoor = C.BOTTOM;
            this.setRoom(dungeon.getRoom(this.room.column, this.room.row - 1))
        } else if(choice == C.BOTTOM){
            this.currentDoor = C.TOP;
            this.setRoom(dungeon.getRoom(this.room.column, this.room.row + 1))
        } else if(choice == C.LEFT){
            this.currentDoor = C.RIGHT;
            this.setRoom(dungeon.getRoom(this.room.column-1, this.room.row))
        } else if(choice == C.RIGHT){
            this.currentDoor = C.LEFT;
            this.setRoom(dungeon.getRoom(this.room.column+1, this.room.row))
        }
        return this.room
    }
    setRoom(room){
        if(room) {
            this.room = room
        }else{
            console.log("BAD ROOM", this.room, room)
        }
    }
}