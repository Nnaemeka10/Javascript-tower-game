import Dragon from "../../../classes/enemy/enemies/Dragon.js";
import Dwarve from "../../../classes/enemy/enemies/Dwarve.js";
import Elve from "../../../classes/enemy/enemies/Elve.js";
import Goblin from "../../../classes/enemy/enemies/Goblin.js";
import Hobbit from "../../../classes/enemy/enemies/Hobbit.js";

export const ENEMY_CONFIG = {
  Dwarve: {
    class: Dwarve,
    baseHealth: 200,
    speed: 0.01,
    color: 'brown',
  },
  Goblin: {
    class: Goblin,
    baseHealth: 100,
    speed: 0.02,
    color: 'green',
   
  },
  Dragon: {
    class: Dragon,
    baseHealth: 75,
    speed: 0.04,
    color: 'cyan',
  },
  Elve: {
    class: Elve,
    baseHealth: 100,
    speed: 0.04,
    color: 'lightgreen',
  },
  Hobbit: {
    class: Hobbit,
    baseHealth: 50,
    speed: 0.02,
    color: 'orange',
  }
};
