Based on my analysis of your tower defense game, here are the areas where you can make improvements and handle things better:

## Code Quality & Architecture

Global State Management - You have scattered global variables (gamePaused, gameRunning, isDragging, etc.). Consider consolidating into a single GameState object.

Hardcoded Values - Magic numbers like 40 (tile size), 100 (spawn interval), 20 (lives) scattered throughout. Use constants more consistently.

Error Handling - Many try-catch blocks are empty or don't properly log errors; improve error recovery strategies.

Module Organization - manageEnemies.js and manageProjectiles.js export multiple items; could be more organized.

## Game Logic & Mechanics

Tower Selection Feedback - No visual feedback when a tower is selected; add highlights or borders.

Tower Type System - Currently hardcoded to the first tower type only; needs proper tower selection UI.

Upgrade System - Towers don't have upgrade mechanics; need implementation for tower enhancements.

Wave Difficulty Scaling - Waves likely don't increase in difficulty (enemy count, health, speed).

Money Feedback - When earning/spending money, no feedback animation showing the amount.

## User Experience

Alert Messages - Using alert() for game over/errors; replace with in-game UI notifications.

Button Feedback - Buttons show emoji but lack hover states or animation feedback.

Tutorial/Help - No in-game tutorial or help system for new players.

Keyboard Shortcuts - Only Escape and Space work; more shortcuts would help (e.g., number keys for tower types).

## Performance & Memory

Event Listener Cleanup - canvas.removeEventListener() has a typo (removeEventListner); fix and ensure proper cleanup.

Animation Loop - requestAnimationFrame catches errors but always requests next frame; consider graceful stopping.

Collision Detection - Likely inefficient for many towers/enemies; could use spatial partitioning.

## Missing Features

Tower Range Visualization - No preview of tower range when hovering/dragging.

Pause UI State - Game elements aren't visually paused (maybe darken or blur).

Score/Stats System - No tracking of high scores, kills, money earned, waves completed.

Sound Effects - No audio (you noted this in your TODO).

## Data Structure Improvements

Tower/Enemy Arrays - Direct array manipulation; consider using Map/Set for O(1) lookups by ID.

Path Following - Enemies likely iterate through path array; could cache path segments for performance.

Wave Configuration - Wave data seems to be in WaveManager; should be externalized to JSON/config files.

## Drag & Drop Issues

Drag Preview - Commented-out drag image preview; complete this feature for better UX.

Drag Validation Feedback - Green/red boxes appear but no text explanation of why placement fails.

Multi-tower Drag - Can only drag one tower type; no selection UI for different tower types.

## Game Balance

Starting Budget - 500 money may not be well-balanced; no difficulty settings.

Spawn Rate - Fixed spawn interval; should vary per wave.


## Folder architecture
    src/
    ├── core/                    # Core game engine
    │   ├── GameEngine.js
    │   ├── GameState.js
    │   └── GameLoop.js
    ├── features/
    │   ├── towers/
    │   │   ├── Tower.js
    │   │   ├── towerConfig.js
    │   │   ├── towerManager.js
    │   │   └── towerRenderer.js
    │   ├── enemies/
    │   │   ├── Enemy.js
    │   │   ├── enemyManager.js
    │   │   └── enemyRenderer.js
    │   ├── projectiles/
    │   │   ├── Projectile.js
    │   │   ├── projectileManager.js
    │   │   └── projectileRenderer.js
    │   ├── waves/
    │   │   ├── WaveManager.js
    │   │   └── waveConfig.js
    │   ├── ui/
    │   │   ├── UIManager.js
    │   │   ├── uiRenderer.js
    │   │   └── eventHandlers.js
    │   └── economy/
    │       ├── MoneyManager.js
    │       └── economyConfig.js
    ├── map/
    │   ├── mapManager.js
    │   ├── pathRenderer.js
    │   ├── gridRenderer.js
    │   └── maps/
    │       ├── map1.js
    │       ├── map2.js
    │       └── mapConfig.js
    ├── utils/
    │   ├── constants.js
    │   ├── helpers.js
    │   ├── collision.js
    │   └── math.js
    ├── assets/
    │   ├── images/
    │   ├── sounds/
    │   └── data/
    └── main.js


    Great question — this is the **key architectural pivot**, so let’s be very concrete.

