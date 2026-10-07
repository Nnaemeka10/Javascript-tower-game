/**
 * UI Manager
 * Manages UI state, player interaction, and feedback systems.
 * 
 * Responsibilities:
 * - UI interaction handling
 * - Tower selection state
 * - Notifications and feedback
 * - Game over/win state UI
 * - HUD updates
 */

import {
  handleTowerPlacement,
  handleTowerSelection,
  handleTowerUpgrade,
  handleTowerRepair,
  handleTowerSell,
  handleTowerTypeSelection,
  handleTowerDragStart,
  handleTowerDragEnd,
  getTowerInfo,
} from './eventHandlers.js';

class UIManager {
  constructor() {
    // UI State
    this.selectedTower = null;
    this.hoveredTower = null;
    this.isDraggingTower = false;
    this.draggedTower = null;

    // Visual effects
    this.visualFx = [];

    // Notifications
    this.notifications = [];
    this.maxNotifications = 5;
    this.notificationDuration = 3; // seconds

    // Game over/won state
    this.showGameOver = false;
    this.showGameWon = false;

    // State
    this.isInitialized = false;
    this.roundBanner = null;
  }

  /**
   * Initialize UI manager
   */
  async initialize() {
    console.log('UIManager initializing...');

    this.isInitialized = true;
    console.log('UIManager initialized');
  }

