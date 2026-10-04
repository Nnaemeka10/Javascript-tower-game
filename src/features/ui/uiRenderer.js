/**
 * UI Renderer
 * Renders all UI elements using RenderSurface for platform independence.
 * 
 * Features:
 * - HUD (heads-up display)
 * - Tower information panel
 * - Resource indicators (money, lives, wave)
 * - Game over/won overlays
 * - Notifications/feedback messages
 * - FPS and debug info
 */

class UIRenderer {
  constructor(renderSurface) {
    this.renderSurface = renderSurface;
    this.isInitialized = false;

    // Layout constants
    this.hudPadding = 10;
    this.hudHeight = 60;
    this.panelWidth = 250;
    this.panelHeight = 300;

    // UI colors
    this.colors = {
      hudBackground: 'rgba(0, 0, 0, 0.7)',
      hudText: '#FFFFFF',
      hudAccent: '#00FF00',
      panelBackground: 'rgba(30, 30, 30, 0.9)',
      panelBorder: '#00FF00',
      successText: '#00FF00',
      warningText: '#FFFF00',
      errorText: '#FF0000',
      infoText: '#00CCFF',
    };

    // Animation
    this.animationTime = 0;
  }

  /**
   * Initialize renderer
   */
  async initialize() {
    console.log('UIRenderer initializing...');
    this.isInitialized = true;
    console.log('UIRenderer initialized');
  }

  /**
   * Get the size of the world
   * @returns {Object} - World dimensions
   */
  getWorldSize() {
    return this.renderSurface.getWorldDimensions
      ? this.renderSurface.getWorldDimensions()
      : { width: 800, height: 680 };
  }

  /**
   * Render all UI elements
   * @param {GameState} gameState - Game state
   * @param {Object} managers - Game managers
   * @param {UIManager} uiManager - UI manager
   */
  render(gameState, managers, uiManager) {
    if (!this.isInitialized) return;

    this.animationTime += 0.016; // Approximate delta time

    // Draw HUD
    this.renderHUD(gameState, managers);

    // Draw notifications
    if (uiManager) {
      this.renderNotifications(uiManager.getNotifications());
    }

    // Draw tower info panel if tower selected
    if (uiManager && uiManager.getSelectedTower()) {
      this.renderTowerPanel(uiManager.getSelectedTowerInfo());
    }

    // Draw game over overlay
    if (gameState.getGameOver()) {
      this.renderGameOver(gameState);
    }

    // Draw game won overlay
    if (gameState.getGameWon()) {
      this.renderGameWon(gameState);
    }
  }

  /**
   * Render HUD (heads-up display)
   * @private
   */
  renderHUD(gameState, managers = null) {
    const { width: W, height: H } = this.getWorldSize();
    const hudY = H - this.hudHeight - this.hudPadding;

    // HUD background
    this.renderSurface.drawRect(
      this.hudPadding, 
      hudY, 
      W - this.hudPadding * 2, 
      this.hudHeight,
      this.colors.hudBackground,
      { stroke: true, strokeColor: this.colors.hudAccent, strokeWidth: 2 }
    );

    // Money display
    this.renderSurface.drawText(
      `Money: ${gameState.getMoney()}`,
      this.hudPadding + 10,
      hudY + 20,
      {
        font: 'bold 16px Arial',
        color: this.colors.hudAccent,
        align: 'left',
        baseline: 'top',
      }
    );

    // Lives display
    this.renderSurface.drawText(
      `Lives: ${gameState.getLives()}`,
      this.hudPadding + 10,
      hudY + 40,
      {
        font: 'bold 16px Arial',
        color: gameState.getLives() <= 5 ? this.colors.errorText : this.colors.hudText,
        align: 'left',
        baseline: 'top',
      }
    );

    // Wave display (center)
    const waveText = `Wave ${gameState.getCurrentWave()}/${gameState.getTotalWaves()}`;
    this.renderSurface.drawText(
      waveText,
      W / 2,
      hudY + 20,
      {
        font: 'bold 18px Arial',
        color: this.colors.hudAccent,
        align: 'center',
        baseline: 'middle',
      }
    );

    // Score display (right)
    this.renderSurface.drawText(
      `Score: ${gameState.getScore()}`,
      W - this.hudPadding - 10,
      hudY + 20,
      {
        font: 'bold 16px Arial',
        color: this.colors.hudText,
        align: 'right',
        baseline: 'top',
      }
    );

    // FPS display (right bottom)
    this.renderSurface.drawText(
      `FPS: ${gameState.getFPS()}`,
      W - this.hudPadding - 10,
      hudY + 40,
      {
        font: '12px Arial',
        color: this.colors.infoText,
        align: 'right',
        baseline: 'top',
      }
    );

    // wave progress bar
    const wave = managers && managers.wave;
    const progress = wave && wave.getWaveProgress ? Math.min(1, Math.max(0, wave.getWaveProgress())) : 0;
    const barW = 180, barH = 6;
    const barX = W / 2 - barW / 2;
    const barY = hudY + this.hudHeight - 22;
    this.renderSurface.drawRect(barX, barY, barW, barH, '#222222',
      { stroke: true, strokeColor: '#555555', strokeWidth: 1 });
    if (progress > 0) {
      this.renderSurface.drawRect(barX, barY, barW * progress, barH, '#ffcc00');
    }
  }

