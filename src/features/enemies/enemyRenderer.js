/**
 * EnemyRenderer
 * Renders all enemies to the RenderSurface.
 * 
 * Responsibilities:
 * - Render enemy sprites/visuals
 * - Render health bars
 * - Render status effect indicators
 * - Render selection highlights
 * - Optimize rendering (bounds culling)
 * - Support debug visualization
 * 
 * Platform-agnostic: uses only RenderSurface methods.
 */

import { GAME_CONFIG } from '../utils/constants.js';

class EnemyRenderer {
  /**
   * Create enemy renderer
   * @param {RenderSurface} renderSurface - Rendering surface (injected)
   */
  constructor(renderSurface) {
    if (!renderSurface) {
      throw new Error('❌ EnemyRenderer requires a RenderSurface instance');
    }

    this.surface = renderSurface;

    // Configuration
    this.config = {
      healthBarHeight: 3,
      healthBarOffset: 2,
      statusEffectSize: 4,
      selectionBorderWidth: 2,
      selectionColor: '#00ff00',
      renderDebugBounds: false,
      renderHealthBars: true,
      renderStatusEffects: true,
    };

    // Asset cache (loaded during initialize)
    this.sprites = {};
    this.colors = {
      defaultEnemy: '#8B4513',
      healthBarBackground: '#333333',
      healthBarFill: '#00ff00',
      healthBarLow: '#ffff00',
      healthBarCritical: '#ff0000',
      selected: '#00ff00',
      statusEffects: {
        slow: '#6495ED',
        stun: '#FFD700',
        burn: '#FF4500',
        freeze: '#87CEEB',
      },
    };

    console.log('✅ EnemyRenderer created');
  }

  /**
   * Initialize renderer (load assets, etc.)
   */
  async initialize() {
    try {
      // Load enemy sprites here if using images
      // For now, we'll use colored shapes
      console.log('✅ EnemyRenderer initialized');
    } catch (error) {
      console.error('❌ Failed to initialize EnemyRenderer:', error);
      throw error;
    }
  }

  /**
   * Render all enemies
   * @param {Array<Enemy>} enemies - Array of enemy objects
   */
  render(enemies) {
    if (!enemies || enemies.length === 0) return;

    // Sort by path progress (render closest first, furthest last)
    const sortedEnemies = [...enemies].sort((a, b) => {
      return a.getPathProgress() - b.getPathProgress();
    });

    // Render each enemy
    for (const enemy of sortedEnemies) {
      // Skip if off-screen (optimization)
      if (!this.isEnemyVisible(enemy)) continue;

      this.renderEnemy(enemy);
    }
  }

  /**
   * Check if enemy is visible on screen (bounds checking)
   * @private
   */
  isEnemyVisible(enemy) {
    const padding = 50; // Render if within 50px of screen edge
    return this.surface.isRectInBounds(
      enemy.x - padding,
      enemy.y - padding,
      enemy.width + padding * 2,
      enemy.height + padding * 2
    );
  }

  /**
   * Render a single enemy
   * @private
   */
  renderEnemy(enemy) {
    this.surface.save();

    try {
      // Render enemy body
      this.renderEnemyBody(enemy);

      // Render health bar
      if (this.config.renderHealthBars) {
        this.renderHealthBar(enemy);
      }

      // Render status effect indicators
      if (this.config.renderStatusEffects) {
        this.renderStatusEffects(enemy);
      }

      // Render selection highlight (if selected)
      if (enemy.isSelected) {
        this.renderSelectionHighlight(enemy);
      }

      // Debug rendering
      if (this.config.renderDebugBounds) {
        this.renderDebugInfo(enemy);
      }

    } finally {
      this.surface.restore();
    }
  }

  /**
   * Render the enemy body (sprite or colored shape)
   * @private
   */
  renderEnemyBody(enemy) {
    const { x, y, width, height, type, opacity } = enemy;

    // Apply opacity based on status effects
    let displayOpacity = opacity;
    if (enemy.statusEffects.freeze.active) {
      displayOpacity = 0.7; // Freeze makes semi-transparent
    }

    // Get color based on enemy type
    const color = this.getEnemyColor(type);

    // For now, render as rectangle with rotation
    // TODO: Replace with sprite images when available
    this.surface.save();
    this.surface.setAlpha(displayOpacity);

    // Draw enemy as circle or rect based on type
    if (type === 'Goblin' || type === 'Hobbit') {
      // Small and quick - render as smaller circle
      this.surface.drawCircle(
        x + width / 2,
        y + height / 2,
        width / 2,
        color
      );
    } else if (type === 'Dragon') {
      // Large - render with border
      this.surface.drawRect(x, y, width, height, color, {
        stroke: true,
        strokeColor: '#ff8800',
        strokeWidth: 2,
      });
    } else {
      // Default rendering
      this.surface.drawRect(x, y, width, height, color);
    }

    // Draw rotation indicator (direction of movement)
    if (enemy.direction.x !== 0 || enemy.direction.y !== 0) {
      this.renderDirectionIndicator(enemy);
    }

    this.surface.restore();
  }

  /**
   * Render a direction indicator (arrow showing movement direction)
   * @private
   */
  renderDirectionIndicator(enemy) {
    const { x, y, width, height, direction, rotation } = enemy;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const arrowLength = width / 2;

    const endX = centerX + Math.cos(rotation) * arrowLength;
    const endY = centerY + Math.sin(rotation) * arrowLength;

    // Draw arrow line
    this.surface.drawLine(
      centerX,
      centerY,
      endX,
      endY,
      'rgba(255, 255, 255, 0.5)',
      1
    );
  }

