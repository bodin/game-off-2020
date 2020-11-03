import {Scene} from 'phaser'
import TILE from '../model/tiles'
import Room from '../model/room'

const TOP = 0
const LEFT = 1
const RIGHT = 2
const BOTTOM = 3

const WALL = 0;
const DOOR = 1;
const UNKNOWN = -1;

export default class DungeonScene extends Scene {
   
    constructor(config) {
        super(config);
        this.map = []
    }

    preload () {        
        this.load.image("tiles", "../assets/tileset/default.png");
    }

    create () {
        let dungeon = this.makeDungeon(3,3);        
        this.drawDungeon(dungeon, {offsetX:605, offsetY:5, width:190, height: 190})

        const map = this.make.tilemap({ data: this.makeRoomTiles(25, 25, dungeon[0][0]), tileWidth: 24, tileHeight: 24 });
        const tiles = map.addTilesetImage("tiles");
        const layer = map.createStaticLayer(0, tiles, 0, 0);
        
    }
    drawDungeon(dungeon,opts={}){
        
        const graphics = this.add.graphics();
        const color_wall=0xff0000
        const color_door=0x330000
        const width = opts.width || 100
        const height = opts.height || 100
        const offsetX = opts.offsetX || 0 
        const offsetY = opts.offsetY || 0


        const ph = height/dungeon.length
        const pw = width/dungeon[0].length

        const spacer = 1
            
        for(let row = 0; row < dungeon.length; row++){
            for(let col = 0; col < dungeon[row].length; col++){
                let doors =  dungeon[row][col].doors
                
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

    makeDungeon(rows, columns){
        let dungeon = new Array(rows)
        let doors = new Array(4)
        for(let row = 0; row < rows; row++){
            dungeon[row] = new Array(columns)
            for(let col = 0; col < columns; col++){
                
                doors[TOP] = row == 0 ? WALL : dungeon[row-1][col].doors[BOTTOM];
                doors[BOTTOM] = row == rows-1 ? WALL : UNKNOWN;
                doors[LEFT] = col == 0 ? WALL : dungeon[row][col-1].doors[RIGHT];
                doors[RIGHT] = col == columns-1 ? WALL : UNKNOWN;

                dungeon[row][col] = this.makeRoom(row + "-" + col, doors)
            }
        }
        return dungeon
    }
    makeRoom(id, doors=[UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN]){
        const result = new Room(id);
        const door_probability = .8
        result.doors = [...doors]
        
        if(doors[TOP] == UNKNOWN)       result.doors[0] = Math.random() > door_probability ? WALL : DOOR
        if(doors[LEFT] == UNKNOWN)      result.doors[1] = Math.random() > door_probability ? WALL : DOOR
        if(doors[RIGHT] == UNKNOWN)     result.doors[2] = Math.random() > door_probability ? WALL : DOOR
        if(doors[BOTTOM] == UNKNOWN)    result.doors[3] = Math.random() > door_probability ? WALL : DOOR

        return result
    }
    makeRoomTiles(width, height, room){

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