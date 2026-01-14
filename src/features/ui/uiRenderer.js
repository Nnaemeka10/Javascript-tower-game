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
    console.log('🎨 UIRenderer initializing...');
    this.isInitialized = true;
    console.log('✅ UIRenderer initialized');
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
    this.renderHUD(gameState);

    // Draw notifications
    if (uiManager) {
      this.renderNotifications(uiManager.getNotifications());
    }

    // Draw tower info panel if tower selected
    if (uiManager && uiManager.getSelectedTower()) {
      this.renderTowerPanel(uiManager.getSelectedTowerInfo());
    }

    // Draw game over overlay
    if (gameState.isGameOver()) {
      this.renderGameOver(gameState);
    }

    // Draw game won overlay
    if (gameState.isGameWon()) {
      this.renderGameWon(gameState);
    }
  }

  /**
   * Render HUD (heads-up display)
   * @private
   */
  renderHUD(gameState) {
    const dims = this.renderSurface.getDimensions();
    const hudY = dims.height - this.hudHeight - this.hudPadding;

    // HUD background
    this.renderSurface.drawRect(
      this.hudPadding,
      hudY,
      dims.width - this.hudPadding * 2,
      this.hudHeight,
      this.colors.hudBackground,
      { stroke: true, strokeColor: this.colors.hudAccent, strokeWidth: 2 }
    );

    // Money display
    this.renderSurface.drawText(
      `💰 Money: ${gameState.getMoney()}`,
      this.hudPadding + 10,
      hudY + 10,
      {
        font: 'bold 16px Arial',
        color: this.colors.hudAccent,
        align: 'left',
        baseline: 'top',
      }
    );

    // Lives display
    this.renderSurface.drawText(
      `❤️ Lives: ${gameState.getLives()}`,
      this.hudPadding + 10,
      hudY + 30,
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
      dims.width / 2,
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
      dims.width - this.hudPadding - 10,
      hudY + 10,
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
      dims.width - this.hudPadding - 10,
      hudY + 30,
      {
        font: '12px Arial',
        color: this.colors.infoText,
        align: 'right',
        baseline: 'top',
      }
    );
  }

  /**
   * Render tower info panel
   * @private
   */
  renderTowerPanel(towerInfo) {
    if (!towerInfo) return;

    const dims = this.renderSurface.getDimensions();
    const panelX = this.hudPadding;
    const panelY = this.hudPadding;

    // Panel background
    this.renderSurface.drawRect(
      panelX,
      panelY,
      this.panelWidth,
      this.panelHeight,
      this.colors.panelBackground,
      { stroke: true, strokeColor: this.colors.panelBorder, strokeWidth: 2 }
    );

    let y = panelY + 10;

    // Tower name and type
    this.renderSurface.drawText(
      `${towerInfo.emoji} ${towerInfo.name}`,
      panelX + 10,
      y,
      {
        font: 'bold 14px Arial',
        color: this.colors.hudAccent,
        align: 'left',
        baseline: 'top',
      }
    );

    y += 25;

    // Level
    this.renderSurface.drawText(
      `Level: ${towerInfo.level}`,
      panelX + 10,
      y,
      {
        font: '12px Arial',
        color: this.colors.hudText,
        align: 'left',
        baseline: 'top',
      }
    );

    y += 20;

    // Health bar
    this.renderHealthBar(panelX + 10, y, towerInfo);
    y += 20;

    // Stats
    this.renderSurface.drawText(
      `Damage: ${towerInfo.damage}`,
      panelX + 10,
      y,
      {
        font: '12px Arial',
        color: this.colors.hudText,
      }
    );

    y += 18;

    this.renderSurface.drawText(
      `Range: ${towerInfo.range}`,
      panelX + 10,
      y,
      {
        font: '12px Arial',
        color: this.colors.hudText,
      }
    );

    y += 18;

    this.renderSurface.drawText(
      `Rate: ${towerInfo.fireRate.toFixed(1)}/s`,
      panelX + 10,
      y,
      {
        font: '12px Arial',
        color: this.colors.hudText,
      }
    );

    y += 25;

    // Stats
    this.renderSurface.drawText(
      `Kills: ${towerInfo.enemiesKilled}`,
      panelX + 10,
      y,
      {
        font: '11px Arial',
        color: this.colors.infoText,
      }
    );

    y += 16;

    this.renderSurface.drawText(
      `Damage: ${towerInfo.totalDamageDealt}`,
      panelX + 10,
      y,
      {
        font: '11px Arial',
        color: this.colors.infoText,
      }
    );
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
    const dims = this.renderSurface.getDimensions();
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
    const dims = this.renderSurface.getDimensions();

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
    const dims = this.renderSurface.getDimensions();

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
      '🎉 VICTORY! 🎉',
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