import StaticScene from './static'

export default class DeadScene extends StaticScene {
   
    constructor() {
        super('dead-scene', './assets/dead-scene.png', 1, 'start-scene')      
    }
}