  /**
   * Render tower info panel
   * @param {Object} towerInfo - Information about the tower to display
   * @private
   */
  renderTowerPanel(towerInfo) {
    if (!towerInfo) return;

    const P = 10;
    const pw = 270, ph = 250;
    const px = this.hudPadding, py = this.hudPadding;
    const u = towerInfo.upgrade;
    const tierCol = { 1: '#9c9cb4', 2: '#6ee7ff', 3: '#ffcc4d' }[u.tier];

    // ---- frame
    this.renderSurface.drawRect(px, py, pw, ph, 'rgba(18,18,30,0.95)',
      { stroke: true, strokeColor: '#3d3d5c', strokeWidth: 1 });

    // ---- header band in tower accent + tier pill
    this.renderSurface.drawRect(px, py, pw, 34, towerInfo.accent);
    this.renderSurface.drawText(`${towerInfo.emoji}  ${towerInfo.name}`,
      px + P, py + 10, { font: 'bold 13px Arial', color: '#0d0d1a', align: 'left', baseline: 'top' });
    this.renderSurface.drawRect(px + pw - P - 64, py + 6, 64, 22, 'rgba(13,13,26,0.85)',
      { stroke: true, strokeColor: tierCol, strokeWidth: 1 });
    this.renderSurface.drawText(`TIER ${u.tierLabel}`,
      px + pw - P - 32, py + 17, { font: 'bold 11px Arial', color: tierCol, align: 'center', baseline: 'middle' });

    // ---- 30-notch upgrade bar (notches at 10 / 20 = tier boundaries)
    const barX = px + P, barY = py + 46, barW = pw - P * 2, barH = 8;
    this.renderSurface.drawRect(barX, barY, barW, barH, '#232338',
      { stroke: true, strokeColor: '#3d3d5c', strokeWidth: 1 });
    this.renderSurface.drawRect(barX, barY, barW * (u.count / u.max), barH, '#22d3a7');
    for (const n of [10, 20]) {
      this.renderSurface.drawRect(barX + barW * (n / u.max) - 1, barY - 2, 2, barH + 4, '#0d0d1a');
    }
    const caption = u.canUpgrade
      ? `Upgrades ${u.count}/${u.max}   ·   next ${u.nextCost}g${u.nextIsTierUp ? '   ·   TIER UP' : ''}`
      : 'FULLY UPGRADED';
    this.renderSurface.drawText(caption, barX, barY + 14, {
      font: '10px Arial',
      color: !u.canUpgrade ? '#22d3a7' : u.nextIsTierUp ? '#ffcc4d' : '#9c9cb4',
      align: 'left', baseline: 'top',
    });

    // ---- stats: 2 columns (value + growth bar relative to max potential)
    const col1 = px + P, col2 = px + pw / 2 + 4;
    const rowY = py + 84;
    const lbl = { font: '9px Arial', color: '#9c9cb4', align: 'left', baseline: 'top' };
    const val = { font: 'bold 13px Arial', color: '#ececf4', align: 'left', baseline: 'top' };

    // Damage (bar vs 3.3× base)
    this.renderSurface.drawText('DAMAGE', col1, rowY, lbl);
    this.renderSurface.drawText(String(towerInfo.damage), col1, rowY + 11, val);
    this.statBar(col1, rowY + 28, 118, 5, towerInfo.damage / (towerInfo.baseDamage * 3.3), '#22d3a7');
    // Range (bar vs 1.6× base)
    this.renderSurface.drawText('RANGE', col2, rowY, lbl);
    this.renderSurface.drawText(String(towerInfo.range), col2, rowY + 11, val);
    this.statBar(col2, rowY + 28, 118, 5, towerInfo.range / (towerInfo.baseRange * 1.6), '#6ee7ff');
    // Fire rate
    this.renderSurface.drawText('RATE', col1, rowY + 46, lbl);
    this.renderSurface.drawText(`${towerInfo.shotsPerSec}/s`, col1, rowY + 57, val);
    // Health (live bar, color-coded)
    this.renderSurface.drawText('HP', col2, rowY + 46, lbl);
    this.renderSurface.drawText(`${Math.ceil(towerInfo.health)}/${towerInfo.maxHealth}`, col2, rowY + 57, val);
    const hpFrac = parseFloat(towerInfo.healthPercent) / 100;
    const hpCol = hpFrac > 0.5 ? '#22d3a7' : hpFrac > 0.25 ? '#ffcc4d' : '#ff5c5c';
    this.statBar(col2, rowY + 74, 118, 5, hpFrac, hpCol);

    // ---- tier ability teaser (Phase 3 fills tierAbilities; shows only when defined)
    let ay = rowY + 92;
    if (u.nextTierAbility) {
      this.renderSurface.drawText(`✦ Tier ${u.tier + 1} unlock: ${u.nextTierAbility}`,
        px + P, ay, { font: '10px Arial', color: '#ffcc4d', align: 'left', baseline: 'top' });
      ay += 16;
    }

    // ---- combat record
    this.renderSurface.drawText(
      `⚔  ${towerInfo.combat.kills} kills   ·   ${towerInfo.combat.damageDealt} dmg dealt`,
      px + P, ay, { font: '10px Arial', color: '#9c9cb4', align: 'left', baseline: 'top' });

    // ---- footer
    if (u.canUpgrade) {
      this.renderSurface.drawText('[U] Upgrade      [S] Sell',
        px + pw / 2, py + ph - 12,
        { font: '10px Arial', color: '#9c9cb4', align: 'center', baseline: 'middle' });
    }
  }

