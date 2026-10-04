/**
 * Tower Renderer
 * Renders all towers using RenderSurface for platform independence.
 * 
 * Features:
 * - Type-specific visuals
 * - Range indicators
 * - Health bars and level display
 * - Selection highlighting
 * - Cooldown indicators
 * - Direction/aiming visual
 */

import { TOWER_CONFIG } from './towerConfig.js';

class TowerRenderer {
  constructor(renderSurface) {
    this.renderSurface = renderSurface;
    this.isInitialized = false;

    // Rendering options
    this.showRange = false; // Toggle with debug
    this.showHealth = true;
    this.showLevel = true;
    this.showAim = true;
    this.showCooldown = true;

    // Animation states
    this.shootPulseTime = 0;
    this.shootPulseDuration = 0.2;
  }

  /**
   * Initialize renderer
   */
  async initialize() {
    console.log('TowerRenderer initializing...');
    this.isInitialized = true;
    console.log('TowerRenderer initialized');
  }

/**
   * Render all towers
   * @param {Array} towers - Array of towers to render
   * @param {GameState} gameState
   * @param {MapManager} mapManager
   * @param {TowerManager} towerManager
   */
  render(towers, gameState, mapManager, towerManager) {
    if (!this.isInitialized) return;

    for (const tower of towers) {
      this.renderTower(tower);

      if (this.showRange) {
        this.renderRangeIndicator(tower);
      }
    }

    // Render placement preview (Ghost)
    if (gameState && mapManager && towerManager) {
      this.renderPlacementPreview(gameState, mapManager, towerManager);
    }
  }

  /**
   * Render ghost preview for tower placement
   * @private
   */
  renderPlacementPreview(gameState, mapManager, towerManager) {
    const selectedType = gameState.getSelectedTowerType();
    const hoveredCell = gameState.getHoveredGridCell();
    
    if (!selectedType || !hoveredCell) return;
    // Ignore hover outside the map (letterbox areas)
    if (!mapManager.isInBounds(hoveredCell.gridX, hoveredCell.gridY)) return;

    const config = TOWER_CONFIG[selectedType];
    if (!config) return;

    const currentMap = mapManager.getCurrentMap();
    const tileSize = currentMap.tileSize;
    
    const worldX = hoveredCell.gridX * tileSize + tileSize / 2;
    const worldY = hoveredCell.gridY * tileSize + tileSize / 2;

    // Validate placement
    const isBlocked = mapManager.isBlocked(hoveredCell.gridX, hoveredCell.gridY);
    const isOnPath  = mapManager.isOnPath(hoveredCell.gridX, hoveredCell.gridY);
    const isOccupied = towerManager.getTowerAt(hoveredCell.gridX, hoveredCell.gridY);
    
    const canAfford = gameState.canAfford(config.cost);
    const canPlace = !isBlocked && !isOnPath && !isOccupied && canAfford;
    const color = canPlace ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';

    // Draw Range Circle
    this.renderSurface.save();
    this.renderSurface.setAlpha(0.3);
    this.renderSurface.drawCircle(worldX, worldY, config.range, color, { stroke: true, strokeColor: color, strokeWidth: 2 });
    this.renderSurface.restore();

    // Draw Ghost Tower
    this.renderSurface.save();
    this.renderSurface.setAlpha(0.7);
    this.renderSurface.translate(worldX, worldY);
    
    const size = config.width;
    this.renderSurface.drawRect(-size / 2, -size / 2, size, size, color, { stroke: true, strokeWidth: 2 });
    
    this.renderSurface.drawText(
      config.emoji,
      0,
      0,
      { font: '16px Arial', color: '#FFFFFF', align: 'center', baseline: 'middle' }
    );
    
    this.renderSurface.restore();
  }