---

## Short answer (TL;DR)

👉 **The Render Surface does *not* live inside the GameEngine.**
👉 It lives **outside**, at the platform boundary, and is **injected into the engine**.

Think of it as:
**Platform → RenderSurface → GameEngine → Game logic**

---

## Correct mental model

```
[ Web / React Native / WebView ]
            ↓
     RenderSurface (adapter)
            ↓
        GameEngine
            ↓
   Managers / State / Rules
```

The engine **talks to an abstract renderer**, not Canvas, not DOM, not RN.

---

## Where it goes in your project (concrete)

### 1️⃣ Create a `rendering/` layer (new folder)

```
src/
  core/
    GameEngine.js
    GameLoop.js
    GameState.js

  rendering/
    RenderSurface.js      ← interface / contract
    CanvasSurface.js      ← web implementation
    SkiaSurface.js        ← future RN implementation

  features/
  maps/
```

---

## 2️⃣ Define the RenderSurface contract

**`rendering/RenderSurface.js`**

```js
export default class RenderSurface {
  clear() {
    throw new Error('Not implemented');
  }

  drawRect(x, y, w, h, color) {}
  drawSprite(sprite, x, y, w, h) {}
  drawText(text, x, y, style) {}
  resize(width, height) {}
}
```

This file has **ZERO DOM code**.

---

## 3️⃣ Implement Canvas version (Web)

**`rendering/CanvasSurface.js`**

```js
import RenderSurface from './RenderSurface.js';

export default class CanvasSurface extends RenderSurface {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  drawText(text, x, y, style = {}) {
    this.ctx.fillStyle = style.color ?? '#fff';
    this.ctx.font = style.font ?? '16px sans-serif';
    this.ctx.fillText(text, x, y);
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  }
}
```

**This is the only place `canvas` exists.**

---

## 4️⃣ Inject it into GameEngine

### Change GameEngine constructor

```js
constructor(renderSurface) {
  this.renderSurface = renderSurface;
}
```

❌ Remove:

```js
this.canvas
this.ctx
document.getElementById
```

---

## 5️⃣ Update renderers to use RenderSurface

**Before**

```js
this.ctx.fillRect(...)
```

**After**

```js
this.surface.drawRect(...)
```

Example:

```js
class TowerRenderer {
  constructor(surface) {
    this.surface = surface;
  }

  render(towers) {
    towers.forEach(t =>
      this.surface.drawRect(t.x, t.y, t.width, t.height, '#0f0')
    );
  }
}
```

---

## 6️⃣ Wire everything together (Web entry point)

**`main.js`**

```js
const canvas = document.getElementById('game');
const surface = new CanvasSurface(canvas);

const engine = new GameEngine(surface);
await engine.initialize();
engine.start();
```

---

## Why this placement is correct

✔ GameEngine stays **pure logic**
✔ RenderSurface is the **platform adapter**
✔ You can later do:

```js
new SkiaSurface(...)
new WebGLSurface(...)
new HeadlessSurface() // tests
```

with **zero engine changes**

---

## What NOT to do ❌

* ❌ Don’t let renderers import Canvas or RN libs
* ❌ Don’t put RenderSurface inside GameEngine
* ❌ Don’t let managers render anything
* ❌ Don’t branch logic like `if (isWeb)`

---

## Reality check (important)

You **do not need to do this now** to ship.

**Best path for you:**

1. WebView release first (fast)
2. Gradually introduce RenderSurface
3. Swap renderer later

Your engine is already **90% ready** for this refactor.

---

If you want next, I can:

