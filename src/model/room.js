export default class Room {
    constructor(id, col, row){
        this.id = id
        
        this.column = col;
        this.row = row;

        this.doors = []
    }
    toString(){
        "[" + this.id + "] " + this.doors.reduce(function(result, s) {result + "|" + s})
    }
}