import {TOP, BOTTOM, LEFT, RIGHT, WALL} from './dungeon'


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

export default class Map extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, frame) {
        super(scene, x, y, frame);
        this.scene = scene

        scene.add.existing(this);
        
        this.makeMapGraphic('map', scene.dungeon, {width:MAP_WIDTH, height: MAP_HEIGHT})
        this.setTexture('map');

        this.setOrigin(0,0)
    }

    preUpdate(time, delta){
        this.x = this.scene.cameras.main.worldView.x + ROOM_WIDTH + MAP_SPACER
        this.y = this.scene.cameras.main.worldView.y + MAP_SPACER
    }


    makeMapGraphic(key, dungeon, opts={}){
        
        const graphics = this.scene.make.graphics({x: 0, y: 0});
        const color_wall = opts.colorWall | 0xff0000
        const color_door = opts.colorDoor || 0x330000
        const width = opts.width || 100
        const height = opts.height || 100

        const ph = height/dungeon.getRows()
        const pw = width/dungeon.getColumns()

        const spacer = 1
        graphics.beginPath()

        for (let i = 0; i < dungeon.rooms.length; i++) {
            const room = dungeon.rooms[i]
            let col = room.column, row = room.row
            let doors =  room.doors
            
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
        return graphics.generateTexture(key, width, height);
    }
}