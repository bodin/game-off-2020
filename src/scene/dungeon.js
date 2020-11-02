import {Scene} from 'phaser'
import TILE from '../model/tiles'

const TOP = 0
const LEFT = 1
const RIGHT = 2
const BOTTOM = 3

const DOOR_MISSING = 0;
const DOOR_EXISTS = 1;
const DOOR_UNDEFINED = -1;

export default class DemoScene extends Scene {
   
    constructor(config) {
        super(config);
        this.map = []
    }

    preload () {        
        this.load.image("tiles", "../assets/tileset/default.png");
    }

    create () {
        const room_layout = this.makeRoom()

        const map = this.make.tilemap({ data: this.makeRoomTiles(25, 25, room_layout), tileWidth: 24, tileHeight: 24 });
        const tiles = map.addTilesetImage("tiles");
        const layer = map.createStaticLayer(0, tiles, 0, 0);
    }

    makeRoom(allowDoors=[DOOR_UNDEFINED,DOOR_UNDEFINED,DOOR_UNDEFINED,DOOR_UNDEFINED]){
        let doors = [...allowDoors]
        
        if(allowDoors[TOP] == DOOR_UNDEFINED)       doors[0] = Math.random() > .9 ? DOOR_MISSING : DOOR_EXISTS
        if(allowDoors[LEFT] == DOOR_UNDEFINED)      doors[1] = Math.random() > .9 ? DOOR_MISSING : DOOR_EXISTS
        if(allowDoors[RIGHT] == DOOR_UNDEFINED)     doors[2] = Math.random() > .9 ? DOOR_MISSING : DOOR_EXISTS
        if(allowDoors[BOTTOM] == DOOR_UNDEFINED)    doors[3] = Math.random() > .9 ? DOOR_MISSING : DOOR_EXISTS

        return doors
    }
    makeRoomTiles(width, height, doors = [DOOR_EXISTS,DOOR_EXISTS,DOOR_EXISTS,DOOR_EXISTS]){

        const roomTiles = [
            [TILE.CORNER_TOP_LEFT,TILE.WALL_TOP,TILE.CORNER_TOP_RIGHT],
            [TILE.WALL_RIGHT,TILE.BLANK,TILE.WALL_RIGHT],
            [TILE.CORNER_BOTTOM_LEFT,TILE.WALL_BOTTOM,TILE.CORNER_BOTTOM_RIGHT],            
        ]

        const room = new Array(height)
        let tileRow = 0;
        for(let i = 0; i < height; i++){
            if(i == 1) tileRow++
            if(i == height-1) tileRow++

            room[i] = new Array(width)                             
            room[i][0] = roomTiles[tileRow][0]
            
            for(let k = 1; k < width-1; k++){            
                room[i][k] = roomTiles[tileRow][1]
            }

            room[i][width-1] = roomTiles[tileRow][2]                    
        }

        //top
        if(doors[TOP] == DOOR_EXISTS){
            room[0][(width-1)/2-1]   = TILE.DOOR_HOR_LEFT
            room[0][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            room[0][(width-1)/2+1]   = TILE.DOOR_HOR_RIGHT
        }

        //left
        if(doors[LEFT] == DOOR_EXISTS){
            room[(height-1)/2-1][0]   = TILE.DOOR_VER_TOP
            room[(height-1)/2][0]     = TILE.DOOR_VER_MIDDLE
            room[(height-1)/2+1][0]   = TILE.DOOR_VER_BOTTOM
        }

        //right
        if(doors[RIGHT] == DOOR_EXISTS){
            room[(height-1)/2-1][width-1]   = TILE.DOOR_VER_TOP
            room[(height-1)/2][width-1]     = TILE.DOOR_VER_MIDDLE
            room[(height-1)/2+1][width-1]   = TILE.DOOR_VER_BOTTOM
        }

        //bottom
        if(doors[BOTTOM] == DOOR_EXISTS){
            room[height-1][(width-1)/2-1]   = TILE.DOOR_HOR_LEFT
            room[height-1][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            room[height-1][(width-1)/2+1]   = TILE.DOOR_HOR_RIGHT
        }
        
        return room
    }
}