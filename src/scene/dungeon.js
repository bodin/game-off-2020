import {Scene} from 'phaser'
import TILE from '../model/tiles'
import Player from '../model/player'
import {Dungeon, TOP, BOTTOM, LEFT, RIGHT, WALL, DOOR, UNKNOWN} from '../model/dungeon'

const SCREEN_WIDTH = 800
const SCREEN_HEIGHT = 600

const TILE_WIDTH = 24
const TILE_HEIGHT = 24
const ROOM_TILE_WIDTH = 25
const ROOM_TILE_HEIGHT = 25
const ROOM_WIDTH = TILE_WIDTH * ROOM_TILE_WIDTH
const ROOM_HEIGHT = TILE_HEIGHT * ROOM_TILE_HEIGHT

const COLUMNS = 3
const ROWS = 3

const MAP_WIDTH = 180
const MAP_HEIGHT = 180

const MAP_SPACER = ((SCREEN_WIDTH - ROOM_WIDTH - MAP_WIDTH)/2)

export default class DungeonScene extends Scene {
   
    constructor(config) {
        super(config)
        this.currentRoom = 0
    }

    preload () {        
        this.load.image("tiles", "../assets/tileset/default.png")
        this.load.image("player", "../assets/player.png")
    }

    create () {
        this.dungeon = Dungeon.create('foo', COLUMNS, ROWS);                
        let dungeonTiles = this.makeDungeonTiles(this.dungeon, ROOM_TILE_WIDTH, ROOM_TILE_HEIGHT)

        const dungeonTileMap = this.make.tilemap({ data: dungeonTiles, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT });
        const tiles = dungeonTileMap.addTilesetImage("tiles");
        this.dungeonLayer = dungeonTileMap.createStaticLayer(0, tiles, 0, 0);
        this.dungeonLayer.setCollisionBetween(1, 115);

        this.dungeonContainer = this.add.container(ROOM_WIDTH, ROOM_HEIGHT);
        this.dungeonContainer.add(this.dungeonLayer)

        this.maskShape = this.make.graphics()
            .fillStyle(0xffffff)
            .beginPath()
            .fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT)
            .generateTexture('mask', ROOM_WIDTH, ROOM_HEIGHT).generateTexture()

        this.dungeonContainer.setMask(this.maskShape.createGeometryMask());

        this.player = new Player(this, 200, 200);
        this.physics.add.collider(this.player, this.dungeonLayer);

        this.makeMapGraphic('map', this.dungeon, {width:MAP_WIDTH, height: MAP_HEIGHT})
        this.map = this.add.sprite(ROOM_WIDTH + MAP_SPACER, MAP_SPACER, 'map').setOrigin(0,0)
    }

    update(){

       this.map.x = this.cameras.main.worldView.x + ROOM_WIDTH + MAP_SPACER
       this.map.y = this.cameras.main.worldView.y + MAP_SPACER

       let room = this.getCurrentRoom();

       if(!this.currentRoom || this.currentRoom.id != room.id){
            this.currentRoom = room
        
            this.cameras.main.fadeOut(250, 0, 0, 0, function(camera, progress) {
                this.player.canMove = false;
                if (progress === 1) {
                    this.maskShape.x = room.column * ROOM_WIDTH
                    this.maskShape.y = room.row * ROOM_HEIGHT


                    // Change camera boundaries when fade out complete.
                    this.cameras.main.setBounds(room.column * ROOM_WIDTH,
                        room.row * ROOM_HEIGHT,
                        ROOM_WIDTH,
                        ROOM_HEIGHT,
                        true);

                    // Fade back in with new boundareis.
                    this.cameras.main.fadeIn(500, 0, 0, 0, function(camera, progress) {
                        if (progress === 1) {
                            // NOTHING TO DO WHEN ROOM IS THERE
                        }
                    }, this);
                }
            }, this);

                 
       }
    }

    makeMapGraphic(key, dungeon, opts={}){
        
        const graphics = this.make.graphics({x: 0, y: 0});
        const color_wall = opts.colorWall | 0xff0000
        const color_door = opts.colorDoor || 0x330000
        const width = opts.width || 100
        const height = opts.height || 100

        const ph = height/dungeon.getRows()
        const pw = width/dungeon.getColumns()

        const spacer = 1
        graphics.beginPath()

        for(let row = 0; row < dungeon.getRows(); row++){
            for(let col = 0; col < dungeon.getColumns(); col++){
                let doors =  dungeon.getRoom(col, row).doors
                
                graphics
                    .beginPath().lineStyle(1, doors[TOP] == WALL ? color_wall : color_door)
                    .moveTo(col*pw+spacer, row*ph+spacer)
                    .lineTo((col+1)*pw-spacer, row*ph+spacer)
                    .strokePath().beginPath().lineStyle(1, doors[BOTTOM] == WALL ? color_wall : color_door)
                    .moveTo(col*pw+spacer, (row+1)*ph-spacer)
                    .lineTo((col+1)*pw-spacer, (row+1)*ph-spacer)
                    .strokePath().beginPath().lineStyle(1, doors[LEFT] == WALL ? color_wall : color_door)
                    .moveTo(col*pw+spacer, row*ph+spacer)
                    .lineTo(col*pw+spacer, (row+1)*ph-spacer)
                    .strokePath().beginPath().lineStyle(1, doors[RIGHT] == WALL ? color_wall : color_door)
                    .moveTo((col+1)*pw-spacer, row*ph+spacer)
                    .lineTo((col+1)*pw-spacer, (row+1)*ph-spacer)
                    .strokePath()
            }
        }

        return graphics.generateTexture(key, width, height);
    }

    getCurrentRoom(){

        let roomNumber = 0
        // loop through rooms in this level.
        for (let i = 0; i < this.dungeon.getRooms().length; i++) {
            const room = this.dungeon.getRooms()[i]

            let roomLeft   = room.column * ROOM_WIDTH
            let roomRight  = roomLeft + ROOM_WIDTH
            let roomTop    = room.row * ROOM_HEIGHT
            let roomBottom = roomTop + ROOM_HEIGHT

            // Player is within the boundaries of this room.
            if (this.player.x > roomLeft && this.player.x < roomRight &&
                this.player.y > roomTop  && this.player.y < roomBottom) {

                roomNumber = i;
            }
        }

        return this.dungeon.getRooms()[roomNumber]
    }
    

    makeDungeonTiles(dungeon, width, height){
        const tiles = new Array(dungeon.getRows() * height)
        for(let i = 0; i < tiles.length; i++){
            tiles[i] = new Array(dungeon.getColumns() * width)
        }

        for(let i = 0; i < dungeon.getColumns(); i++){
            for(let j = 0; j < dungeon.getRows(); j++){
                const roomTiles = this.makeRoomTiles(dungeon.getRoom(i, j), width, height);
                this.copyRoomTiles(tiles, roomTiles, i, j)
            }
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