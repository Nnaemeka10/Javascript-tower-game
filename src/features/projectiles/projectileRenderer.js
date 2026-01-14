/**
 * ProjectileRenderer
 * Renders all projectiles to the RenderSurface.
 * 
 * Responsibilities:
 * - Render projectile sprites/shapes
 * - Render trail effects
 * - Optimize rendering (bounds culling)
 */

import { GAME_CONFIG } from '../../utils/constants.js';

class ProjectileRenderer {
  /**
   * Create projectile renderer
   * @param {RenderSurface} renderSurface - Rendering surface (injected)
   */
  constructor(renderSurface) {
    if (!renderSurface) {
      throw new Error('❌ ProjectileRenderer requires a RenderSurface instance');
    }

    this.surface = renderSurface;

    // Configuration
    this.config = {
      renderTrails: true,
      renderDebugBounds: false,
      trailOpacityFactor: 0.3,
    };

    console.log('✅ ProjectileRenderer created');
  }

  /**
   * Initialize renderer
   */
  async initialize() {
    console.log('✅ ProjectileRenderer initialized');
  }

  /**
   * Render all projectiles
   * @param {Array<Projectile>} projectiles - Array of projectiles
   */
  render(projectiles) {
    if (!projectiles || projectiles.length === 0) return;

    for (const projectile of projectiles) {
      // Skip if off-screen
      if (!this.isProjectileVisible(projectile)) continue;

      this.renderProjectile(projectile);
    }
  }

  /**
   * Check if projectile is visible on screen
   * @private
   */
  isProjectileVisible(projectile) {
    const padding = 50;
    return this.surface.isRectInBounds(
      projectile.x - padding,
      projectile.y - padding,
      projectile.width + padding * 2,
      projectile.height + padding * 2
    );
  }

  /**
   * Render a single projectile
   * @private
   */
  renderProjectile(projectile) {
    this.surface.save();

    try {
      // Render trail if enabled
      if (this.config.renderTrails && projectile.trailEnabled && projectile.trail.length > 0) {
        this.renderTrail(projectile);
      }

      // Render projectile body
      this.renderProjectileBody(projectile);

      // Debug rendering
      if (this.config.renderDebugBounds) {
        this.renderDebugInfo(projectile);
      }

    } finally {
      this.surface.restore();
    }
  }

  /**
   * Render projectile trail effect
   * @private
   */
  renderTrail(projectile) {
    if (projectile.trail.length < 2) return;

    const trailColor = projectile.trailColor || `rgba(${this.colorToRgba(projectile.color)}, 0.5)`;

    for (let i = 0; i < projectile.trail.length - 1; i++) {
      const p1 = projectile.trail[i];
      const p2 = projectile.trail[i + 1];

      // Calculate opacity based on trail age
      const ageRatio = i / projectile.trail.length;
      const opacity = this.config.trailOpacityFactor * (1 - ageRatio);

      // Draw trail segment
      this.surface.save();
      this.surface.setAlpha(opacity);
      this.surface.drawLine(
        p1.x,
        p1.y,
        p2.x,
        p2.y,
        projectile.color,
        Math.max(1, projectile.width * (1 - ageRatio))
      );
      this.surface.restore();
    }
  }

  /**
   * Render projectile body
   * @private
   */
  renderProjectileBody(projectile) {
    const { x, y, width, height, color, rotation } = projectile;
    const opacity = projectile.getOpacity();

    this.surface.setAlpha(opacity);

    // Render based on type
    switch (projectile.type) {
      case 'Arrow':
        this.renderArrow(x, y, width, height, color, rotation);
        break;

      case 'Fireball':
        this.renderFireball(x, y, width, height, color);
        break;

      case 'IceShard':
        this.renderIceShard(x, y, width, height, color, rotation);
        break;

      case 'Cannonball':
        this.renderCannonball(x, y, width, height, color);
        break;

      case 'Bolt':
        this.renderBolt(x, y, width, height, color);
        break;

      case 'MagicMissile':
        this.renderMagicMissile(x, y, width, height, color);
        break;

      default:
        // Default: render as circle
        this.surface.drawCircle(x + width / 2, y + height / 2, width / 2, color);
    }
  }

