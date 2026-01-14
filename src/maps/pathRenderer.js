/**
 * pathRenderer.js
 * Renders the enemy path for the current map using RenderSurface.
 * Draws lines and waypoints for visual clarity.
 */

class PathRenderer {
  /**
   * @param {RenderSurface} renderSurface
   */
  constructor(renderSurface) {
    this.renderSurface = renderSurface;
  }

    /** 
     * Initialize the PathRenderer
    */
  async initialize() {
    console.log('✅ PathRenderer initialized');
  }

  /**
   * Render the path for the current map
   * @param {Object} mapConfig
   */
  render(mapConfig) {
    const { path, tileSize, pathColor, spawn, end } = mapConfig;

    if (!path || path.length < 2) return;

    // Draw path lines
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      this.renderSurface.drawLine(
        a.x * tileSize + tileSize / 2, a.y * tileSize + tileSize / 2,
        b.x * tileSize + tileSize / 2, b.y * tileSize + tileSize / 2,
        { strokeStyle: pathColor || '#00FF00', lineWidth: 4 }
      );
    }

    // Draw waypoints
    path.forEach(({ x, y }, idx) => {
      this.renderSurface.drawCircle(
        x * tileSize + tileSize / 2,
        y * tileSize + tileSize / 2,
        tileSize * 0.18,
        {
          fillStyle: idx === 0 ? '#00CCFF' : (idx === path.length - 1 ? '#FF3333' : pathColor || '#00FF00'),
          globalAlpha: 0.9
        }
      );
    });

    // Draw spawn and end markers
    if (spawn) {
      this.renderSurface.drawRect(
        spawn.x * tileSize + tileSize * 0.2,
        spawn.y * tileSize + tileSize * 0.2,
        tileSize * 0.6, tileSize * 0.6,
        { fillStyle: '#00CCFF', globalAlpha: 0.8 }
      );
    }
    if (end) {
      this.renderSurface.drawRect(
        end.x * tileSize + tileSize * 0.2,
        end.y * tileSize + tileSize * 0.2,
        tileSize * 0.6, tileSize * 0.6,
        { fillStyle: '#FF3333', globalAlpha: 0.8 }
      );
    }
  }
}

export default PathRenderer;