  /**
   * Update UI logic
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.isInitialized) return;

    // Update notifications (age and remove expired)
    this.updateNotifications(deltaTime);

     // Update round banner
    if (this.roundBanner) {
      this.roundBanner.age += deltaTime;
      this.roundBanner.timeLeft = Math.max(0, this.roundBanner.timeLeft - deltaTime);
      if (this.roundBanner.age >= this.roundBanner.duration) this.roundBanner = null;
    }
    // Update visual effects
    for (let i = this.visualFx.length - 1; i >= 0; i--) {
      this.visualFx[i].age += deltaTime;
      if (this.visualFx[i].age >= this.visualFx[i].duration) this.visualFx.splice(i, 1);
    }
  }

  /**
   * Update notifications
   * @private
   */
  updateNotifications(deltaTime) {
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      this.notifications[i].age += deltaTime;

      if (this.notifications[i].age >= this.notificationDuration) {
        this.notifications.splice(i, 1);
      }
    }
  }

  /**
   * Show notification message
   * @param {string} message - Notification text
   * @param {string} type - Type: 'info', 'warning', 'error', 'success'
   * @param {number} duration - Duration in seconds (optional)
   */
  showNotification(message, type = 'info', duration = 3) {
    this.notifications.push({
      message,
      type,
      age: 0,
      duration,
    });

    // Keep only recent notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift();
    }

    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    this.notifications = [];
  }

  /**
   * Get active notifications
   * @returns {Array} Active notifications
   */
  getNotifications() {
    return this.notifications;
  }

  /**
   * Show round banner
   * @param {Object} params - Banner parameters
   */
  showRoundBanner({ round, mapName, goldGained, livesGained, livesCap, seconds, duration }) {
    this.roundBanner = { round, mapName, goldGained, livesGained, livesCap,
                          timeLeft: seconds, age: 0, duration };
  }

  /**
   * Get round banner
   * @returns {Object|null} Round banner or null
   */
  getRoundBanner() { return this.roundBanner; }

  /**
   * Set selected tower
   * @param {Tower} tower - Tower to select
   */
  setSelectedTower(tower) {
    this.selectedTower = tower;
  }

  /**
   * Get selected tower
   * @returns {Tower|null}
   */
  getSelectedTower() {
    return this.selectedTower;
  }

  /**
   * Set hovered tower
   * @param {Tower} tower - Tower to hover
   */
  setHoveredTower(tower) {
    this.hoveredTower = tower;
  }

  /**
   * Get hovered tower
   * @returns {Tower|null}
   */
  getHoveredTower() {
    return this.hoveredTower;
  }

  /**
   * Handle click event
   * @param {number} worldX - World coordinate X
   * @param {number} worldY - World coordinate Y
   * @param {GameEngine} gameEngine - Game engine instance
   */
  handleClick(worldX, worldY, gameEngine) {
    const gameState = gameEngine.getGameState();
    const selectedType = gameState.getSelectedTowerType();

    if (selectedType) {
      // Placing a tower
      handleTowerPlacement(worldX, worldY, gameEngine);
    } else {
      // Selecting a tower
      const tower = handleTowerSelection(worldX, worldY, gameEngine);
      this.setSelectedTower(tower);
    }
  }

  /**
   * Handle drag start
   * @param {number} worldX - World coordinate X
   * @param {number} worldY - World coordinate Y
   * @param {GameEngine} gameEngine - Game engine instance
   */
  handleDragStart(worldX, worldY, gameEngine) {
    handleTowerDragStart(worldX, worldY, gameEngine);
  }

  /**
   * Handle drag end
   * @param {number} worldX - World coordinate X
   * @param {number} worldY - World coordinate Y
   * @param {GameEngine} gameEngine - Game engine instance
   */
  handleDragEnd(worldX, worldY, gameEngine) {
    handleTowerDragEnd(worldX, worldY, gameEngine);
  }

  /**
   * Request tower upgrade
   * @param {GameEngine} gameEngine - Game engine instance
   */
  requestTowerUpgrade(gameEngine) {
    if (!this.selectedTower) {
      this.showNotification('No tower selected', 'warning');
      return;
    }

    const success = handleTowerUpgrade(this.selectedTower, gameEngine);

    if (success) {
      this.showNotification(
        `Upgraded - ${this.selectedTower.upgradeCount}/30 (Tier ${this.selectedTower.getUpgradeInfo().tierLabel})`,
        'success'
      );
    } else {
      this.showNotification('Cannot upgrade tower', 'error');
    }
  }

  /**
   * Request tower repair
   * @param {GameEngine} gameEngine - Game engine instance
   */
  requestTowerRepair(gameEngine) {
    if (!this.selectedTower) {
      this.showNotification('No tower selected', 'warning');
      return;
    }

    const success = handleTowerRepair(this.selectedTower, gameEngine);

    if (success) {
      this.showNotification('Tower repaired', 'success');
    } else {
      this.showNotification('Cannot repair tower (not enough gold)', 'error');
    }
  }

  /**
   * Request tower sell
   * @param {GameEngine} gameEngine - Game engine instance
   */
  requestTowerSell(gameEngine) {
    if (!this.selectedTower) {
      this.showNotification('No tower selected', 'warning');
      return;
    }

    const oldTowerId = this.selectedTower.id;
    handleTowerSell(this.selectedTower, gameEngine);

    this.showNotification('Tower sold', 'success');
    this.selectedTower = null;
  }

  /**
   * Select tower type for placement
   * @param {string} towerType - Tower type
   * @param {GameEngine} gameEngine - Game engine instance
   */
  selectTowerType(towerType, gameEngine) {
    handleTowerTypeSelection(towerType, gameEngine);
  }

  /**
   * Get tower info for display
   * @returns {Object|null} Tower info
   */
  getSelectedTowerInfo() {
    return getTowerInfo(this.selectedTower);
  }

  /**
   * Spawn visual effect
   * Transient combat feedback. kind: 'flash' | 'burst'.
   * @param {string} kind - Effect kind
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} color - Effect color
   */
  spawnFx(kind, x, y, color) {
    if (this.visualFx.length > 40) return;         // hard cap — fx never lag the game
    this.visualFx.push({ kind, x, y, color, age: 0, duration: kind === 'burst' ? 0.6 : 0.35 });
  }

  getVisualFx() { return this.visualFx; }

  /**
   * Get manager snapshot for debugging
   * @returns {Object}
   */
  getSnapshot() {
    return {
      initialized: this.isInitialized,
      selectedTower: this.selectedTower ? this.selectedTower.id : null,
      hoveredTower: this.hoveredTower ? this.hoveredTower.id : null,
      notifications: this.notifications.length,
      isDragging: this.isDraggingTower,
    };
  }
}

export default UIManager;