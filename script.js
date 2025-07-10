 // Get the canvas and its 2D rendering context
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Game constants
        const CANVAS_WIDTH = 1000;
        const CANVAS_HEIGHT = 700;
        
        // Enemy class - represents a single enemy unit
        class Enemy {
            constructor(waypoints, spawnDelay = 0) {
                // Position and movement
                this.waypoints = waypoints;
                this.currentWaypointIndex = 0;
                this.position = { x: waypoints[0].x, y: waypoints[0].y };
                this.velocity = { x: 0, y: 0 };
                
                // Enemy stats
                this.speed = 60; // pixels per second
                this.health = 100;
                this.maxHealth = 100;
                this.radius = 12;
                this.reward = 10; // money gained when killed

               
                
                // Visual properties
                this.color = '#e74c3c'; // Red
                this.healthBarWidth = 24;
                this.healthBarHeight = 4;
                
                // State
                this.isAlive = true;
                this.hasReachedEnd = false;
                this.spawnDelay = spawnDelay; // Delay before this enemy starts moving
                this.age = 0; // How long this enemy has existed
                
                console.log('👹 New enemy created at waypoint 0');
            }
            
            update(deltaTime) {
                // deltaTime is in milliseconds, convert to seconds
                const deltaSeconds = deltaTime / 1000;
                this.age += deltaSeconds;
                
                // Don't move if we're still in spawn delay
                if (this.age < this.spawnDelay) {
                    return;
                }
                
                // Don't move if dead or reached end
                if (!this.isAlive || this.hasReachedEnd) {
                    return;
                }
                
                // Check if we've reached the current target waypoint
                const targetWaypoint = this.waypoints[this.currentWaypointIndex];
                const distanceToTarget = this.distanceTo(targetWaypoint);
                
                // If we're close enough to the waypoint, move to the next one
                if (distanceToTarget < 5) {
                    this.currentWaypointIndex++;
                    
                    // Check if we've reached the end
                    if (this.currentWaypointIndex >= this.waypoints.length) {
                        this.hasReachedEnd = true;
                        console.log('👹 Enemy reached the end!');
                        return;
                    }
                    
                    console.log(`👹 Enemy reached waypoint ${this.currentWaypointIndex - 1}, moving to ${this.currentWaypointIndex}`);
                }
                
                // Calculate movement toward current target
                const newTarget = this.waypoints[this.currentWaypointIndex];
                this.moveToward(newTarget, deltaSeconds);
            }
            
            moveToward(target, deltaSeconds) {
                // Calculate direction vector from current position to target
                const dx = target.x - this.position.x;
                const dy = target.y - this.position.y;
                
                // Calculate distance to target
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Avoid division by zero
                if (distance === 0) return;
                
                // Normalize the direction vector (make it length 1)
                const normalizedDx = dx / distance;
                const normalizedDy = dy / distance;
                
                // Calculate velocity based on speed and direction
                this.velocity.x = normalizedDx * this.speed;
                this.velocity.y = normalizedDy * this.speed;
                
                // Update position based on velocity and time
                this.position.x += this.velocity.x * deltaSeconds;
                this.position.y += this.velocity.y * deltaSeconds;
            }
            
            draw(ctx) {
                // Don't draw if not spawned yet
                if (this.age < this.spawnDelay) {
                    return;
                }
                
                // Don't draw if dead
                if (!this.isAlive) {
                    return;
                }
                
                // Draw the enemy body
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw enemy border
                ctx.strokeStyle = '#c0392b'; // Darker red
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw health bar background
                const healthBarX = this.position.x - this.healthBarWidth / 2;
                const healthBarY = this.position.y - this.radius - 10;
                
                ctx.fillStyle = '#2c3e50'; // Dark background
                ctx.fillRect(healthBarX, healthBarY, this.healthBarWidth, this.healthBarHeight);
                
                // Draw health bar
                const healthPercent = this.health / this.maxHealth;
                const healthBarCurrentWidth = this.healthBarWidth * healthPercent;
                
                // Health bar color based on health percentage
                if (healthPercent > 0.6) {
                    ctx.fillStyle = '#27ae60'; // Green
                } else if (healthPercent > 0.3) {
                    ctx.fillStyle = '#f39c12'; // Orange
                } else {
                    ctx.fillStyle = '#e74c3c'; // Red
                }
                
                ctx.fillRect(healthBarX, healthBarY, healthBarCurrentWidth, this.healthBarHeight);
                
                // Draw direction indicator (small arrow)
                this.drawDirectionArrow(ctx);
            }
            
            drawDirectionArrow(ctx) {
                // Draw a small arrow showing movement direction
                if (this.velocity.x === 0 && this.velocity.y === 0) return;
                
                const arrowLength = 15;
                const arrowAngle = Math.atan2(this.velocity.y, this.velocity.x);
                
                // Calculate arrow tip position
                const arrowTipX = this.position.x + Math.cos(arrowAngle) * arrowLength;
                const arrowTipY = this.position.y + Math.sin(arrowAngle) * arrowLength;
                
                // Draw arrow line
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(arrowTipX, arrowTipY);
                ctx.stroke();
                
                // Draw arrow head
                const arrowHeadLength = 5;
                const arrowHeadAngle = Math.PI / 6; // 30 degrees
                
                ctx.beginPath();
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(
                    arrowTipX - arrowHeadLength * Math.cos(arrowAngle - arrowHeadAngle),
                    arrowTipY - arrowHeadLength * Math.sin(arrowAngle - arrowHeadAngle)
                );
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(
                    arrowTipX - arrowHeadLength * Math.cos(arrowAngle + arrowHeadAngle),
                    arrowTipY - arrowHeadLength * Math.sin(arrowAngle + arrowHeadAngle)
                );
                ctx.stroke();
            }
            
            // Utility methods
            distanceTo(point) {
                const dx = point.x - this.position.x;
                const dy = point.y - this.position.y;
                return Math.sqrt(dx * dx + dy * dy);
            }
            
            takeDamage(damage) {
                this.health -= damage;
                if (this.health <= 0) {
                    this.health = 0;
                    this.isAlive = false;
                    console.log('👹 Enemy destroyed!');
                }
            }
        }
        class Game {
            constructor() {
                console.log('🎮 Initializing Tower Defense Game...');
                
                // Game state variables
                this.isRunning = true;
                this.isPaused = false;
                this.frameCount = 0;
                this.lastTime = 0;
                this.fps = 0;
                this.fpsCounter = 0;
                this.fpsLastTime = 0;

                this.enemies = [];
                this.nextEnemySpawn = 0;
                this.enemySpawnInterval = 2000; // or whatever interval you want in ms
                
                // Path system for enemies to follow
                this.createPath();
                
                // Bind event listeners
                this.setupEventListeners();
                
                console.log('✅ Game initialized successfully!');
            }
            
            createPath() {
                // Define waypoints that enemies will follow
                // These are the "checkpoints" enemies must reach in order
                this.waypoints = [
                    { x: 50, y: 350 },    // Start point (left side)
                    { x: 200, y: 350 },   // Move right
                    { x: 200, y: 150 },   // Turn up
                    { x: 450, y: 150 },   // Move right again
                    { x: 450, y: 450 },   // Turn down
                    { x: 700, y: 450 },   // Move right
                    { x: 700, y: 250 },   // Turn up
                    { x: 950, y: 250 }    // End point (right side)
                ];
                
                console.log('🛤️ Path created with', this.waypoints.length, 'waypoints');
            }
            
            setupEventListeners() {
                // Keyboard input
                document.addEventListener('keydown', (event) => {
                    console.log(`🔑 Key pressed: ${event.code}`);
                    
                    switch(event.code) {
                        case 'Space':
                            event.preventDefault(); // Prevent page scroll
                            this.togglePause();
                            break;
                        case 'Escape':
                            this.restart();
                            break;
                    }
                });
                
                // Mouse input - now we'll show info about clicks and enemies
                canvas.addEventListener('click', (event) => {
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = event.clientX - rect.left;
                    const mouseY = event.clientY - rect.top;
                    
                    // Check if we clicked on an enemy
                    const clickedEnemy = this.findEnemyAtPosition(mouseX, mouseY);
                    
                    if (clickedEnemy) {
                        console.log(`🎯 Clicked on enemy! Health: ${clickedEnemy.health}/${clickedEnemy.maxHealth}`);
                        console.log(`📍 Enemy position: (${clickedEnemy.position.x.toFixed(1)}, ${clickedEnemy.position.y.toFixed(1)})`);
                        console.log(`🚀 Enemy velocity: (${clickedEnemy.velocity.x.toFixed(1)}, ${clickedEnemy.velocity.y.toFixed(1)})`);
                        
                        // Damage the enemy for testing
                        clickedEnemy.takeDamage(25);
                    } else {
                        // Find closest point on path
                        const closest = this.getClosestPointOnPath({ x: mouseX, y: mouseY });
                        
                        console.log(`🖱️ Mouse clicked at: (${mouseX.toFixed(1)}, ${mouseY.toFixed(1)})`);
                        console.log(`📍 Closest waypoint: (${closest.point.x}, ${closest.point.y})`);
                        console.log(`📏 Distance to path: ${closest.distance.toFixed(1)} pixels`);
                    }
                });
            }
            
            togglePause() {
                this.isPaused = !this.isPaused;
                console.log(`⏸️ Game ${this.isPaused ? 'paused' : 'resumed'}`);
                document.getElementById('gameStatus').textContent = this.isPaused ? 'Paused' : 'Running';
            }
            
            restart() {
                console.log('🔄 Restarting game...');
                this.frameCount = 0;
                this.isPaused = false;
                this.enemies = []; // Clear all enemies
                this.nextEnemySpawn = 0; // Reset enemy spawning
                document.getElementById('gameStatus').textContent = 'Running';
            }
            
            update(deltaTime) {
                // This function updates game logic
                // deltaTime is in milliseconds (1000 = 1 second)
                
                if (this.isPaused) return; // Don't update when paused
                
                // Update frame counter
                this.frameCount++;
                
                // Calculate FPS (frames per second)
                this.fpsCounter++;
                if (performance.now() - this.fpsLastTime >= 1000) {
                    this.fps = this.fpsCounter;
                    this.fpsCounter = 0;
                    this.fpsLastTime = performance.now();
                }
                
                // Spawn enemies periodically
                this.updateEnemySpawning(deltaTime);
                
                // Update all enemies
                this.updateEnemies(deltaTime);
                
                // Clean up dead or finished enemies
                this.cleanupEnemies();
                
                // Log game state every 60 frames (about once per second at 60 FPS)
                if (this.frameCount % 60 === 0) {
                    console.log(`📊 Frame ${this.frameCount}, Enemies: ${this.enemies.length}, FPS: ${this.fps}`);
                }
            }
            
            updateEnemySpawning(deltaTime) {
                // Spawn enemies at regular intervals
                this.nextEnemySpawn -= deltaTime;
                
                if (this.nextEnemySpawn <= 0) {
                    // Create a new enemy
                    const enemy = new Enemy(this.waypoints);
                    this.enemies.push(enemy);
                    
                    // Reset spawn timer
                    this.nextEnemySpawn = this.enemySpawnInterval;
                    
                    console.log(`👹 Spawned enemy #${this.enemies.length}`);
                }
            }
            
            updateEnemies(deltaTime) {
                // Update all enemies
                for (let enemy of this.enemies) {
                    enemy.update(deltaTime);
                }
            }
            
            cleanupEnemies() {
                // Remove dead enemies and enemies that reached the end
                const initialCount = this.enemies.length;
                
                this.enemies = this.enemies.filter(enemy => {
                    return enemy.isAlive && !enemy.hasReachedEnd;
                });
                
                const removedCount = initialCount - this.enemies.length;
                if (removedCount > 0) {
                    console.log(`🧹 Cleaned up ${removedCount} enemies`);
                }
            }
            
            draw() {
                // This function handles all rendering
                
                // Clear the entire canvas
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                
                // Draw background (forest green)
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                
                // Draw a grid to help visualize the coordinate system
                this.drawGrid();
                
                // Draw the enemy path
                this.drawPath();
                
                // Draw all enemies
                this.drawEnemies();
                
                // Draw waypoints for debugging
                this.drawWaypoints();
                
                // Draw game info
                this.drawGameInfo();
                
                // Draw pause overlay if paused
                if (this.isPaused) {
                    this.drawPauseOverlay();
                }
            }
            
            drawEnemies() {
                // Draw all enemies
                for (let enemy of this.enemies) {
                    enemy.draw(ctx);
                }
            }
            
            drawGameInfo() {
                // Draw game statistics
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(10, 10, 200, 60);
                
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.fillText(`Enemies: ${this.enemies.length}`, 15, 30);
                ctx.fillText(`Next spawn: ${Math.max(0, this.nextEnemySpawn / 1000).toFixed(1)}s`, 15, 45);
                ctx.fillText(`FPS: ${this.fps}`, 15, 60);
            }
            
            drawGrid() {
                // Draw a light grid to help with positioning
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                
                // Vertical lines every 50 pixels
                for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, CANVAS_HEIGHT);
                    ctx.stroke();
                }
                
                // Horizontal lines every 50 pixels
                for (let y = 0; y <= CANVAS_HEIGHT; y += 50) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(CANVAS_WIDTH, y);
                    ctx.stroke();
                }
            }
            
            drawPath() {
                // Draw the path that enemies will follow
                
                if (this.waypoints.length < 2) return; // Need at least 2 points for a path
                
                // Draw the path as connected line segments
                ctx.strokeStyle = '#8b4513'; // Brown color for dirt path
                ctx.lineWidth = 30; // Wide path
                ctx.lineCap = 'round'; // Rounded ends
                ctx.lineJoin = 'round'; // Rounded corners
                
                // Start drawing the path
                ctx.beginPath();
                ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
                
                // Draw lines connecting all waypoints
                for (let i = 1; i < this.waypoints.length; i++) {
                    ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
                }
                
                ctx.stroke();
                
                // Add a border to make the path more visible
                ctx.strokeStyle = '#654321'; // Darker brown
                ctx.lineWidth = 34; // Slightly wider
                ctx.globalCompositeOperation = 'destination-over'; // Draw behind
                ctx.stroke();
                ctx.globalCompositeOperation = 'source-over'; // Reset to normal
            }
            
            drawWaypoints() {
                // Draw circles at each waypoint for debugging
                // This helps us see exactly where the path points are
                
                for (let i = 0; i < this.waypoints.length; i++) {
                    const waypoint = this.waypoints[i];
                    
                    // Draw waypoint circle
                    ctx.fillStyle = i === 0 ? '#2ecc71' : i === this.waypoints.length - 1 ? '#e74c3c' : '#f39c12';
                    ctx.beginPath();
                    ctx.arc(waypoint.x, waypoint.y, 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw waypoint number
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(i.toString(), waypoint.x, waypoint.y + 4);
                }
                
                // Reset text alignment
                ctx.textAlign = 'left';
            }
            
            calculatePathLength() {
                // Calculate the total length of the path
                // This uses the distance formula: √((x2-x1)² + (y2-y1)²)
                
                let totalLength = 0;
                
                for (let i = 1; i < this.waypoints.length; i++) {
                    const prev = this.waypoints[i - 1];
                    const current = this.waypoints[i];
                    
                    // Distance formula
                    const dx = current.x - prev.x;
                    const dy = current.y - prev.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    totalLength += distance;
                }
                
                return totalLength;
            }
            
            // Find enemy at a specific position (for clicking)
            findEnemyAtPosition(x, y) {
                for (let enemy of this.enemies) {
                    if (enemy.isAlive && enemy.age >= enemy.spawnDelay) {
                        const distance = enemy.distanceTo({ x, y });
                        if (distance <= enemy.radius) {
                            return enemy;
                        }
                    }
                }
                return null;
            }
            
            // Utility function to calculate distance between two points
            // We'll use this a lot in tower defense for:
            // - Enemy movement
            // - Tower range checking
            // - Collision detection
            distanceBetween(point1, point2) {
                const dx = point2.x - point1.x;
                const dy = point2.y - point1.y;
                return Math.sqrt(dx * dx + dy * dy);
            }
            
            // Utility function to find the closest point on the path to a given position
            // Useful for placing towers and checking if something is near the path
            getClosestPointOnPath(position) {
                let closestDistance = Infinity;
                let closestPoint = null;
                
                // Check distance to each waypoint
                for (let waypoint of this.waypoints) {
                    const distance = this.distanceBetween(position, waypoint);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestPoint = waypoint;
                    }
                }
                
                return { point: closestPoint, distance: closestDistance };
            }
            
            drawPauseOverlay() {
                // Semi-transparent overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                
                // Pause text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                
                ctx.font = '24px Arial';
                ctx.fillText('Press SPACE to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
                
                // Reset text alignment
                ctx.textAlign = 'left';
            }
            
            // Main game loop
            run() {
                console.log('🚀 Starting game loop...');
                
                const gameLoop = (currentTime) => {
                    // Calculate delta time (time since last frame)
                    const deltaTime = currentTime - this.lastTime;
                    this.lastTime = currentTime;
                    
                    // Update game logic
                    this.update(deltaTime);
                    
                    // Render everything
                    this.draw();
                    
                    // Update UI
                    this.updateUI();
                    
                    // Continue the loop
                    if (this.isRunning) {
                        requestAnimationFrame(gameLoop);
                    }
                };
                
                // Start the loop
                requestAnimationFrame(gameLoop);
            }
            
            updateUI() {
                // Update the HTML elements with current game state
                document.getElementById('fps').textContent = this.fps;
                document.getElementById('frameCount').textContent = this.frameCount;
            }
        }
        
        // Initialize and start the game when the page loads
        window.addEventListener('load', () => {
            console.log('🌟 Page loaded, starting game...');
            const game = new Game();
            game.run();
        });