* Refactor **one of your existing renderers** fully as an example
* Show **exact files to touch and in what order**
* Map **Canvas → React Native Skia equivalents**

Just tell me 👍































### for the dimensioning
Perfect! Since resizing happens infrequently, **Option 1 is definitely the right choice** - remove canvas dimensions from GameState entirely.

## What to Do:

### 1. Remove from GameState.js

```javascript
// REMOVE these lines:
❌ this.canvasWidth = 0;
❌ this.canvasHeight = 0;

// REMOVE these methods:
❌ setCanvasDimensions(width, height) { ... }
❌ getCanvasDimensions() { ... }
```

### 2. Get dimensions directly from RenderSurface when needed

```javascript
// Wherever you handle resize (probably in GameEngine or eventHandlers.js)
window.addEventListener('resize', () => {
  const { width, height } = this.renderSurface.getDimensions();
  
  // Resize the surface
  this.renderSurface.resize(width, height);
  
  // Update any managers that need to know
  this.managers.ui.handleResize(width, height);
});
```

### 3. Add `getDimensions()` to your RenderSurface

```javascript
// rendering/RenderSurface.js
export default class RenderSurface {
  getDimensions() {
    throw new Error('getDimensions() must be implemented');
  }
  
  clear() { ... }
  drawRect() { ... }
  // ... other methods
}
```

```javascript
// rendering/CanvasSurface.js
export default class CanvasSurface extends RenderSurface {
  getDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }
}
```

---

## Why This is Better:

✅ **No duplicate data** - Dimensions live only in RenderSurface  
✅ **GameState stays pure** - Only manages game logic, not rendering info  
✅ **Platform-agnostic** - Works with any RenderSurface implementation  
✅ **Less to maintain** - No syncing needed between GameState and canvas  

Since it's only called on resize (rare), there's **zero performance concern**. Clean architecture wins! 🎯











## Questions in game STate and answers
1. concept of returning a function
2. concept of functions and variables having the same name
3. why did spendmoney() return a value and decreaselives() does not
4. why do this instead of just returning this.stats return { ...this.stats }

Great, this is a solid piece of code. I’ll answer **each question directly**, using **your code** as the reference point and explaining the *why*, not just the *what*.

---

## 1. **Concept of returning a function**

### Where it appears in your code

```js
subscribe(callback) {
    this.listeners.push(callback);

    // return unsubscribe function
    return () => {
        this.listeners = this.listeners.filter(listener => listener != callback)
    };
}
```

### What this means

A function **can return another function**. In JavaScript, functions are *first-class citizens* — they can be:

* stored in variables
* passed as arguments
* **returned from other functions**

Here, `subscribe()` returns an **unsubscribe function**.

### Why this is powerful

This pattern gives you **controlled cleanup**.

Usage example:

```js
const unsubscribe = gameState.subscribe((event, data) => {
    console.log(event, data);
});

// later...
unsubscribe(); // removes the listener
```

### Conceptually

* `subscribe()` → *registers* a listener
* Returned function → *undoes* that registration

This is a classic **Observer pattern** and is also used heavily in:

* React (`useEffect` cleanup)
* Event emitters
* Streams / subscriptions

👉 **Key idea**:

> Returning a function lets the caller decide *when* and *if* cleanup happens.

---

## 2. **Concept of functions and variables having the same name**

### Example from your code

```js
this.isGameRunning = false;

setGameRunning(value) { ... }

isGameRunning () {
    return this.isGameRunning
}
```

### What’s going on here

You have:

* A **property**: `this.isGameRunning`
* A **method**: `isGameRunning()`

They live in **different namespaces**:

* `this.isGameRunning` → object property
* `this.isGameRunning()` → method on the prototype

So JavaScript can distinguish them.

### Is this a good idea?

⚠️ **No — this is a bad practice in JS**, even though it technically works.

#### Why?

1. **Readability**

```js
gameState.isGameRunning      // value
gameState.isGameRunning()    // function
```

