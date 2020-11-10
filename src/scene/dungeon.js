import {Scene} from 'phaser'
import TILE from '../model/tiles'
import Player from '../model/player'
import Map from '../model/map'
import {Dungeon, TOP, BOTTOM, LEFT, RIGHT, DOOR} from '../model/dungeon'
import * as C from '../model/constants'

export default class DungeonScene extends Scene {
   
    constructor(config) {
        super(config)
        this.playerRoom = undefined
        this.bossRoom = undefined
    }

    preload () {        
        this.load.image("tiles", "./assets/tileset/default.png")
        this.load.spritesheet("player", "./assets/player.png", {
            frameWidth: 32,
            frameHeight: 32
        })            
    }

    create () {
        this.dungeon = Dungeon.create('foo', C.COLUMNS, C.ROWS);                
        let dungeonTiles = this.makeDungeonTiles(this.dungeon, C.ROOM_TILE_WIDTH, C.ROOM_TILE_HEIGHT)

        const dungeonTileMap = this.make.tilemap({ data: dungeonTiles, tileWidth: C.TILE_WIDTH, tileHeight: C.TILE_HEIGHT });
        const tiles = dungeonTileMap.addTilesetImage("tiles");        
        this.dungeonLayer = dungeonTileMap.createStaticLayer(0, tiles, 0, 0);
        this.dungeonLayer.setCollisionBetween(1, 115);

        this.dungeonContainer = this.add.container(C.ROOM_WIDTH, C.ROOM_HEIGHT);
        this.dungeonContainer.add(this.dungeonLayer)

        this.maskShape = this.make.graphics()
            .fillStyle(0xffffff)
            .beginPath()
            .fillRect(0, 0, C.ROOM_WIDTH, C.ROOM_HEIGHT)
            .generateTexture('mask', C.ROOM_WIDTH, C.ROOM_HEIGHT).generateTexture()

        this.dungeonContainer.setMask(this.maskShape.createGeometryMask());

        this.player = new Player(this, 200, 200, 'player');
        this.physics.add.collider(this.player, this.dungeonLayer);
      
        this.map = new Map(this, C.ROOM_WIDTH + C.MAP_SPACER, C.MAP_SPACER)

        this.bossRoom = this.dungeon.getRoom(C.COLUMNS-1, C.ROWS-1)   
        
        this.anims.create({
            key: 'walk-up',         
            frameRate:10,   
            frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
            repeat: 0
        });     
        this.anims.create({
            key: 'walk-right',         
            frameRate:10,   
            frames: this.anims.generateFrameNumbers("player", { start: 3, end: 4 }),
            repeat: 0
        });     
    }

    update(){
        

        this.map.x = this.cameras.main.worldView.x + C.ROOM_WIDTH + C.MAP_SPACER
        this.map.y = this.cameras.main.worldView.y + C.MAP_SPACER

        let room = this.getCurrentRoom();

        if(!this.playerRoom || this.playerRoom.id != room.id){
            this.playerRoom = room        
            this.changeRoomAnimimation()
            this.map.change=true
        }
    }

    changeRoomAnimimation(){
        let room = this.playerRoom

        this.cameras.main.fadeOut(250, 0, 0, 0, function(camera, progress) {
            this.player.canMove = false
            if (progress === 1) {
                this.maskShape.x = room.column * C.ROOM_WIDTH
                this.maskShape.y = room.row * C.ROOM_HEIGHT

                // Change camera boundaries when fade out complete.
                this.cameras.main.setBounds(room.column * C.ROOM_WIDTH,
                    room.row * C.ROOM_HEIGHT,
                    C.ROOM_WIDTH,
                    C.ROOM_HEIGHT,
                    true)

                // Fade back in with new boundareis.
                this.cameras.main.fadeIn(100, 0, 0, 0, function(camera, progress) {
                    if (progress === 1) {
                        this.player.canMove = true
                    }
                }, this);
            }
        }, this);
    }

    getCurrentRoom(){

        let roomNumber = 0
        // loop through rooms in this level.
        for (let i = 0; i < this.dungeon.rooms.length; i++) {
            const room = this.dungeon.rooms[i]

            let roomLeft   = room.column * C.ROOM_WIDTH
            let roomRight  = roomLeft + C.ROOM_WIDTH
            let roomTop    = room.row * C.ROOM_HEIGHT
            let roomBottom = roomTop + C.ROOM_HEIGHT

            // Player is within the boundaries of this room.
            if (this.player.x > roomLeft && this.player.x < roomRight &&
                this.player.y > roomTop  && this.player.y < roomBottom) {

                roomNumber = i;
            }
        }

        return this.dungeon.rooms[roomNumber]
    }
    

    makeDungeonTiles(dungeon, width, height){
        const tiles = new Array(dungeon.getRows() * height)
        for(let i = 0; i < tiles.length; i++){
            tiles[i] = new Array(dungeon.getColumns() * width)
        }

        for (let i = 0; i < this.dungeon.rooms.length; i++) {
            const room = this.dungeon.rooms[i]
            
            const roomTiles = this.makeRoomTiles(room, width, height);
            this.copyRoomTiles(tiles, roomTiles, room.column, room.row)
            
        }
        return tiles
    }

    copyRoomTiles(dungeonTiles, roomTiles, col, row){
        const offsetRow = roomTiles.length * row
        const offsetCol = roomTiles[0].length * col

        for(let i = 0; i < roomTiles.length; i++){
            for(let j = 0; j < roomTiles[i].length; j++){
                dungeonTiles[offsetRow + i][offsetCol + j] = roomTiles[i][j]
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
            tiles[0][(width-1)/2-2]   = TILE.DOOR_HOR_LEFT
            tiles[0][(width-1)/2-1]   = TILE.DOOR_HOR_MIDDLE
            tiles[0][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            tiles[0][(width-1)/2+1]   = TILE.DOOR_HOR_MIDDLE
            tiles[0][(width-1)/2+2]   = TILE.DOOR_HOR_RIGHT
        }

        //left
        if(room.doors[LEFT] == DOOR){
            tiles[(height-1)/2-2][0]   = TILE.DOOR_VER_TOP
            tiles[(height-1)/2-1][0]   = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2][0]     = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2+1][0]   = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2+2][0]   = TILE.DOOR_VER_BOTTOM
        }

        //right
        if(room.doors[RIGHT] == DOOR){
            tiles[(height-1)/2-2][width-1]   = TILE.DOOR_VER_TOP
            tiles[(height-1)/2-1][width-1]   = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2][width-1]     = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2+1][width-1]   = TILE.DOOR_VER_MIDDLE
            tiles[(height-1)/2+2][width-1]   = TILE.DOOR_VER_BOTTOM
        }

        //bottom
        if(room.doors[BOTTOM] == DOOR){
            tiles[height-1][(width-1)/2-2]   = TILE.DOOR_HOR_LEFT
            tiles[height-1][(width-1)/2-1]   = TILE.DOOR_HOR_MIDDLE
            tiles[height-1][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            tiles[height-1][(width-1)/2+1]   = TILE.DOOR_HOR_MIDDLE
            tiles[height-1][(width-1)/2+2]   = TILE.DOOR_HOR_RIGHT
        }
        
        return tiles
    }
}