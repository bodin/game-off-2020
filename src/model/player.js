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
                       
        this.body.setCollideWorldBounds(true);        
    }

    preUpdate(time, delta){
        let cursors = this.scene.input.keyboard.createCursorKeys()

        if (cursors.left.isDown) {
            this.setVelocityX(-150);
        } else if (cursors.right.isDown) {
            this.setVelocityX(150);
        } else {
            this.setVelocityX(0);
        }

        if (cursors.down.isDown) {
            this.setVelocityY(150);
        } else  if (cursors.up.isDown) {
            this.setVelocityY(-150);
        } else {
            this.setVelocityY(0);
        }  
    }

       /*
       // place holder for current room.
       let roomNumber;

       // loop through rooms in this level.
       for (let room in this.dungeon.rooms) {
           let roomLeft   = this.scene.rooms[room].x;
           let roomRight  = this.scene.rooms[room].x + this.scene.rooms[room].width;
           let roomTop    = this.scene.rooms[room].y;
           let roomBottom = this.scene.rooms[room].y + this.scene.rooms[room].height;

           // Player is within the boundaries of this room.
           if (this.x > roomLeft && this.x < roomRight &&
               this.y > roomTop  && this.y < roomBottom) {

               roomNumber = room;

               // Set this room as visited by player.
               let visited = this.scene.rooms[room].properties.find(function(property) {
                   return property.name === 'visited';
               } );

               visited.value = true
           }
       }

       // Update player room variables.
       if (roomNumber != this.currentRoom) {
           this.previousRoom = this.currentRoom;
           this.currentRoom = roomNumber;
           this.roomChange = true;
       } else {
           this.roomChange = false;
       }


       this.cameras.main.setBounds(this.rooms[this.player.currentRoom].x,
        this.rooms[this.player.currentRoom].y,
        this.rooms[this.player.currentRoom].width,
        this.rooms[this.player.currentRoom].height,
        true);
        */

}