import Archer from "../classes/tower/towers/archer.js";
import Cannon from "../classes/tower/towers/cannon.js";
import Flamethrower from "../classes/tower/towers/flamethrower.js";

export const TOWER_CONFIG = {
    Archer: {
        class: Archer,
        cost: 100,
        range: 2,
        fireRate: 40,
        damage: 10,
        color: 'blue',
        highligtColor: 'lightblue'
    },

    Cannon: {
        class: Cannon,
        cost: 300,
        range: 1.5,  
        fireRate: 80,
        damage: 30,
        color: 'gray',
        highligtColor: 'lightgray'
    },

    Flamethrower: {
        class: Flamethrower,
        cost: 150,
        range: 3,
        fireRate: 50,
        damage: 10,
        color: 'red',
        highligtColor: 'lightcoral'
    }
};