  /** Small labeled growth bar. 
   * @private 
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} frac - Fraction (0-1)
   * @param {string} color - Fill color
   */
  statBar(x, y, w, h, frac, color) {
    frac = Math.max(0, Math.min(1, frac));
    this.renderSurface.drawRect(x, y, w, h, '#232338');
    if (frac > 0) this.renderSurface.drawRect(x, y, w * frac, h, color);
  }

  /**
   * Render health bar
   * @private
   */
  renderHealthBar(x, y, towerInfo) {
    const barWidth = 80;
    const barHeight = 8;
    const percent = parseFloat(towerInfo.healthPercent) / 100;

    // Background
    this.renderSurface.drawRect(
      x,
      y,
      barWidth,
      barHeight,
      '#333333',
      { stroke: true, strokeColor: '#666666', strokeWidth: 1 }
    );

    // Health fill
    let healthColor = '#00FF00';
    if (percent < 0.5) healthColor = '#FFFF00';
    if (percent < 0.25) healthColor = '#FF0000';

    this.renderSurface.drawRect(
      x,
      y,
      barWidth * percent,
      barHeight,
      healthColor,
      0,
      true
    );

    // Health text
    this.renderSurface.drawText(
      `${towerInfo.healthPercent}%`,
      x + barWidth / 2,
      y - 15,
      {
        font: '10px Arial',
        color: this.colors.hudText,
        align: 'center',
      }
    );
  }

