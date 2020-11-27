import * as C from '../model/constants'

export default class Hero extends Phaser.Physics.Arcade.Sprite {

    /**
     * create the hero
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
        this.setRoom(room)
        this.canMove = true 
        this.lastRoomIdHero = undefined
        this.lastRoomIdPlayer = undefined
        this.currentDoor = C.UNKNOWN
        this.skipNextRoom = false
    }

    /**
     * Called when the player removes a pillar from the game
     * 
     * @param {*} total 
     * @param {*} left 
     */
    pillerFound (total, left){
        if(left == 1){
            if(this.heroTimer){
                this.heroTimer.remove();
            }
            if(!this.heroTimerCrazy){
                this.heroTimerCrazy = this.scene.time.addEvent({
                    delay: C.HERO_SPEED_ROOM_SWITCH_CRAZY,
                    callback: this.executeSwitchRoom,
                    callbackScope: this,
                    loop: true
                });                 
            }

        }else if(2*left < total) {
            if(!this.heroTimer){
                this.heroTimer = this.scene.time.addEvent({
                    delay: C.HERO_SPEED_ROOM_SWITCH_NORMAL,                
                    callback: this.executeSwitchRoom,
                    callbackScope: this,
                    loop: true
                });                 
            }   
        }
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
                
        if(!this.scene.render || !this.canMove) return

        if (this.scene.player.room.id == this.room.id) {
            this.preUpdateSameRoom(time, delta)
        }else{
            this.preUpdateDifferentRoom(time, delta)
        }                      
    }

    /**
     * Internal method to setup when the player and hero are in the same room
     * 
     * @param {*} time 
     * @param {*} delta 
     */
    preUpdateSameRoom(time, delta){
        this.visible = true
        let vectorX = this.scene.player.x - this.x, vectorY = this.scene.player.y - this.y

        let normal = Math.max(Math.abs(vectorX), Math.abs(vectorY))
        vectorX = vectorX/normal
        vectorY = vectorY/normal

        this.setVelocity(C.HERO_SPEED_RUNNING*vectorX, C.HERO_SPEED_RUNNING*vectorY)

        this.play("hero-walk-up", true)
        this.skipNextRoom = true
    }

    /**
     * Internal method to setup when the player and hero are in a different room
     * 
     * @param {*} time 
     * @param {*} delta 
     */
    preUpdateDifferentRoom(time, delta){
        this.visible = false
        //the player changed rooms
        if(this.lastRoomIdPlayer == undefined) this.lastRoomIdPlayer = this.scene.player.room.id
        
        if(this.lastRoomIdPlayer != this.scene.player.room.id) {

            this.lastRoomIdPlayer = this.scene.player.room.id            
            this.possiblySwitchRoom()
        }
    }
    
    /**
     * Switches rooms only if there is not a background timer in place to do that task
     */
    possiblySwitchRoom(){
        if(this.heroTimer || this.heroTimerCrazy) return
        this.executeSwitchRoom()
    }

    /**
     * Switch room based on the current method (random vs vector)
     */
    executeSwitchRoom() {     
        this.currentDoor = C.UNKNOWN

        if(this.skipNextRoom){
            this.skipNextRoom = false
            return this.room            
        }

        let dungeon = this.scene.dungeon;
        let playerRoom = this.scene.player.room;

        if(this.scene.pillars.size == C.PILLARS){
            return this.executeNextRoomRandom(dungeon, playerRoom)
        } else{ 
            return this.executeNextRoomVector(dungeon, playerRoom)
        }
    }

    /**
     * randomly go through a door
     * 
     * @param {*} dungeon 
     * @param {*} playerRoom 
     */
    executeNextRoomRandom(dungeon, playerRoom){

        let choices = []
        if(this.room.doors[C.TOP] == C.DOOR) choices.push(C.TOP)
        if(this.room.doors[C.BOTTOM] == C.DOOR) choices.push(C.BOTTOM)
        if(this.room.doors[C.LEFT] == C.DOOR) choices.push(C.LEFT)
        if(this.room.doors[C.RIGHT] == C.DOOR) choices.push(C.RIGHT)
        let choice = choices[Math.floor(Math.random() * choices.length)];

        return this.changeRoom(dungeon, choice)
    }

    /**
     * Go throug the door that brings you closer to the player.  If not possible, pick a random door
     * 
     * @param {*} dungeon 
     * @param {*} playerRoom 
     */
    executeNextRoomVector(dungeon, playerRoom) {

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
            return this.executeNextRoomRandom(dungeon, playerRoom)
        } else {
            return this.changeRoom(dungeon, choice);
        } 
    }

    /**
     * given a door, update internal state to the new room
     * 
     * @param {*} dungeon 
     * @param {*} choice - the door to use
     */
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

    /**
     * Sets the room and updates the X/Y position of this sprite
     * 
     * @param {*} room 
     */
    setRoom(room){        
        if(room) {
            this.room = room
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

        }else{
            console.log("BAD ROOM", this.room, room)
        }
    }
}