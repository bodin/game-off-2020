import StaticScene from './static'

export default class StartScene extends StaticScene {
   
    constructor() {
        super('start-scene', './assets/start-scene.png', 16, 'dungeon-scene')      
    }
}