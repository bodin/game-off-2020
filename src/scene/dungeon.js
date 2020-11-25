import {Scene} from 'phaser'
import TILE from '../model/tiles'
import Player from '../sprites/player'
import Hero from '../sprites/hero'
import Pillar from '../sprites/pillar'

import MapSprite from '../sprites/map'
import {Dungeon, TOP, BOTTOM, LEFT, RIGHT, DOOR} from '../model/dungeon'
import * as C from '../model/constants'

export default class DungeonScene extends Scene {
   
    constructor() {        
        super('dungeon-scene')
        this.playerRoom = undefined
        this.heroRoom = undefined
        this.gameOver = undefined
    }

    preload () {        
        this.load.image("tiles", "./assets/tileset/dungeon.png")
        this.load.image("pillar", "./assets/pillar.png")

        this.load.spritesheet("player", "./assets/player.png", {
            frameWidth: 32,
            frameHeight: 32
        })            
        this.load.spritesheet("hero", "./assets/hero.png", {
            frameWidth: 32,
            frameHeight: 32
        })   
    }

    create () {
        this.gameOver = undefined
        this.heroRoom = undefined
        this.gameOver = undefined

        this.dungeon = Dungeon.create('foo', C.COLUMNS, C.ROWS);                
        let dungeonTiles = this.makeDungeonTiles(this.dungeon, C.ROOM_TILE_WIDTH, C.ROOM_TILE_HEIGHT)

        const dungeonTileMap = this.make.tilemap({ data: dungeonTiles, tileWidth: C.TILE_WIDTH, tileHeight: C.TILE_HEIGHT });
        const tiles = dungeonTileMap.addTilesetImage("tiles");        
        this.dungeonLayer = dungeonTileMap.createStaticLayer(0, tiles, 0, 0);
        this.dungeonLayer.setCollision([
            TILE.CORNER_TOP_LEFT,
            TILE.CORNER_BOTTOM_LEFT,
            TILE.CORNER_TOP_RIGHT,
            TILE.CORNER_BOTTOM_RIGHT,
            TILE.WALL_BOTTOM,
            TILE.WALL_TOP,
            TILE.WALL_LEFT,
            TILE.WALL_RIGHT,
        ]);

        this.dungeonContainer = this.add.container(C.ROOM_WIDTH, C.ROOM_HEIGHT);
        this.dungeonContainer.add(this.dungeonLayer)

        this.maskShape = this.make.graphics()
            .fillStyle(0xffffff)
            .beginPath()
            .fillRect(0, 0, C.ROOM_WIDTH, C.ROOM_HEIGHT)
            .generateTexture('mask', C.ROOM_WIDTH, C.ROOM_HEIGHT).generateTexture()

        this.dungeonContainer.setMask(this.maskShape.createGeometryMask());

        this.playerRoom = this.dungeon.getRoom(0, 0)   
        this.player = new Player(this, 200, 200, 'player');        
        this.physics.add.collider(this.player, this.dungeonLayer);

        this.heroRoom = this.dungeon.getRoom(C.COLUMNS-1, C.ROWS-1)   
        this.hero = new Hero(this, 200, 200, 'hero');
        this.physics.add.collider(this.hero, this.dungeonLayer);

        this.physics.add.collider(this.player, this.hero, this.heDead.bind(this));
      
        this.pillars = new Map()
        for(let i = 0; i < C.PILLARS; i++){
            let room = this.dungeon.getRoom(Math.floor(C.COLUMNS * Math.random()), Math.floor(C.ROWS * Math.random()))
            while(this.pillars.has(room.id)){
                room = this.dungeon.getRoom(Math.floor(C.COLUMNS * Math.random()), Math.floor(C.ROWS * Math.random()))
            }
            let pillar = new Pillar(this, 'pillar', room);
            this.pillars.set(room.id, pillar)
            this.physics.add.collider(this.player, pillar, this.crumble.bind(this));
        }

        this.map = new MapSprite(this, C.ROOM_WIDTH + C.MAP_SPACER, C.MAP_SPACER)

        this.cameras.main.fadeIn(1000, 0, 0, 0)
    }

    heroNextRoom() {        
        this.heroRoom = this.hero.nextRoom(this.dungeon, this.playerRoom, this.heroRoom)        
    }

    crumble(player, pillar){
        this.pillars.delete(pillar.room.id)
        pillar.destroy()
        if(this.pillars.size == 0){
            this.cameras.main.fadeOut(1000, 0, 0, 0)
            
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.start('win-scene')
            })
        } else{
            this.checkHeroNextRoom(false)
        }
    }
    heDead(player, hero){
        if (!this.gameOver) {
            player.canMove = false
            hero.canMove = false
            hero.alpha = 0.2
            player.play("player-explode");
            player.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, (() => {
                player.setFrame(14);              
                this.cameras.main.fadeOut(1000, 0, 0, 0)
                        
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.scene.start('dead-scene')
                })
            }).bind(this));
            this.gameOver = true;
        }        
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
    checkHeroNextRoom(force){
        if(this.pillars.length == 1){
            if(this.heroTimer){
                this.heroTimer.remove();
            }
            if(!this.heroTimerCrazy){
                this.heroTimerCrazy = this.time.addEvent({
                    delay: C.SPEED_HERO_ROOM_SWITCH_CRAZY,
                    callback: this.heroNextRoom,
                    callbackScope: this,
                    loop: true
                });                 
            }

        }else if(2*this.pillars.size < C.PILLARS) {
            if(!this.heroTimer){
                this.heroTimer = this.time.addEvent({
                    delay: C.SPEED_HERO_ROOM_SWITCH_NORMAL,                
                    callback: this.heroNextRoom,
                    callbackScope: this,
                    loop: true
                });                 
            }   
        }else if(force){
            this.heroNextRoom(); 
        }
    }

    changeRoomAnimimation(){
        let room = this.playerRoom

        this.cameras.main.fadeOut(250, 0, 0, 0, (camera, progress) => {
            this.player.canMove = false
            if (progress === 1) {
                
                this.checkHeroNextRoom(true);

                this.maskShape.x = room.column * C.ROOM_WIDTH
                this.maskShape.y = room.row * C.ROOM_HEIGHT

                // Change camera boundaries when fade out complete.
                this.cameras.main.setBounds(room.column * C.ROOM_WIDTH,
                    room.row * C.ROOM_HEIGHT,
                    C.ROOM_WIDTH,
                    C.ROOM_HEIGHT,
                    true)

                // Fade back in with new boundareis.
                this.cameras.main.fadeIn(100, 0, 0, 0, (camera, progress) => {
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
            [TILE.WALL_LEFT,TILE.BLANK,TILE.WALL_RIGHT],
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
                if(i != 0 && i != height-1 && Math.random() > 0.9){
                    if(Math.random() > 0.95){
                        tiles[i][k] = TILE.BLANK_SPECIAL
                    }else{
                        tiles[i][k] = TILE.BLANK_TEXTURE
                    }
                }
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