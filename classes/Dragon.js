import Enemy from './Enemy.js'

export default class Dragon extends Enemy {
    constructor() {
        super(50, 0.04, 'cyan');
    }
}