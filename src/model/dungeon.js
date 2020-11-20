import * as C from './constants'
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
        if(col < 0 || col >= C.COLUMNS) return undefined
        if(row < 0 || row >= C.ROWS) return undefined
        return this.rooms[row * this.columns + col]
    }

    static create(id, columns, rows){
        let dungeon = new Dungeon(id, columns, rows)
        let rooms = new Array(rows)

        let doors = new Array(4)
        for(let row = 0; row < rows; row++){
            rooms[row] = new Array(columns)
            for(let col = 0; col < columns; col++){
                
                doors[C.TOP] = row == 0 ? C.WALL : rooms[row-1][col].doors[C.BOTTOM];
                doors[C.BOTTOM] = row == rows-1 ? C.WALL : C.UNKNOWN;
                doors[C.LEFT] = col == 0 ? C.WALL : rooms[row][col-1].doors[C.RIGHT];
                doors[C.RIGHT] = col == columns-1 ? C.WALL : C.UNKNOWN;

                rooms[row][col] = Dungeon.createRoom(col + "-" + row, col, row, doors)
            }
        }
        
        dungeon.rooms = rooms.flat()

        return dungeon.adjust()
    }

    static createRoom(id, col, row, doors=[C.UNKNOWN,C.UNKNOWN,C.UNKNOWN,C.UNKNOWN]){
        const result = new Room(id, col, row);
        const door_probability = .5
        result.doors = [...doors]
        
        if(doors[C.TOP] == C.UNKNOWN)       result.doors[0] = Math.random() > door_probability ? C.WALL : C.DOOR
        if(doors[C.LEFT] == C.UNKNOWN)      result.doors[1] = Math.random() > door_probability ? C.WALL : C.DOOR
        if(doors[C.RIGHT] == C.UNKNOWN)     result.doors[2] = Math.random() > door_probability ? C.WALL : C.DOOR
        if(doors[C.BOTTOM] == C.UNKNOWN)    result.doors[3] = Math.random() > door_probability ? C.WALL : C.DOOR

        return result
    }

    adjust(){
        console.log(this.rooms)
        let roomMap = new Map()
        this.rooms.forEach( function(r){roomMap.set(r.id, r)})
        let allRoomMap = new Map([...roomMap])

        let roomGroups = []

        while(roomMap.size > 0){
            let toVisit = [...roomMap.values()]
            let group = this.adjustInternal(toVisit.pop(), new Map())

            roomGroups.push(group)

            group.forEach(function(value, key) {
                roomMap.delete(key)
            })
        }
        console.log("Segments", [...roomGroups])

        
        while(roomGroups.length > 1){
            let sizeBefore = roomGroups.length;
            let groupToExpand = roomGroups[0]
            let expanded = this.expandGroup(groupToExpand)            
            for(let i = 1; i < roomGroups.length; i++){
                let groupToCheck = roomGroups[i];
                let intersection = new Set([...expanded.keys()].filter(x => groupToCheck.has(x)))
                if(intersection.size > 0){
                    console.log("ORIGINAL", roomGroups[0])
                    console.log("EXPANDED", expanded)
                    console.log("CHECKING", groupToCheck)
                    console.log("INTERSECTION", intersection)
                    roomGroups.splice(i, 1);
                    roomGroups[0] = new Map([...roomGroups[0], ...groupToCheck])
                    let selected = intersection.values().next().value;
                    console.log("SELECTED", selected)
                    let room1 = expanded.get(selected);
                    let room2 = allRoomMap.get(selected);
                    console.log("MERGE", room1, room2)
                    console.log("LEFT", [...roomGroups])
                    if(room1 && room2){
                        if(room1.column == room2.column){
                            if(room1.row > room2.row){
                                //room1 below room2
                                room1.doors[C.TOP] = C.DOOR
                                room2.doors[C.BOTTOM] = C.DOOR
                                console.log("top bottom")
                            }else{
                                //room1 above room2
                                room1.doors[C.BOTTOM] = C.DOOR
                                room2.doors[C.TOP] = C.DOOR
                                console.log("bottom top")
                            }
                        } else {
                            if(room1.column > room2.column){
                                //room1 right of room2
                                room1.doors[C.LEFT] = C.DOOR
                                room2.doors[C.RIGHT] = C.DOOR
                                console.log("left right")
                            }else{
                                //room1 left of room2
                                room1.doors[C.RIGHT] = C.DOOR
                                room2.doors[C.LEFT] = C.DOOR
                                console.log("right left")
                            }
                        }
                    }
                }
            }
            
            if(sizeBefore == roomGroups.length) {
                console.log("Oops .... got some bad logic here")
                return this
            }
        }
        console.log(this.rooms)
        return this
    }
    expandGroup(groupToExpand){
        let expanded = new Map()
        
        for (let roomToExpand of groupToExpand.values()) {
          
            if(roomToExpand.doors[C.TOP] == C.WALL){
                let expand = this.getRoom(roomToExpand.column, roomToExpand.row-1)
                if(expand && !groupToExpand.has(expand.id)) {
                    console.log("EXPANDING TOP", expand.id, roomToExpand)
                    expanded.set(expand.id, roomToExpand)                
                }
            }
            if(roomToExpand.doors[C.BOTTOM] == C.WALL){
                let expand = this.getRoom(roomToExpand.column, roomToExpand.row+1)
                if(expand && !groupToExpand.has(expand.id)) {
                    console.log("EXPANDING BOTTOM", expand.id, roomToExpand)
                    expanded.set(expand.id, roomToExpand)
                }
            }
            if(roomToExpand.doors[C.LEFT] == C.WALL){
                let expand = this.getRoom(roomToExpand.column-1, roomToExpand.row)
                if(expand && !groupToExpand.has(expand.id)) {
                    console.log("EXPANDING LEFT", expand.id, roomToExpand)
                    expanded.set(expand.id, roomToExpand)
                }
            }
            if(roomToExpand.doors[C.RIGHT] == C.WALL){
                let expand = this.getRoom(roomToExpand.column+1, roomToExpand.row)
                if(expand && !groupToExpand.has(expand.id)) {
                    console.log("EXPANDING RIGHT", expand.id, roomToExpand)
                    expanded.set(expand.id, roomToExpand)
                }
            }
        }
        return expanded;
    }
    adjustInternal(currentRoom, visitedRooms){
        if(visitedRooms.has(currentRoom.id)) return visitedRooms;

        visitedRooms.set(currentRoom.id, currentRoom);

        if(currentRoom.doors[C.TOP] == C.DOOR) {
            const nextRoom = this.getRoom(currentRoom.column, currentRoom.row-1);
            if(nextRoom){
                visitedRooms =  this.adjustInternal(nextRoom, visitedRooms);
            }
        }
        if(currentRoom.doors[C.BOTTOM] == C.DOOR) {
            const nextRoom = this.getRoom(currentRoom.column, currentRoom.row+1);
            if(nextRoom){
                visitedRooms =  this.adjustInternal(nextRoom, visitedRooms);
            }
        }
        if(currentRoom.doors[C.LEFT] == C.DOOR) {
            const nextRoom = this.getRoom(currentRoom.column-1, currentRoom.row);
            if(nextRoom){
                visitedRooms =  this.adjustInternal(nextRoom, visitedRooms);
            }
        }
        if(currentRoom.doors[C.RIGHT] == C.DOOR) {
            const nextRoom = this.getRoom(currentRoom.column+1, currentRoom.row);
            if(nextRoom){
                visitedRooms =  this.adjustInternal(nextRoom, visitedRooms);
            }
        }
        return visitedRooms
    }
}

export {Dungeon, TOP, BOTTOM, LEFT, RIGHT, WALL, DOOR, UNKNOWN}