Easy to confuse.

2. **Shadowing risk**
   If later someone does:

```js
gameState.isGameRunning = true;
```

You’ve now **overwritten the method reference mentally**, even if not technically.

### Better practice

Use **getters** or naming conventions:

```js
getIsGameRunning() { return this.isGameRunning; }
```

or

```js
get gameRunning() { return this._isGameRunning; }
```

👉 **Key idea**:

> JS allows it, but clarity beats cleverness.

---

## 3. **Why `spendMoney()` returns a value but `decreaseLives()` does not**

### `spendMoney()`

```js
spendMoney(amount){
    if(this.money < amount){
        return false;
    }
    this.money -= amount;
    return true;
}
```

### `decreaseLives()`

```js
decreaseLives(amount){
    this.lives -= amount;

    if (this.lives <= 0) {
        this.setGameOver(true);
    }
}
```

### The real reason (design intent)

#### `spendMoney()` → **Decision-based**

The caller needs to know **if the action succeeded**.

Typical usage:

```js
if (gameState.spendMoney(towerCost)) {
    placeTower();
} else {
    showInsufficientFunds();
}
```

So returning `true | false` makes sense.

---

#### `decreaseLives()` → **State-enforced**

There is **no alternative flow** for the caller.

* Lives decrease
* Game over is handled internally

Caller doesn’t need to react immediately:

```js
gameState.decreaseLives(1);
// game state will self-manage game over
```

Returning a value would add **no useful decision point**.

👉 **Key idea**:

> Return values are useful when the *caller must decide something*.
> Side-effect-only functions don’t need to return.

---

## 4. **Why do this instead of just returning `this.stats`**

### Your code

```js
getStatistics(){
    return { ...this.stats };
}
```

### Why not this?

```js
return this.stats;
```

### The critical concept: **Encapsulation & Immutability**

If you returned `this.stats` directly:

```js
const stats = gameState.getStatistics();
stats.totalEnemiesKilled = 999999; // 💥 internal state corrupted
```

You’ve now allowed **external mutation** of internal game state.

---

### What `{ ...this.stats }` does

This creates a **shallow copy**.

* Caller gets a snapshot
* Internal state remains protected

```js
const stats = gameState.getStatistics();
stats.totalEnemiesKilled++; // safe
```

Original `this.stats` remains unchanged.

---

### Why this matters in games

* Prevents accidental bugs
* Ensures **single source of truth**
* Makes debugging predictable
* Supports replay, save/load, snapshots

👉 **Key idea**:

> Never expose mutable internal state directly.

---

## Summary (mental model)

| Concept                       | Why it’s used                            |
| ----------------------------- | ---------------------------------------- |
| Returning a function          | Controlled cleanup (unsubscribe pattern) |
| Same name variable & function | Allowed but **bad practice**             |
| `spendMoney()` returns value  | Caller needs success/failure             |
| `decreaseLives()` no return   | Game logic is self-contained             |
| `{ ...this.stats }`           | Protects internal state from mutation    |

---

If you want, next we can:

* Refactor this to **idiomatic modern JS**
* Convert flags to **getters/setters**
* Make this **Redux-like**
* Or review it as a **game engine architecture**

Just tell me 👍























































/**
 * GameEngine
 * Central orchestrator for all game systems and logic.
 * 
 * Architecture:
 * - Receives RenderSurface (platform adapter) via dependency injection
 * - Coordinates all managers and renderers
 * - Implements game logic (collisions, win/lose conditions)
 * - Maintains separation of concerns (logic ≠ rendering)
 * 
 * The engine is PURE LOGIC - no Canvas, DOM, or platform code.
 */

import GameState from './GameState.js';
import GameLoop from './GameLoop.js';

// Import all managers
import TowerManager from '../features/towers/towerManager.js';
import EnemyManager from '../features/enemies/enemyManager.js';
import ProjectileManager from '../features/projectiles/projectileManager.js';
import WaveManager from '../features/waves/WaveManager.js';
import MoneyManager from '../features/economy/MoneyManager.js';
import UIManager from '../features/ui/UIManager.js';

