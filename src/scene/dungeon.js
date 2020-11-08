import {Scene} from 'phaser'
import TILE from '../model/tiles'
import Player from '../model/player'
import {Dungeon, TOP, BOTTOM, LEFT, RIGHT, WALL, DOOR, UNKNOWN} from '../model/dungeon'

export default class DungeonScene extends Scene {
   
    constructor(config) {
        super(config);
        this.map = []
    }

    preload () {        
        this.load.image("tiles", "../assets/tileset/default.png")
        this.load.image("player", "../assets/player.png")
    }

    create () {
        this.dungeon = Dungeon.create('foo', 3, 3);                
        let dungeonTiles = this.makeDungeonTiles(this.dungeon, 25, 25)

        const dungeonTileMap = this.make.tilemap({ data: dungeonTiles, tileWidth: 24, tileHeight: 24 });
        const tiles = dungeonTileMap.addTilesetImage("tiles");
        this.dungeonLayer = dungeonTileMap.createStaticLayer(0, tiles, 0, 0);
        this.dungeonLayer.setCollisionBetween(1, 115);

        var dungeonContainer = this.add.container(600, 600);
        dungeonContainer.add(this.dungeonLayer)

        var shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.beginPath();
        shape.fillRect(0, 0, 600, 600);        
        
        dungeonContainer.setMask(shape.createGeometryMask());        

        this.player = new Player(this, 200, 200);
        this.physics.add.collider(this.player, this.dungeonLayer);

        this.makeDungeonGraphic('dkey', this.dungeon, {width:190, height: 190})
        this.map = this.add.sprite(605, 5, 'dkey').setOrigin(0,0)
    }

    update(){
        
       this.map.x = this.cameras.main.worldView.x+605
       this.map.y = this.cameras.main.worldView.y+5

    }

    makeDungeonGraphic(key, dungeon, opts={}){
        
        const graphics = this.make.graphics({x: 0, y: 0});
        const color_wall = opts.colorWall | 0xff0000
        const color_door = opts.colorDoor || 0x330000
        const width = opts.width || 100
        const height = opts.height || 100

        const ph = height/dungeon.getRoomsTall()
        const pw = width/dungeon.getRoomsWide()

        const spacer = 1
        graphics.beginPath()

        for(let row = 0; row < dungeon.getRoomsTall(); row++){
            for(let col = 0; col < dungeon.getRoomsWide(); col++){
                let doors =  dungeon.getRoom(col, row).doors
                
                graphics
                    .lineStyle(1, doors[TOP] == WALL ? color_wall : color_door)
                    .moveTo(col*pw+spacer, row*ph+spacer)
                    .lineTo((col+1)*pw-spacer, row*ph+spacer)
                    .lineStyle(1, doors[BOTTOM] == WALL ? color_wall : color_door)
                    .moveTo(col*pw+spacer, (row+1)*ph-spacer)
                    .lineTo((col+1)*pw-spacer, (row+1)*ph-spacer)
                    .lineStyle(1, doors[LEFT] == WALL ? color_wall : color_door)
                    .moveTo(col*pw+spacer, row*ph+spacer)
                    .lineTo(col*pw+spacer, (row+1)*ph-spacer)
                    .lineStyle(1, doors[RIGHT] == WALL ? color_wall : color_door)
                    .moveTo((col+1)*pw-spacer, row*ph+spacer)
                    .lineTo((col+1)*pw-spacer, (row+1)*ph-spacer)
            }
        }

        return graphics.strokePath().generateTexture(key, width, height);
    }

    makeDungeonTiles(dungeon, width, height){
        const tiles = new Array(dungeon.getRoomsTall() * height)
        for(let i = 0; i < tiles.length; i++){
            tiles[i] = new Array(dungeon.getRoomsWide() * width)
        }

        for(let i = 0; i < dungeon.getRoomsWide(); i++){
            for(let j = 0; j < dungeon.getRoomsTall(); j++){
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