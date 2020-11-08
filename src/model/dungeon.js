import Room from './room'

const TOP = 0
const LEFT = 1
const RIGHT = 2
const BOTTOM = 3

const WALL = 0
const DOOR = 1
const UNKNOWN = -1

class Dungeon {    
  
    constructor(id, col, row){
        this.id = id
        this.columns = col
        this.rows = row
        this.rooms = []
    }

    getColumns(){
        return this.columns
    }

    getRows(){
        return this.rows
    }

    getRoom(col, row){
        return this.rooms[row * this.cols + col]
    }

    static create(id, columns, rows){
        let dungeon = new Dungeon(id, columns, rows)
        let rooms = new Array(rows)

        let doors = new Array(4)
        for(let row = 0; row < rows; row++){
            rooms[row] = new Array(columns)
            for(let col = 0; col < columns; col++){
                
                doors[TOP] = row == 0 ? WALL : rooms[row-1][col].doors[BOTTOM];
                doors[BOTTOM] = row == rows-1 ? WALL : UNKNOWN;
                doors[LEFT] = col == 0 ? WALL : rooms[row][col-1].doors[RIGHT];
                doors[RIGHT] = col == columns-1 ? WALL : UNKNOWN;

                rooms[row][col] = Dungeon.createRoom(col + "-" + row, col, row, doors)
            }
        }
        
        dungeon.rooms = rooms.flat()

        return dungeon
    }

    static createRoom(id, col, row, doors=[UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN]){
        const result = new Room(id, col, row);
        const door_probability = .8
        result.doors = [...doors]
        
        if(doors[TOP] == UNKNOWN)       result.doors[0] = Math.random() > door_probability ? WALL : DOOR
        if(doors[LEFT] == UNKNOWN)      result.doors[1] = Math.random() > door_probability ? WALL : DOOR
        if(doors[RIGHT] == UNKNOWN)     result.doors[2] = Math.random() > door_probability ? WALL : DOOR
        if(doors[BOTTOM] == UNKNOWN)    result.doors[3] = Math.random() > door_probability ? WALL : DOOR

        return result
    }
}

export {Dungeon, TOP, BOTTOM, LEFT, RIGHT, WALL, DOOR, UNKNOWN}