export default class Room {
    constructor(id){
        this.id = id
        this.doors = []
    }
    toString(){
        "[" + id + "] " + this.doors.reduce(function(result, s) {result + "|" + s})
    }
}