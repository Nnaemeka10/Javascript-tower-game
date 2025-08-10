import Enemy from './Enemy.js'

export default class Goblin extends Enemy {
    constructor() {
        super(100, 0.02, 'green');
    }
}