// Import all renderers
import TowerRenderer from '../features/towers/towerRenderer.js';
import EnemyRenderer from '../features/enemies/enemyRenderer.js';
import ProjectileRenderer from '../features/projectiles/projectileRenderer.js';
import GridRenderer from '../maps/gridRenderer.js';
import PathRenderer from '../maps/pathRenderer.js';
import UIRenderer from '../features/ui/uiRenderer.js';

// Import utilities
import { setupEventListeners } from '../features/ui/eventHandlers.js';
import { GAME_CONFIG, CANVAS_CONFIG } from '../utils/constants.js';

class GameEngine {
  /**
   * Create the game engine
   * @param {RenderSurface} renderSurface - Abstract rendering surface (injected)
   */
  constructor(renderSurface) {
    if (!renderSurface) {
      throw new Error('❌ GameEngine requires a RenderSurface instance');
    }

    // Platform adapter (abstract, platform-agnostic)
    this.renderSurface = renderSurface;

    // Core systems
    this.gameState = new GameState();
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    // Initialize all managers
    this.managers = {
      tower: new TowerManager(),
      enemy: new EnemyManager(),
      projectile: new ProjectileManager(),
      wave: new WaveManager(),
      money: new MoneyManager(),
      ui: new UIManager(),
    };

    // Initialize all renderers (each receives renderSurface)
    this.renderers = {
      grid: new GridRenderer(this.renderSurface),
      path: new PathRenderer(this.renderSurface),
      tower: new TowerRenderer(this.renderSurface),
      enemy: new EnemyRenderer(this.renderSurface),
      projectile: new ProjectileRenderer(this.renderSurface),
      ui: new UIRenderer(this.renderSurface),
    };

    // State
    this.isInitialized = false;

    console.log('✅ GameEngine created (renderSurface injected)');
  }

  /**
   * Initialize the game engine and all systems
   * Called once at startup
   */
  async initialize() {
    try {
      console.log('🎬 Initializing GameEngine...');

      // Initialize game state
      this.gameState.initialize();

      // Initialize all managers (order matters - dependencies first)
      await this.managers.money.initialize();
      await this.managers.tower.initialize(this.renderSurface);
      await this.managers.enemy.initialize();
      await this.managers.projectile.initialize();
      await this.managers.wave.initialize();
      await this.managers.ui.initialize();

      // Initialize all renderers
      await this.renderers.grid.initialize();
      await this.renderers.path.initialize();
      await this.renderers.tower.initialize();
      await this.renderers.enemy.initialize();
      await this.renderers.projectile.initialize();
      await this.renderers.ui.initialize();

      // Setup event listeners (from UI layer)
      setupEventListeners(this);

      // Subscribe to state changes for external updates
      this.subscribeToStateChanges();

      this.isInitialized = true;
      console.log('✅ GameEngine initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize GameEngine:', error);
      this.gameState.setGameError(true);
      throw error;
    }
  }

  /**
   * Subscribe to game state changes for reactive updates
   */
  subscribeToStateChanges() {
    this.gameState.subscribe((eventType, data) => {
      switch (eventType) {
        case 'gameRunningChanged':
          console.log(`Game running: ${data}`);
          break;

        case 'gamePausedChanged':
          console.log(`Game paused: ${data}`);
          break;

        case 'gameOverChanged':
          if (data) {
            console.log('💀 Game Over!');
          }
          break;

        case 'gameWonChanged':
          if (data) {
            console.log('🎉 You won!');
          }
          break;

        case 'moneyChanged':
          // Update UI with new money
          break;

        case 'livesChanged':
          // Update UI with new lives
          break;

        default:
          break;
      }
    });
  }

