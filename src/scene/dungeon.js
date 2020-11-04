import {Scene} from 'phaser'
import TILE from '../model/tiles'
import {Dungeon, TOP, BOTTOM, LEFT, RIGHT, WALL, DOOR, UNKNOWN} from '../model/dungeon'
import Room from '../model/room'


export default class DungeonScene extends Scene {
   
    constructor(config) {
        super(config);
        this.map = []
    }

    preload () {        
        this.load.image("tiles", "../assets/tileset/default.png")
        this.load.image("dude", "../assets/dude.png")
    }

    create () {
        let dungeon = Dungeon.create('foo', 3, 3);        
        this.drawDungeon(dungeon, {offsetX:605, offsetY:5, width:190, height: 190})

        const map = this.make.tilemap({ data: this.makeRoomTiles(dungeon.rooms[0][0], 25, 25), tileWidth: 24, tileHeight: 24 });
        const tiles = map.addTilesetImage("tiles");
        this.layer = map.createStaticLayer(0, tiles, 0, 0);
        

        this.player = this.physics.add.sprite(200, 200, 'dude');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(.2);

        this.layer.setCollisionBetween(1, 115);
        this.physics.add.collider(this.player, this.layer);

        this.cursors = this.input.keyboard.createCursorKeys();
        
    }

    update(){
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-150);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(150);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.down.isDown) {
            this.player.setVelocityY(150);
        } else  if (this.cursors.up.isDown) {
            this.player.setVelocityY(-150);
        } else {
            this.player.setVelocityY(0);
        }
    }

    drawDungeon(dungeon,opts={}){
        
        const graphics = this.add.graphics();
        const color_wall = opts.colorWall ||0xff0000
        const color_door = opts.colorDoor ||0x330000
        const width = opts.width || 100
        const height = opts.height || 100
        const offsetX = opts.offsetX || 0 
        const offsetY = opts.offsetY || 0


        const ph = height/dungeon.getRoomsTall()
        const pw = width/dungeon.getRoomsWide()

        const spacer = 1
            
        for(let row = 0; row < dungeon.getRoomsTall(); row++){
            for(let col = 0; col < dungeon.getRoomsWide(); col++){
                let doors =  dungeon.getRoom(col, row).doors
                
                graphics.beginPath().lineStyle(1, doors[TOP] == WALL ? color_wall : color_door)
                    .moveTo(offsetX + col*pw+spacer, offsetY + row*ph+spacer)
                    .lineTo(offsetX + (col+1)*pw-spacer, offsetY + row*ph+spacer)
                    .strokePath()
                    .beginPath().lineStyle(1, doors[BOTTOM] == WALL ? color_wall : color_door)
                    .moveTo(offsetX + col*pw+spacer, offsetY + (row+1)*ph-spacer)
                    .lineTo(offsetX + (col+1)*pw-spacer, offsetY + (row+1)*ph-spacer)
                    .strokePath()
                    .beginPath().lineStyle(1, doors[LEFT] == WALL ? color_wall : color_door)
                    .moveTo(offsetX + col*pw+spacer, offsetY + row*ph+spacer)
                    .lineTo(offsetX + col*pw+spacer, offsetY + (row+1)*ph-spacer)
                    .strokePath()
                    .beginPath().lineStyle(1, doors[RIGHT] == WALL ? color_wall : color_door)
                    .moveTo(offsetX + (col+1)*pw-spacer, offsetY + row*ph+spacer)
                    .lineTo(offsetX + (col+1)*pw-spacer, offsetY + (row+1)*ph-spacer)
                    .strokePath(); 
            }
        }
    }

    makeRoomTiles(room, width, height){

        const tile_index = [
            [TILE.CORNER_TOP_LEFT,TILE.WALL_TOP,TILE.CORNER_TOP_RIGHT],
            [TILE.WALL_RIGHT,TILE.BLANK,TILE.WALL_RIGHT],
            [TILE.CORNER_BOTTOM_LEFT,TILE.WALL_BOTTOM,TILE.CORNER_BOTTOM_RIGHT],            
        ]

        const tiles = new Array(height)
        let tileRow = 0;
        for(let i = 0; i < height; i++){
            if(i == 1) tileRow++
            if(i == height-1) tileRow++

            tiles[i] = new Array(width)                             
            tiles[i][0] = tile_index[tileRow][0]
            
            for(let k = 1; k < width-1; k++){            
                tiles[i][k] = tile_index[tileRow][1]
            }

            tiles[i][width-1] = tile_index[tileRow][2]                    
        }

        //top
        if(room.doors[TOP] == DOOR){
            tiles[0][(width-1)/2-1]   = TILE.DOOR_HOR_LEFT
            tiles[0][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            tiles[0][(width-1)/2+1]   = TILE.DOOR_HOR_RIGHT
        }

        //left
        if(room.doors[LEFT] == DOOR){
            tiles[(height-1)/2-1][0]   = TILE.DOOR_VER_TOP
            tiles[(height-1)/2][0]     = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2+1][0]   = TILE.DOOR_VER_BOTTOM
        }

        //right
        if(room.doors[RIGHT] == DOOR){
            tiles[(height-1)/2-1][width-1]   = TILE.DOOR_VER_TOP
            tiles[(height-1)/2][width-1]     = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2+1][width-1]   = TILE.DOOR_VER_BOTTOM
        }

        //bottom
        if(room.doors[BOTTOM] == DOOR){
            tiles[height-1][(width-1)/2-1]   = TILE.DOOR_HOR_LEFT
            tiles[height-1][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            tiles[height-1][(width-1)/2+1]   = TILE.DOOR_HOR_RIGHT
        }
        
        return tiles
    }
}