  /**
   * Render health bar above enemy
   * @private
   */
  renderHealthBar(enemy) {
    const { x, y, width, height, health, maxHealth } = enemy;
    const healthPercent = Math.max(0, Math.min(1, health / maxHealth));

    const barWidth = width;
    const barHeight = this.config.healthBarHeight;
    const barX = x;
    const barY = y - this.config.healthBarOffset - barHeight;

    // Background (dark)
    this.surface.drawRect(
      barX,
      barY,
      barWidth,
      barHeight,
      this.colors.healthBarBackground,
      { stroke: true, strokeColor: '#666666', strokeWidth: 1 }
    );

    // Health fill (color based on health level)
    const fillColor = this.getHealthBarColor(healthPercent);
    this.surface.drawRect(
      barX,
      barY,
      barWidth * healthPercent,
      barHeight,
      fillColor
    );

    // Optional: render health text for debugging
    if (health < maxHealth) {
      const healthText = `${Math.ceil(health)}/${maxHealth}`;
      this.surface.drawText(healthText, barX + 2, barY - 10, {
        font: '8px monospace',
        color: '#fff',
        align: 'left',
      });
    }
  }

  /**
   * Get health bar color based on health percentage
   * @private
   */
  getHealthBarColor(healthPercent) {
    if (healthPercent > 0.5) {
      return this.colors.healthBarFill; // Green
    } else if (healthPercent > 0.25) {
      return this.colors.healthBarLow; // Yellow
    } else {
      return this.colors.healthBarCritical; // Red
    }
  }

  /**
   * Render status effect indicators below enemy
   * @private
   */
  renderStatusEffects(enemy) {
    const { x, y, height, statusEffects } = enemy;
    let effectCount = 0;

    const effectSpacing = this.config.statusEffectSize + 2;
    const startX = x + 5;
    const startY = y + height + 4;

    // Render each active status effect as a small colored dot
    if (statusEffects.slow.active) {
      this.surface.drawCircle(
        startX + effectCount * effectSpacing,
        startY,
        this.config.statusEffectSize / 2,
        this.colors.statusEffects.slow
      );
      effectCount++;
    }

    if (statusEffects.stun.active) {
      this.surface.drawCircle(
        startX + effectCount * effectSpacing,
        startY,
        this.config.statusEffectSize / 2,
        this.colors.statusEffects.stun
      );
      effectCount++;
    }

    if (statusEffects.burn.active) {
      this.surface.drawCircle(
        startX + effectCount * effectSpacing,
        startY,
        this.config.statusEffectSize / 2,
        this.colors.statusEffects.burn
      );
      effectCount++;
    }

    if (statusEffects.freeze.active) {
      this.surface.drawCircle(
        startX + effectCount * effectSpacing,
        startY,
        this.config.statusEffectSize / 2,
        this.colors.statusEffects.freeze
      );
      effectCount++;
    }
  }

  /**
   * Render selection highlight around selected enemy
   * @private
   */
  renderSelectionHighlight(enemy) {
    const { x, y, width, height } = enemy;
    const borderWidth = this.config.selectionBorderWidth;

    // Draw border rectangle
    this.surface.drawRect(
      x - borderWidth / 2,
      y - borderWidth / 2,
      width + borderWidth,
      height + borderWidth,
      'transparent',
      {
        stroke: true,
        strokeColor: this.config.selectionColor,
        strokeWidth: borderWidth,
      }
    );

    // Draw corner markers
    const cornerSize = 4;
    const corners = [
      { x, y }, // Top-left
      { x: x + width, y }, // Top-right
      { x, y: y + height }, // Bottom-left
      { x: x + width, y: y + height }, // Bottom-right
    ];

    for (const corner of corners) {
      this.surface.drawRect(
        corner.x - cornerSize / 2,
        corner.y - cornerSize / 2,
        cornerSize,
        cornerSize,
        this.config.selectionColor
      );
    }
  }

  /**
   * Render debug information for an enemy
   * @private
   */
  renderDebugInfo(enemy) {
    const { x, y, width, height, id, type, speed, health, maxHealth } = enemy;

    // Bounds box
    this.surface.drawRect(
      x,
      y,
      width,
      height,
      'transparent',
      {
        stroke: true,
        strokeColor: '#ffff00',
        strokeWidth: 1,
      }
    );

    // Enemy info text
    const debugText = `${id} (${type})`;
    this.surface.drawText(debugText, x, y - 20, {
      font: '10px monospace',
      color: '#ffff00',
    });

    // Path progress
    const progress = (enemy.getPathProgress() * 100).toFixed(0);
    this.surface.drawText(`Path: ${progress}%`, x, y - 8, {
      font: '8px monospace',
      color: '#00ffff',
    });

    // Speed
    this.surface.drawText(`Speed: ${speed.toFixed(0)}`, x, y + height + 10, {
      font: '8px monospace',
      color: '#00ff00',
    });
  }

  /**
   * Get color for enemy type
   * @private
   */
  getEnemyColor(type) {
    const colors = {
      Goblin: '#228B22',
      Dwarve: '#696969',
      Elve: '#32CD32',
      Dragon: '#DC143C',
      Hobbit: '#DAA520',
    };

    return colors[type] || this.colors.defaultEnemy;
  }

  /**
   * Set rendering configuration
   * @param {Object} config - Configuration overrides
   */
  setConfig(config) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Toggle debug visualization
   */
  toggleDebug() {
    this.config.renderDebugBounds = !this.config.renderDebugBounds;
    console.log(`Debug rendering: ${this.config.renderDebugBounds ? 'ON' : 'OFF'}`);
  }

  /**
   * Get snapshot of renderer state
   */
  getSnapshot() {
    return {
      config: this.config,
      colors: this.colors,
    };
  }
}

export default EnemyRenderer;