  /**
   * Render arrow projectile
   * @private
   */
  renderArrow(x, y, width, height, color, rotation) {
    this.surface.save();
    this.surface.translate(x + width / 2, y + height / 2);
    this.surface.rotate(rotation);

    // Arrow head
    this.surface.drawPolygon(
      [
        { x: 4, y: -2 },
        { x: 4, y: 2 },
        { x: -3, y: 0 },
      ],
      color
    );

    // Arrow shaft
    this.surface.drawLine(-3, -1, -6, -1, color, 1);
    this.surface.drawLine(-3, 1, -6, 1, color, 1);

    this.surface.restore();
  }

  /**
   * Render fireball projectile
   * @private
   */
  renderFireball(x, y, width, height, color) {
    // Outer glow
    this.surface.drawCircle(
      x + width / 2,
      y + height / 2,
      width / 2 + 1,
      'rgba(255, 165, 0, 0.3)',
      { stroke: true, strokeColor: color, strokeWidth: 1 }
    );

    // Main ball
    this.surface.drawCircle(
      x + width / 2,
      y + height / 2,
      width / 2,
      color
    );

    // Inner highlight
    this.surface.drawCircle(
      x + width / 2 - 1,
      y + height / 2 - 1,
      width / 4,
      '#FFFF00',
      { opacity: 0.6 }
    );
  }

  /**
   * Render ice shard projectile
   * @private
   */
  renderIceShard(x, y, width, height, color, rotation) {
    this.surface.save();
    this.surface.translate(x + width / 2, y + height / 2);
    this.surface.rotate(rotation);

    // Ice crystal shape
    this.surface.drawPolygon(
      [
        { x: 0, y: -4 },
        { x: 3, y: -2 },
        { x: 4, y: 0 },
        { x: 3, y: 2 },
        { x: 0, y: 4 },
        { x: -3, y: 2 },
        { x: -4, y: 0 },
        { x: -3, y: -2 },
      ],
      color
    );

    this.surface.restore();
  }

  /**
   * Render cannonball projectile
   * @private
   */
  renderCannonball(x, y, width, height, color) {
    // Outer circle
    this.surface.drawCircle(
      x + width / 2,
      y + height / 2,
      width / 2,
      color,
      { stroke: true, strokeColor: '#000', strokeWidth: 1 }
    );

    // Shadow highlight
    this.surface.drawCircle(
      x + width / 2 + 1,
      y + height / 2 + 1,
      width / 3,
      '#000000',
      { opacity: 0.2 }
    );
  }

  /**
   * Render bolt projectile
   * @private
   */
  renderBolt(x, y, width, height, color) {
    this.surface.drawRect(
      x,
      y,
      width,
      height,
      color,
      { stroke: true, strokeColor: '#FFF', strokeWidth: 0.5 }
    );
  }

  /**
   * Render magic missile projectile
   * @private
   */
  renderMagicMissile(x, y, width, height, color) {
    // Outer aura
    this.surface.drawCircle(
      x + width / 2,
      y + height / 2,
      width / 2 + 2,
      color,
      { opacity: 0.2 }
    );

    // Main orb
    this.surface.drawCircle(
      x + width / 2,
      y + height / 2,
      width / 2,
      color
    );

    // Energy lines
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const endX = x + width / 2 + Math.cos(angle) * (width / 2 + 2);
      const endY = y + height / 2 + Math.sin(angle) * (width / 2 + 2);

      this.surface.drawLine(
        x + width / 2,
        y + height / 2,
        endX,
        endY,
        color,
        0.5,
        { opacity: 0.5 }
      );
    }
  }

  /**
   * Render debug information
   * @private
   */
  renderDebugInfo(projectile) {
    const { x, y, width, height, id, type } = projectile;

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

    // Projectile info
    this.surface.drawText(
      `${id} (${type})`,
      x,
      y - 10,
      {
        font: '8px monospace',
        color: '#ffff00',
      }
    );
  }

  /**
   * Helper: convert hex color to rgba
   * @private
   */
  colorToRgba(hexColor) {
    // Simple conversion (not comprehensive)
    return '255, 100, 100'; // Default fallback
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
  }

  /**
   * Get snapshot of renderer state
   */
  getSnapshot() {
    return {
      config: this.config,
    };
  }
}

export default ProjectileRenderer;