  /**
   * Start the game loop
   */
  start() {
    if (!this.isInitialized) {
      console.error('❌ GameEngine not initialized. Call initialize() first.');
      return;
    }

    this.gameState.setGameRunning(true);
    this.gameLoop.start();
    console.log('🎮 Game started');
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.gameState.setGameRunning(false);
    this.gameLoop.stop();
    console.log('⏹️ Game stopped');
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    const isPaused = this.gameState.isGamePaused();
    this.gameState.setGamePaused(!isPaused);
  }

  /**
   * Update game logic (called every frame by GameLoop)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Don't update if game is not running
    if (!this.gameState.isGameRunning()) return;

    // Don't update logic if paused (but keep rendering)
    if (this.gameState.isGamePaused()) return;

    try {
      // Update game state performance metrics
      this.gameState.setDeltaTime(deltaTime);
      this.gameState.setFPS(this.gameLoop.getFPS());

      // Update systems in dependency order
      // 1. Wave manager (spawns enemies)
      this.managers.wave.update(deltaTime);

      // 2. Enemy manager (moves enemies)
      this.managers.enemy.update(deltaTime);

      // 3. Tower manager (finds targets)
      this.managers.tower.update(deltaTime);

      // 4. Projectile manager (moves projectiles)
      this.managers.projectile.update(deltaTime);

      // 5. Collision detection (projectiles hit enemies)
      this.checkProjectileEnemyCollisions();

      // 6. Check if enemies reached end
      this.checkEnemiesReachedEnd();

      // 7. Check win/lose conditions
      this.checkGameConditions();

      // 8. UI updates (last, so it has latest state)
      this.managers.ui.update(deltaTime);

    } catch (error) {
      console.error('❌ Error during game update:', error);
      this.gameState.setGameError(true);
      // Continue running despite error
    }
  }

  /**
   * Render the game (called every frame by GameLoop)
   * Uses RenderSurface for all drawing (platform-agnostic)
   */
  render() {
    try {
      // Clear canvas with background color
      this.renderSurface.clear(GAME_CONFIG.backgroundColor);

      // Reset performance stats for this frame
      this.renderSurface.resetStats?.();

      // Apply camera transform (if enabled)
      this.renderSurface.applyCameraTransform?.();

      // Render in order (bottom to top, background to foreground)
      // 1. Grid (debug - optional)
      if (GAME_CONFIG.showDebugGrid) {
        this.renderSurface.drawDebugGrid(CANVAS_CONFIG.tileSize);
      }

      // 2. Game map background
      this.renderers.grid.render();
      this.renderers.path.render();

      // 3. Game entities
      this.renderers.tower.render(this.managers.tower.getTowers());
      this.renderers.enemy.render(this.managers.enemy.getEnemies());
      this.renderers.projectile.render(this.managers.projectile.getProjectiles());

      // Restore camera transform
      this.renderSurface.restoreCameraTransform?.();

      // 4. UI (above everything, not affected by camera)
      this.renderers.ui.render(this.gameState, this.managers);

      // 5. Debug info (if enabled)
      if (GAME_CONFIG.showDebugInfo) {
        this.renderSurface.drawDebugInfo();
      }

    } catch (error) {
      console.error('❌ Error during render:', error);
      // Continue rendering next frame
    }
  }

  // ============================================
  // COLLISION DETECTION
  // ============================================

  /**
   * Check for collisions between projectiles and enemies
   * Applies damage and removes projectiles on hit
   */
  checkProjectileEnemyCollisions() {
    const projectiles = this.managers.projectile.getProjectiles();
    const enemies = this.managers.enemy.getEnemies();

    for (const projectile of projectiles) {
      if (projectile.hasHit) continue; // Already hit

      for (const enemy of enemies) {
        if (enemy.isDead) continue; // Dead enemies don't collide

        // Simple AABB collision detection
        if (this.checkCollision(projectile, enemy)) {
          // Apply damage
          const damage = projectile.damage;
          const damageType = projectile.damageType || 'normal';
          enemy.takeDamage(damage, damageType);

          // Mark projectile as hit
          projectile.hit();

          // Award money if enemy died
          if (enemy.isDead) {
            this.managers.money.addMoney(enemy.bounty);
            this.gameState.incrementEnemiesKilled(1);
            this.gameState.addScore(enemy.bounty);
          }

          // Only one hit per projectile
          break;
        }
      }
    }
  }