  /**
   * Render single tower
   * @private
   */
  renderTower(tower) {
    // Skip if off-screen (bounds checking)
    // World-bounds culling (correct under letterbox zoom)
   const { width: W, height: H } = this.renderSurface.getWorldDimensions();
    const pad = 40;
    if (
      tower.x - pad > W || tower.y - pad > H ||
      tower.x + tower.width + pad < 0 || tower.y + tower.height + pad < 0
    ) {
      return;
    }

    // Save render state
    this.renderSurface.save();

    // Translate to tower position
    this.renderSurface.translate(tower.x, tower.y);

    // Draw base tower
    this.drawTowerBase(tower);

    // Draw barrel/aiming direction
    if (this.showAim) {
      this.drawTowerAim(tower);
    }

    // Draw effects
    if (tower.hasShot) {
      this.drawShootPulse(tower);
    }

    // Restore render state
    this.renderSurface.restore();

    // Draw UI elements (not affected by rotation/translate)
    this.drawTowerUI(tower);
  }

  /**
   * Draw tower base and body
   * @private
   */
  drawTowerBase(tower) {
    const config = TOWER_CONFIG[tower.type];
    const size = tower.width;

    // Main tower body
    this.renderSurface.drawRect(
      -size / 2,
      -size / 2,
      size,
      size,
      config.color,
      { stroke: true, strokeWidth: 2 }
    );

    // Inner fill (slightly lighter)
    this.renderSurface.drawRect(
      -size / 2 + 2,
      -size / 2 + 2,
      size - 4,
      size - 4,
      config.color
    );

    // Selection highlight
    if (tower.isSelected) {
      this.renderSurface.drawRect(
        -size / 2 - 4,
        -size / 2 - 4,
        size + 8,
        size + 8,
        '#00FF00',
        { stroke: true, strokeWidth: 3 }
      );

      // Corner indicators
      const offset = 6;
      this.renderSurface.drawRect(-size / 2 - offset, -size / 2 - offset, 4, 4, '#00FF00');
      this.renderSurface.drawRect(size / 2 + offset - 4, -size / 2 - offset, 4, 4, '#00FF00');
      this.renderSurface.drawRect(-size / 2 - offset, size / 2 + offset - 4, 4, 4, '#00FF00');
      this.renderSurface.drawRect(size / 2 + offset - 4, size / 2 + offset - 4, 4, 4, '#00FF00');
    }

    // Tower type emoji
    this.renderSurface.drawText(
      config.emoji,
      0,
      0,
      { font: '16px Arial', color: '#000000', align: 'center', baseline: 'middle' }
    );
  }

  /**
   * Draw tower aiming direction (barrel/laser)
   * @private
   */
  drawTowerAim(tower) {
    if (!tower.targetEnemy || tower.targetEnemy.isDead) return;

    const config = TOWER_CONFIG[tower.type];
    const size = tower.width / 2;

    // Rotate to face target
    this.renderSurface.rotate(tower.rotation);

    // Draw barrel as a line
    this.renderSurface.drawLine(
      0,
      0,
      size * 1.5,
      0,
      config.color,
      3
    );

    // Aiming indicator dot
    this.renderSurface.drawCircle(
      size * 1.5,
      0,
      2,
      config.secondaryColor
    );
  }

  /**
   * Draw shoot pulse effect
   * @private
   */
  drawShootPulse(tower) {
    const pulseSize = tower.width + 6;
    const config = TOWER_CONFIG[tower.type];

    this.renderSurface.drawCircle(
      0,
      0,
      pulseSize,
      config.secondaryColor,
      { stroke: true, strokeWidth: 2, opacity: 0.6 }
    );
  }

  /**
   * Draw tower UI (health bar, level, cooldown)
   * Not translated/rotated
   * @private
   */
  drawTowerUI(tower) {
    const size = tower.width;
    const baseY = tower.y + size / 2 + 10;

    // Health bar
    if (this.showHealth) {
      this.drawHealthBar(tower.x, baseY, tower);
    }

    // Level display
    if (this.showLevel) {
      this.drawLevelDisplay(tower.x, baseY + 12, tower);
    }

    // Cooldown indicator
    if (this.showCooldown) {
      this.drawCooldownIndicator(tower.x, tower.y, tower);
    }
  }

