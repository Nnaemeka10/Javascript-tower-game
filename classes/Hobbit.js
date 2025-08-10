import Enemy from './Enemy.js'

export default class Hobbit extends Enemy {
    constructor() {
        super(50, 0.02, 'orange');
    }
}