  /**
   * AABB (Axis-Aligned Bounding Box) collision detection
   * Simple rectangular collision check
   * @private
   */
  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  // ============================================
  // GAME CONDITION CHECKING
  // ============================================

  /**
   * Check if enemies reached the end of the path
   */
  checkEnemiesReachedEnd() {
    const enemies = this.managers.enemy.getEnemies();

    for (const enemy of enemies) {
      if (enemy.hasReachedEnd()) {
        // Decrease lives
        this.gameState.decreaseLives(1);

        // Remove the enemy
        this.managers.enemy.removeEnemy(enemy);

        // Notify UI
        console.log(`👿 Enemy escaped! Lives: ${this.gameState.getLives()}`);
      }
    }
  }

  /**
   * Check win/lose/end game conditions
   */
  checkGameConditions() {
    const lives = this.gameState.getLives();
    const waves = this.managers.wave;
    const enemies = this.managers.enemy.getEnemies();

    // Check lose condition
    if (lives <= 0 && !this.gameState.isGameOver()) {
      this.endGame(false, 'No lives remaining');
      return;
    }

    // Check win condition
    if (
      waves.isAllWavesComplete() &&
      enemies.length === 0 &&
      !this.gameState.isGameWon()
    ) {
      this.endGame(true, 'All waves completed!');
      return;
    }
  }

  /**
   * End the game (win or lose)
   * @private
   */
  endGame(won, reason) {
    if (won) {
      this.gameState.setGameWon(true);
      console.log(`🎉 ${reason}`);
    } else {
      this.gameState.setGameOver(true);
      console.log(`💀 ${reason}`);
    }

    this.stop();
  }

  // ============================================
  // GAME STATE MANAGEMENT
  // ============================================

  /**
   * Reset the game to initial state
   */
  reset() {
    console.log('🔄 Resetting game...');

    this.gameState.reset();
    this.managers.tower.clear();
    this.managers.enemy.clear();
    this.managers.projectile.clear();
    this.managers.wave.reset();
    this.managers.money.reset();
  }

  // ============================================
  // PUBLIC API (for external access)
  // ============================================

  /**
   * Get game state instance
   * @returns {GameState}
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Get a manager by name
   * @param {string} managerName - Manager name (tower, enemy, projectile, wave, money, ui)
   * @returns {Object|null}
   */
  getManager(managerName) {
    return this.managers[managerName] || null;
  }

  /**
   * Get a renderer by name
   * @param {string} rendererName - Renderer name
   * @returns {Object|null}
   */
  getRenderer(rendererName) {
    return this.renderers[rendererName] || null;
  }

  /**
   * Get render surface
   * @returns {RenderSurface}
   */
  getRenderSurface() {
    return this.renderSurface;
  }

  /**
   * Get game loop
   * @returns {GameLoop}
   */
  getGameLoop() {
    return this.gameLoop;
  }

  /**
   * Get complete engine state snapshot (for debugging)
   * @returns {Object}
   */
  getSnapshot() {
    return {
      initialized: this.isInitialized,
      gameState: this.gameState.getSnapshot(),
      gameLoop: this.gameLoop.getPerformanceReport(),
      renderSurface: this.renderSurface.getSnapshot(),
      managers: {
        towers: this.managers.tower.getTowers().length,
        enemies: this.managers.enemy.getEnemies().length,
        projectiles: this.managers.projectile.getProjectiles().length,
        currentWave: this.managers.wave.getCurrentWave(),
        money: this.gameState.getMoney(),
      },
    };
  }
}

export default GameEngine;