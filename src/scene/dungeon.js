import {Scene} from 'phaser'
import TILE from '../model/tiles'

export default class DemoScene extends Scene {
    constructor(config) {
        super(config);
    }

    preload () {
        this.load.image("tiles", "../assets/tileset/default.png");
    }

    create () {
        const room_layout = this.makeRoom([1,1,-1,-1])
        // When loading from an array, make sure to specify the tileWidth and tileHeight
        const map = this.make.tilemap({ data: this.makeRoomTiles(23, 23, room_layout), tileWidth: 24, tileHeight: 24 });
        const tiles = map.addTilesetImage("tiles");
        const layer = map.createStaticLayer(0, tiles, 0, 0);
    }
    makeRoom(allowDoors=[-1,-1,-1,-1]){
        let doors = [...allowDoors]
        
        if(allowDoors[0] == -1) doors[0] = Math.random() > .9 ? 1 : 0
        if(allowDoors[1] == -1) doors[1] = Math.random() > .9 ? 1 : 0
        if(allowDoors[2] == -1) doors[2] = Math.random() > .9 ? 1 : 0
        if(allowDoors[3] == -1) doors[3] = Math.random() > .9 ? 1 : 0

        return doors
    }
    makeRoomTiles(width, height, layout = [0,0,0,0]){

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
        if(layout[0] == 0){
            room[0][(width-1)/2-1]   = TILE.DOOR_HOR_LEFT
            room[0][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            room[0][(width-1)/2+1]   = TILE.DOOR_HOR_RIGHT
        }

        //left
        if(layout[1] == 0){
            room[(height-1)/2-1][0]   = TILE.DOOR_VER_TOP
            room[(height-1)/2][0]     = TILE.DOOR_VER_MIDDLE
            room[(height-1)/2+1][0]   = TILE.DOOR_VER_BOTTOM
        }

        //right
        if(layout[2] == 0){
            room[(height-1)/2-1][width-1]   = TILE.DOOR_VER_TOP
            room[(height-1)/2][width-1]     = TILE.DOOR_VER_MIDDLE
            room[(height-1)/2+1][width-1]   = TILE.DOOR_VER_BOTTOM
        }

        //bottom
        if(layout[3] == 0){
            room[height-1][(width-1)/2-1]   = TILE.DOOR_HOR_LEFT
            room[height-1][(width-1)/2]     = TILE.DOOR_HOR_MIDDLE
            room[height-1][(width-1)/2+1]   = TILE.DOOR_HOR_RIGHT
        }
        
        return room
    }
}