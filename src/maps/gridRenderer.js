/**
 * gridRenderer.js
 * Renders the map grid, blocked tiles, and tower spots using RenderSurface.
 * Platform-agnostic: uses RenderSurface, not Canvas directly.
 */

class GridRenderer {
  /**
   * @param {RenderSurface} renderSurface
   */
  constructor(renderSurface) {
    this.renderSurface = renderSurface;
  }

    /** 
     * Initialize the GridRenderer
    */
  async initialize() {
    console.log('✅ GridRenderer initialized');
  }

  /**
   * Render the grid for the current map
   * @param {Object} mapConfig
   */
  render(mapConfig) {
    const { cols, rows, tileSize, gridColor, blocked, blockedColor, towerSpots, towerSpotColor, background } = mapConfig;

    // Draw background
    this.renderSurface.drawRect(0, 0, cols * tileSize, rows * tileSize, background || '#222244');

    // Draw grid lines
    for (let x = 0; x <= cols; x++) {
      this.renderSurface.drawLine(
        x * tileSize, 0,
        x * tileSize, rows * tileSize,
        gridColor || '#444466', 1
        );
    }
    for (let y = 0; y <= rows; y++) {
      this.renderSurface.drawLine(
        0, y * tileSize,
        cols * tileSize, y * tileSize,
        gridColor || '#444466', 1
        );
    }

    // Draw blocked tiles
    blocked.forEach(({ x, y }) => {
        this.renderSurface.drawRect(
        x * tileSize, y * tileSize, tileSize, tileSize,
        blockedColor || '#FF3333', { opacity: 0.5 }
        );
    });

    // Draw tower spots
    towerSpots.forEach(({ x, y }) => {
        this.renderSurface.drawCircle(
        x * tileSize + tileSize / 2,
        y * tileSize + tileSize / 2,
        tileSize * 0.3,
        towerSpotColor || '#FFD700', { opacity: 0.7 }
        );
    });
  }
}

export default GridRenderer;