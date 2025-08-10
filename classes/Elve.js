import Enemy from './Enemy.js'

export default class Elve extends Enemy {
    constructor() {
        super(100, 0.04, 'lightgreen');
    }
}