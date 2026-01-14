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
    console.log('🎨 TowerRenderer initializing...');
    this.isInitialized = true;
    console.log('✅ TowerRenderer initialized');
  }

  /**
   * Render all towers
   * @param {Array} towers - Array of towers to render
   */
  render(towers) {
    if (!this.isInitialized) return;

    for (const tower of towers) {
      this.renderTower(tower);

      // Show range if debugging
      if (this.showRange) {
        this.renderRangeIndicator(tower);
      }
    }
  }

  /**
   * Render single tower
   * @private
   */
  renderTower(tower) {
    // Skip if off-screen (bounds checking)
    if (!this.renderSurface.isCircleInBounds(tower.x, tower.y, tower.width)) {
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
      2
    );

    // Inner fill (slightly lighter)
    this.renderSurface.drawRect(
      -size / 2 + 2,
      -size / 2 + 2,
      size - 4,
      size - 4,
      config.color,
      0,
      true
    );

    // Selection highlight
    if (tower.isSelected) {
      this.renderSurface.drawRect(
        -size / 2 - 4,
        -size / 2 - 4,
        size + 8,
        size + 8,
        '#00FF00',
        3
      );

      // Corner indicators
      const offset = 6;
      this.renderSurface.drawRect(-size / 2 - offset, -size / 2 - offset, 4, 4, '#00FF00', 0, true);
      this.renderSurface.drawRect(size / 2 + offset - 4, -size / 2 - offset, 4, 4, '#00FF00', 0, true);
      this.renderSurface.drawRect(-size / 2 - offset, size / 2 + offset - 4, 4, 4, '#00FF00', 0, true);
      this.renderSurface.drawRect(size / 2 + offset - 4, size / 2 + offset - 4, 4, 4, '#00FF00', 0, true);
    }

    // Tower type emoji
    this.renderSurface.drawText(
      0,
      0,
      config.emoji,
      16,
      'center',
      '#000000',
      'Arial'
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
      config.secondaryColor,
      0,
      true
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
      2,
      false,
      0.6
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
      '#333333',
      0,
      true
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
      healthColor,
      0,
      true
    );

    // Border
    this.renderSurface.drawRect(
      x - barWidth / 2,
      y,
      barWidth,
      barHeight,
      '#FFFFFF',
      1,
      false
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
      config.color,
      0,
      true
    );

    // Level text
    this.renderSurface.drawText(
      x,
      y,
      `L${tower.level}`,
      10,
      'center',
      '#FFFFFF',
      'Arial Bold'
    );
  }

  /**
   * Draw cooldown indicator
   * @private
   */
  drawCooldownIndicator(x, y, tower) {
    const cooldownPercent = tower.getCooldownPercentage();

    if (cooldownPercent < 1) {
      // Cooldown ring
      const radius = tower.width / 2 + 4;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (cooldownPercent * 2 * Math.PI);

      // Draw arc
      this.renderSurface.save();
      this.renderSurface.translate(x, y);

      // Cooldown arc
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
      config.color,
      0,
      true
    );

    // Range outline
    this.renderSurface.setAlpha(0.3);
    this.renderSurface.drawCircle(
      tower.x,
      tower.y,
      tower.range,
      config.color,
      1,
      false
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