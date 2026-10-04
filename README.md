# Endless Tower Defence

A browser-based tower defence game built with native JavaScript ES modules, HTML, and CSS. Defend the path, manage your money, and survive increasingly difficult enemy waves.

## Features

- Grid-based `20 x 15` map with a winding enemy path and blocked tiles
- Responsive canvas rendering with camera scaling and device-pixel-ratio support
- Six tower types: Archer, Mage, Cannon, Frost, Alchemist, and Tesla
- Tower upgrades up to level 10, tower selling, range previews, and placement validation
- Distinct tower mechanics including area damage, slowing, poison damage-over-time, and chain lightning
- Five enemy types: Goblin, Dwarve, Elve, Hobbit, and Dragon
- Ten configured waves with progressive health, speed, and bounty scaling
- Starting resources of 500 money and 20 lives
- Game start, pause, reset, win, and game-over states
- Difficulty economy presets for easy, normal, and hard modes
- Platform-independent game logic separated from the browser rendering adapter

## Getting Started

1. Clone or download the repository.
2. Open `index.html` in a modern browser.
3. Select a tower from the shop, place it on a clear tile, and press **Start**.

No build step or package installation is required for the browser game. When using a local development server, serve the repository root so the `/src/main.js` module path resolves correctly.

## Controls

| Key            | Action                                                        |
| -------------- | ------------------------------------------------------------- |
| `Space`        | Start, pause/resume, or restart after a win/loss              |
| `Escape` / `P` | Pause the game                                                |
| `R`            | Reset the game                                                |
| `1`-`9`        | Select an available tower type                                |
| `U`            | Upgrade the selected tower                                    |
| `S`            | Sell the selected tower                                       |
| `D`            | Print game and performance diagnostics to the browser console |

Towers can also be selected and placed using the controls in the browser UI. A green preview indicates a valid placement; a red preview indicates a path, blocked, occupied, out-of-bounds, or unaffordable tile.

## Testing

Run the Node.js test suite from the repository root:

```bash
node --test
```

The placement tests cover canvas dimensions, camera coordinate conversion, map validation, tower placement and payment, ghost previews, and the click-to-place flow.

## Project Structure

```text
index.html                         Browser entry point
stylw.css                          Game layout and UI styles
src/main.js                        Browser bootstrap and keyboard shortcuts
src/core/                           Game engine, state, and loop
src/features/economy/               Money and difficulty configuration
src/features/enemies/               Enemy entities, waves, and rendering
src/features/projectiles/           Projectile entities and collision flow
src/features/towers/                Tower entities, configuration, and upgrades
src/features/ui/                    UI state, rendering, and event handlers
src/maps/                           Map configuration and map/path rendering
src/rendering/                      RenderSurface abstraction and WebSurface adapter
src/utils/                          Constants, collision, math, and helpers
tests/                              Node.js tests and browser API setup
```

The `GameEngine` coordinates managers and renderers while keeping game logic independent of the DOM and Canvas APIs. `WebSurface` supplies the browser-specific rendering implementation.

## Credits

Created by Nnaemeka10