  /**
   * Draw health bar
   * @private
   */
  drawHealthBar(x, y, tower) {
    const barWidth = 30;
    const barHeight = 4;

    // Background
    this.renderSurface.drawRect(
      x - barWidth / 2,
      y,
      barWidth,
      barHeight,
      '#333333'
    );

    // Health fill (color based on percentage)
    const healthPercent = tower.getHealthPercentage();
    const fillWidth = barWidth * healthPercent;
    let healthColor = '#00FF00'; // Green

    if (healthPercent < 0.5) healthColor = '#FFFF00'; // Yellow
    if (healthPercent < 0.25) healthColor = '#FF0000'; // Red

    this.renderSurface.drawRect(
      x - barWidth / 2,
      y,
      fillWidth,
      barHeight,
      healthColor
    );

    // Border
    this.renderSurface.drawRect(
      x - barWidth / 2,
      y,
      barWidth,
      barHeight,
      'transparent',
      { stroke: true, strokeColor: '#FFFFFF', strokeWidth: 1 }
    );
  }

  /**
   * Draw level display
   * @private
   */
  drawLevelDisplay(x, y, tower) {
    const config = TOWER_CONFIG[tower.type];

    // Level badge background
    this.renderSurface.drawCircle(
      x,
      y,
      8,
      config.color
    );

    // Level text
    this.renderSurface.drawText(
      `L${tower.level}`,
      x,
      y,
      { font: 'bold 10px Arial', color: '#FFFFFF', align: 'center', baseline: 'middle' }
    );
  }

  /**
   * Draw cooldown indicator
   * @private
   */
  drawCooldownIndicator(x, y, tower) {
    if (tower.shotCooldown <= 0) return;

    // Calculate remaining cooldown (1 = just fired, 0 = ready to fire)
    const remainingCooldown = tower.shotCooldown / tower.config.fireRate;
    const radius = tower.width / 2 + 4;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (remainingCooldown * 2 * Math.PI);

    // Draw arc
    this.renderSurface.save();
    this.renderSurface.translate(x, y);

    this.drawArc(
      0,
      0,
      radius,
      startAngle,
      endAngle,
      '#00FFFF',
      2
    );

    this.renderSurface.restore();
  }

  /**
   * Draw range indicator (for debugging)
   * @private
   */
  drawRangeIndicator(tower) {
    const config = TOWER_CONFIG[tower.type];

    // Range circle (semi-transparent)
    this.renderSurface.save();
    this.renderSurface.setAlpha(0.1);

    this.renderSurface.drawCircle(
      tower.x,
      tower.y,
      tower.range,
      config.color
    );

    // Range outline
    this.renderSurface.setAlpha(0.3);
    this.renderSurface.drawCircle(
      tower.x,
      tower.y,
      tower.range,
      config.color,
      { stroke: true, strokeWidth: 1 }
    );

    this.renderSurface.restore();
  }

  /**
   * Draw arc (for cooldown indicator)
   * @private
   */
  drawArc(x, y, radius, startAngle, endAngle, color, lineWidth) {
    const steps = 32;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + ((endAngle - startAngle) / steps) * i;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      points.push({ x: px, y: py });
    }

    // Draw polyline
    for (let i = 0; i < points.length - 1; i++) {
      this.renderSurface.drawLine(
        points[i].x,
        points[i].y,
        points[i + 1].x,
        points[i + 1].y,
        color,
        lineWidth
      );
    }
  }

  /**
   * Enable/disable range display
   * @param {boolean} show - Show range
   */
  setShowRange(show) {
    this.showRange = show;
    console.log(`${show ? '✓' : '✗'} Tower range indicators`);
  }

  /**
   * Enable/disable health display
   * @param {boolean} show - Show health
   */
  setShowHealth(show) {
    this.showHealth = show;
  }

  /**
   * Enable/disable level display
   * @param {boolean} show - Show level
   */
  setShowLevel(show) {
    this.showLevel = show;
  }

  /**
   * Get render snapshot for debugging
   * @returns {Object}
   */
  getSnapshot() {
    return {
      initialized: this.isInitialized,
      showRange: this.showRange,
      showHealth: this.showHealth,
      showLevel: this.showLevel,
      showAim: this.showAim,
      showCooldown: this.showCooldown,
    };
  }
}

export default TowerRenderer;