import {TOP, BOTTOM, LEFT, RIGHT, WALL} from '../model/dungeon'
import * as C from '../model/constants'

const MARKER_SIZE=20

export default class MapSprite extends Phaser.GameObjects.Container {

    constructor(scene, x, y) {
        super(scene);
        this.scene = scene

        scene.add.existing(this);

        this.scene.textures.remove('map') 
        this.makeMapGraphic('map', scene.dungeon, C.MAP_WIDTH, C.MAP_HEIGHT)
        this.makeMarkerSprite('boss-marker', MARKER_SIZE, 0xff0000)
        this.makeMarkerSprite('player-marker', MARKER_SIZE, 0x00ff00)
        
        let _x = C.MAP_ROOM_WIDTH/2 - (MARKER_SIZE/2), _y = C.MAP_ROOM_HEIGHT/2 - (MARKER_SIZE/2)

        this.map = this.scene.make.sprite({x:0,y:0,key:'map'}).setOrigin(0,0)
        this.hero = this.scene.make.sprite({x:_x,y:_y,key:'boss-marker'}).setOrigin(0,0)
        this.player = this.scene.make.sprite({x:_x,y:_y,key:'player-marker'}).setOrigin(0,0)

        this.pillars = []

        let distance = (C.MAP_WIDTH - C.MAP_SPACER*2) / this.scene.pillars.size
        _y = C.MAP_SPACER + C.MAP_HEIGHT

        for(let i = 0; i < C.PILLARS; i++){
            _x = C.MAP_SPACER + (i * distance) +  distance/2 - (MARKER_SIZE/2)

            this.scene.textures.remove('pillar-marker-' + i) 
            this.makeMarkerSprite('pillar-marker-' + i, MARKER_SIZE, 0xffffff)
            this.pillars.push(this.scene.make.sprite({x:_x,y:_y,key:'pillar-marker-' + i}).setOrigin(0,0).setAlpha(.25))           
        }
        this.add(this.map).add(this.hero).add(this.player).add(this.pillars)
       

        this.playerId = undefined
        this.heroId = undefined
        
    }

    preUpdate(time, delta){

        if(!this.scene.render) return

        this.setX(this.scene.cameras.main.worldView.x + C.ROOM_WIDTH + C.MAP_SPACER)
        this.setY(this.scene.cameras.main.worldView.y + C.MAP_SPACER)

        for(let i = 0; i < this.pillars.length; i++){
            if(i < C.PILLARS - this.scene.pillars.size){
                this.pillars[i].setAlpha(1)
            }
        }

        let heroRoom = this.scene.hero.room
        if(this.heroId != heroRoom.id) {
            this.heroId = heroRoom.id
            this.scene.tweens.add({
                targets: this.hero, 
                ease: 'EaseIOut',       
                duration: 100,            
                delay:75,
                x: heroRoom.column * C.MAP_ROOM_WIDTH + C.MAP_ROOM_WIDTH/2 - (MARKER_SIZE/2),
                y: heroRoom.row * C.MAP_ROOM_HEIGHT + C.MAP_ROOM_HEIGHT/2 - (MARKER_SIZE/2)
            })
        }

        let playerRoom = this.scene.player.room
        if(this.playerId != playerRoom.id) {
            this.playerId = playerRoom.id
            this.scene.tweens.add({
                           targets: this.player, 
                           ease: 'EaseIOut',       
                           duration: 100,            
                           delay:75,
                           x: playerRoom.column * C.MAP_ROOM_WIDTH + C.MAP_ROOM_WIDTH/2 - (MARKER_SIZE/2),
                           y: playerRoom.row * C.MAP_ROOM_HEIGHT + C.MAP_ROOM_HEIGHT/2 - (MARKER_SIZE/2)
                       })
        }
    }
    
    makeMarkerSprite(key, width, color){
        const graphics = this.scene.make.graphics({x: 0, y: 0});

        graphics
        .beginPath()
        .lineStyle(2, color)
        .arc(width/2,width/2,width/2,Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360))
        .strokePath()

        return graphics.generateTexture(key, width, width);
    }

    makeMapGraphic(key, dungeon, width, height){
        
        const graphics = this.scene.make.graphics({x: 0, y: 0});
        const color_wall = 0xff0000
        const color_door = 0x330000

        const ph = height/dungeon.getRows()
        const pw = width/dungeon.getColumns()

        const spacer = 1    

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