  /**
   * Render notifications
   * @private
   */
  renderNotifications(notifications) {
    const dims = this.getWorldSize();
    let y = this.hudPadding + 100;

    for (const notification of notifications) {
      const alpha = 1 - notification.age / notification.duration;

      this.renderSurface.save();
      this.renderSurface.setAlpha(alpha);

      // Background
      this.renderSurface.drawRect(
        this.hudPadding,
        y,
        300,
        30,
        this.getNotificationColor(notification.type),
        { stroke: true, strokeColor: '#FFFFFF', strokeWidth: 1 }
      );

      // Text
      this.renderSurface.drawText(
        notification.message,
        this.hudPadding + 10,
        y + 8,
        {
          font: '12px Arial',
          color: '#FFFFFF',
          align: 'left',
          baseline: 'top',
        }
      );

      this.renderSurface.restore();

      y += 35;
    }
  }

  /**
   * Get notification color by type
   * @private
   */
  getNotificationColor(type) {
    switch (type) {
      case 'success':
        return 'rgba(0, 255, 0, 0.3)';
      case 'error':
        return 'rgba(255, 0, 0, 0.3)';
      case 'warning':
        return 'rgba(255, 255, 0, 0.3)';
      default:
        return 'rgba(0, 200, 255, 0.3)';
    }
  }

  /**
   * Render game over overlay
   * @private
   */
  renderGameOver(gameState) {
    const dims = this.getWorldSize();

    // Semi-transparent overlay
    this.renderSurface.save();
    this.renderSurface.setAlpha(0.8);

    this.renderSurface.drawRect(
      0,
      0,
      dims.width,
      dims.height,
      '#000000',
      0,
      true
    );

    this.renderSurface.restore();

    // Game over text
    this.renderSurface.drawText(
      'GAME OVER',
      dims.width / 2,
      dims.height / 2 - 60,
      {
        font: 'bold 60px Arial',
        color: this.colors.errorText,
        align: 'center',
        baseline: 'middle',
      }
    );

    // Final score
    this.renderSurface.drawText(
      `Final Score: ${gameState.getScore()}`,
      dims.width / 2,
      dims.height / 2 + 20,
      {
        font: 'bold 24px Arial',
        color: this.colors.hudText,
        align: 'center',
        baseline: 'middle',
      }
    );

    // Restart hint
    this.renderSurface.drawText(
      'Press SPACE or click START to restart',
      dims.width / 2,
      dims.height / 2 + 80,
      {
        font: '16px Arial',
        color: this.colors.infoText,
        align: 'center',
        baseline: 'middle',
      }
    );
  }

  /**
   * Render game won overlay
   * @private
   */
  renderGameWon(gameState) {
    const dims = this.getWorldSize();

    // Semi-transparent overlay
    this.renderSurface.save();
    this.renderSurface.setAlpha(0.8);

    this.renderSurface.drawRect(
      0,
      0,
      dims.width,
      dims.height,
      '#000000',
      0,
      true
    );

    this.renderSurface.restore();

    // Victory text
    this.renderSurface.drawText(
      'VICTORY!',
      dims.width / 2,
      dims.height / 2 - 60,
      {
        font: 'bold 60px Arial',
        color: this.colors.successText,
        align: 'center',
        baseline: 'middle',
      }
    );

    // Final score
    this.renderSurface.drawText(
      `Final Score: ${gameState.getScore()}`,
      dims.width / 2,
      dims.height / 2 + 20,
      {
        font: 'bold 24px Arial',
        color: this.colors.hudText,
        align: 'center',
        baseline: 'middle',
      }
    );

    // High score
    const highScore = gameState.getHighScore();
    if (gameState.getScore() > highScore) {
      this.renderSurface.drawText(
        `New High Score!`,
        dims.width / 2,
        dims.height / 2 + 60,
        {
          font: 'bold 20px Arial',
          color: this.colors.successText,
          align: 'center',
          baseline: 'middle',
        }
      );
    }

    // Restart hint
    this.renderSurface.drawText(
      'Press SPACE or click START to play again',
      dims.width / 2,
      dims.height / 2 + 100,
      {
        font: '16px Arial',
        color: this.colors.infoText,
        align: 'center',
        baseline: 'middle',
      }
    );
  }

  /**
   * Get renderer snapshot for debugging
   * @returns {Object}
   */
  getSnapshot() {
    return {
      initialized: this.isInitialized,
      hudHeight: this.hudHeight,
      panelWidth: this.panelWidth,
      panelHeight: this.panelHeight,
    };
  }
}

export default UIRenderer;