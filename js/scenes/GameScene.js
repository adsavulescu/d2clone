class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.currentWorldLevel = 1;
        this.enemySpawner = null;
        this.worldSpawns = null;
        this.wallColliders = []; // Store wall collider references
        this.isRecreatingUI = false; // Flag to prevent recursive UI recreation
        this.needsEnemyHealthBarRecreation = false; // Flag to mark when enemy health bar needs recreation
        this.collisionRegistry = null; // Collision system registry
        this.activePortals = []; // Store active town portals
    }
    
    create(data) {
        // Handle respawn from death screen
        this.respawnInTown = data && data.respawnInTown;
        
        // Player sprite data is now stored in registry by Preloader
        
        // Initialize transition flag
        this.isTransitioning = false;
        
        // Initialize Object Pool Manager
        this.poolManager = new ObjectPoolManager(this);
        
        // Disable physics debug rendering
        this.physics.world.drawDebug = false;
        if (this.physics.world.debugGraphic) {
            this.physics.world.debugGraphic.clear();
            this.physics.world.debugGraphic.visible = false;
        }
        
        // Initialize player statistics tracking
        this.gameStartTime = this.time.now;
        this.playerStats = {
            enemiesKilled: 0,
            itemsCollected: 0
        };
        
        this.generateWorld();
        
        this.physics.world.setBounds(0, 0, 150 * 32, 150 * 32);
        
        // Initialize collision registry
        this.collisionRegistry = new CollisionRegistry(this);
        
        // Register collision groups
        this.collisionRegistry.registerGroup(Collidable.Groups.PLAYER);
        this.collisionRegistry.registerGroup(Collidable.Groups.ENEMY, {
            classType: Enemy,
            runChildUpdate: true
        });
        this.collisionRegistry.registerGroup(Collidable.Groups.PLAYER_PROJECTILE);
        this.collisionRegistry.registerGroup(Collidable.Groups.ENEMY_PROJECTILE);
        this.collisionRegistry.registerGroup(Collidable.Groups.WALL);
        this.collisionRegistry.registerGroup(Collidable.Groups.ITEM);
        this.collisionRegistry.registerGroup(Collidable.Groups.PORTAL);
        this.collisionRegistry.registerGroup(Collidable.Groups.AREA_EFFECT);
        
        // Spawn player at town hall
        const spawnPos = this.worldGenerator.getTownHallSpawnPosition();
        this.player = new Player(this, spawnPos.x, spawnPos.y);
        // Don't add player to group - it's a single entity with its own physics body
        
        // Get enemy group from registry
        this.enemies = this.collisionRegistry.getGroup(Collidable.Groups.ENEMY);
        
        // Initialize item drops group
        this.itemDrops = this.add.group();
        
        // Initialize enemy spawner
        this.enemySpawner = new EnemySpawner(this);
        
        // Generate fixed spawn data for this world
        this.worldSpawns = this.enemySpawner.generateWorldSpawns(this.currentWorldLevel);
        
        // Spawn initial enemies using new system
        this.spawnInitialEnemies();
        
        this.setupCamera();
        this.setupControls();
        this.setupUI();
        
        // Start UIScene for persistent UI
        this.scene.launch('UIScene');
        
        // Get UI Manager reference from UIScene
        this.time.delayedCall(100, () => {
            const uiScene = this.scene.get('UIScene');
            if (uiScene) {
                this.uiManager = uiScene.getUIManager();
            }
        });
        
        // Emit player created event for UIScene
        this.events.emit('player-created', this.player);
        
        // Setup collision rules using the registry
        this.setupCollisionRules();
        
        // No automatic pickup - items require clicking in Diablo 2 style
        
        // Portal collision for world transition
        this.setupPortalCollision();
        
        // No more periodic spawning - enemies are fixed per world
    }
    
    setupCollisionRules() {
        // Enemy-enemy collision (physical collision)
        this.collisionRegistry.addCollisionRule(
            Collidable.Groups.ENEMY,
            Collidable.Groups.ENEMY,
            'collider'
        );
        
        // Player-wall collision
        if (this.worldWalls && this.worldWalls.children) {
            // Direct collision setup for static walls
            this.physics.add.collider(this.player, this.worldWalls);
            this.physics.add.collider(this.enemies, this.worldWalls);
        }
        
        // Player-enemy overlap (for attack detection)
        this.physics.add.overlap(this.player, this.enemies, null, null, this);
        
        // Projectile collisions
        this.collisionRegistry.addCollisionRule(
            Collidable.Groups.PLAYER_PROJECTILE,
            Collidable.Groups.ENEMY,
            'overlap'
        );
        
        this.collisionRegistry.addCollisionRule(
            Collidable.Groups.PLAYER_PROJECTILE,
            Collidable.Groups.WALL,
            'collider'
        );
        
        // Enemy projectiles hit player
        const enemyProjectileGroup = this.collisionRegistry.getGroup(Collidable.Groups.ENEMY_PROJECTILE);
        if (enemyProjectileGroup) {
            this.physics.add.overlap(enemyProjectileGroup, this.player, null, null, this);
        }
        
        this.collisionRegistry.addCollisionRule(
            Collidable.Groups.ENEMY_PROJECTILE,
            Collidable.Groups.WALL,
            'collider'
        );
    }
    
    setupCamera() {
        this.cameras.main.setBounds(0, 0, 150 * 32, 150 * 32);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);
    }
    
    setupControls() {
        this.playerTarget = null;
        this.pendingItemPickup = null;
        
        // Track mouse button states for continuous movement
        this.isLeftMouseDown = false;
        this.isRightMouseDown = false;
        this.isMiddleMouseDown = false;
        
        // Track timing for click vs hold distinction
        this.leftMouseDownTime = 0;
        this.HOLD_THRESHOLD = 200; // milliseconds to distinguish click from hold
        
        
        // Unified input handling for both item cursor and regular gameplay
        this.input.on('pointerdown', (pointer) => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            
            // Track mouse button states and timing
            if (pointer.leftButtonDown()) {
                this.isLeftMouseDown = true;
                this.leftMouseDownTime = this.time.now;
            }
            if (pointer.rightButtonDown()) this.isRightMouseDown = true;
            if (pointer.middleButtonDown()) this.isMiddleMouseDown = true;
            
            // Handle item on cursor first
            if (this.uiManager && this.uiManager.isItemOnCursor) {
                if (pointer.leftButtonDown()) {
                    // Check if we clicked on empty world space (not on UI)
                    const isInUI = pointer.y < 200 || // Top UI area
                                  pointer.y > this.cameras.main.height - 100 || // Bottom UI area  
                                  pointer.x > this.cameras.main.width - 200; // Right UI area (minimap)
                    
                    if (!isInUI) {
                        this.uiManager.placeItem({x: this.player.x, y: this.player.y}, 'world');
                        return; // Prevent other actions when dropping item
                    }
                    return; // Don't handle movement when we have item on cursor
                } else if (pointer.rightButtonDown()) {
                    // Right-click to cancel drag (Diablo 2 style)
                    this.uiManager.cleanupCursor();
                    return; // Prevent other actions when canceling drag
                }
            }
            
            // Check for ground item clicks first (Diablo 2 style click-to-pickup)
            if (pointer.leftButtonDown()) {
                const clickedItem = this.getItemAtPoint(worldPoint.x, worldPoint.y);
                if (clickedItem) {
                    this.pickupItemByClick(clickedItem);
                    return; // Don't process other actions when picking up item
                }
            }
            
            // Regular gameplay input (movement/skills)
            if (!this.uiManager || !this.uiManager.isItemOnCursor) {
                if (pointer.leftButtonDown()) {
                    // Left click - use LMB mouse hotbar slot (index 0)
                    if (this.uiManager) {
                        this.uiManager.useMouseHotbarSlot(0, worldPoint);
                    }
                    
                } else if (pointer.rightButtonDown()) {
                    // Right click - use RMB mouse hotbar slot (index 2)
                    if (this.uiManager) {
                        this.uiManager.useMouseHotbarSlot(2, worldPoint);
                    }
                    
                } else if (pointer.middleButtonDown()) {
                    // Middle click - use MMB mouse hotbar slot (index 1)
                    if (this.uiManager) {
                        this.uiManager.useMouseHotbarSlot(1, worldPoint);
                    }
                }
            }
        });
        
        // Track mouse button releases
        this.input.on('pointerup', (pointer) => {
            if (pointer.leftButtonReleased()) {
                const holdDuration = this.time.now - this.leftMouseDownTime;
                this.isLeftMouseDown = false;
                
                // Handle click-to-move (quick clicks under threshold)
                if (holdDuration < this.HOLD_THRESHOLD) {
                    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    
                    // Only set target if not over UI or item on cursor
                    if (!this.uiManager || (!this.uiManager.isItemOnCursor && !this.uiManager.isOverUI(pointer))) {
                        // Check if left mouse hotbar has move action
                        const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[0] : null;
                        if (hotbarItem && hotbarItem.type === 'action' && hotbarItem.name === 'move') {
                            this.playerTarget = { x: worldPoint.x, y: worldPoint.y };
                            this.createMoveMarker(worldPoint.x, worldPoint.y);
                            // Clear any portal target when manually moving
                            if (this.player.targetPortal) {
                                this.player.targetPortal = null;
                            }
                        }
                    }
                }
                // For holds, stop continuous movement
                else {
                    const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[0] : null;
                    if (hotbarItem && hotbarItem.type === 'action' && hotbarItem.name === 'move') {
                        this.playerTarget = null;
                        if (this.moveMarker) {
                            this.moveMarker.destroy();
                            this.moveMarker = null;
                        }
                    }
                }
            }
            if (pointer.rightButtonReleased()) {
                this.isRightMouseDown = false;
                // Stop movement when right mouse is released (if it was used for movement)
                const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[2] : null;
                if (hotbarItem && hotbarItem.type === 'action' && hotbarItem.name === 'move') {
                    this.playerTarget = null;
                    if (this.moveMarker) {
                        this.moveMarker.destroy();
                        this.moveMarker = null;
                    }
                }
            }
            if (pointer.middleButtonReleased()) {
                this.isMiddleMouseDown = false;
                // Stop movement when middle mouse is released (if it was used for movement)
                const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[1] : null;
                if (hotbarItem && hotbarItem.type === 'action' && hotbarItem.name === 'move') {
                    this.playerTarget = null;
                    if (this.moveMarker) {
                        this.moveMarker.destroy();
                        this.moveMarker = null;
                    }
                }
            }
        });
        
        // Keyboard controls now handled by UIManager
        
        // Enable right-click context menu prevention
        this.input.mouse.disableContextMenu();
    }
    
    getPlayerCursorWorldPoint() {
        // Get current mouse position and convert to world coordinates
        const pointer = this.input.activePointer;
        return this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    }
    
    // handleHotbarAction is now handled by UIManager
    
    createMoveMarker(x, y) {
        if (this.moveMarker) {
            this.moveMarker.destroy();
        }
        
        this.moveMarker = this.add.graphics();
        this.moveMarker.lineStyle(2, 0x00ff00, 1);
        this.moveMarker.strokeCircle(x, y, 10);
        this.moveMarker.setDepth(100);
        
        // Fade out the marker
        this.tweens.add({
            targets: this.moveMarker,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                if (this.moveMarker) {
                    this.moveMarker.destroy();
                    this.moveMarker = null;
                }
            }
        });
    }
    
    // Skill casting and movement now handled by UIManager
    
    setupUI() {
        // UI is now handled by UIScene
        // Only create game-world UI elements here
        this.createInfoPanel();
        this.createEnemyHealthBarUI();
    }




    createSkillBar() {
        const skillBarY = this.cameras.main.height - 60;
        const centerX = this.cameras.main.width / 2;
        const skillSlotSize = 40;
        const skillSpacing = 50;

        // Skill slots background
        this.skillSlots = this.add.graphics();
        this.skillSlots.setScrollFactor(0).setDepth(1001);

        // Fireball skill slot
        const fireballX = centerX - skillSpacing;
        this.skillSlots.fillStyle(0x1a1a1a, 1);
        this.skillSlots.fillRect(fireballX - skillSlotSize/2, skillBarY - skillSlotSize/2, skillSlotSize, skillSlotSize);
        this.skillSlots.lineStyle(2, 0x8b4513, 1);
        this.skillSlots.strokeRect(fireballX - skillSlotSize/2, skillBarY - skillSlotSize/2, skillSlotSize, skillSlotSize);

        // Frost Nova skill slot
        const frostX = centerX + skillSpacing;
        this.skillSlots.fillStyle(0x1a1a1a, 1);
        this.skillSlots.fillRect(frostX - skillSlotSize/2, skillBarY - skillSlotSize/2, skillSlotSize, skillSlotSize);
        this.skillSlots.lineStyle(2, 0x8b4513, 1);
        this.skillSlots.strokeRect(frostX - skillSlotSize/2, skillBarY - skillSlotSize/2, skillSlotSize, skillSlotSize);

        // Skill icons
        this.fireballIcon = this.add.image(fireballX, skillBarY, 'fireball').setScale(1.5);
        this.fireballIcon.setScrollFactor(0).setDepth(1002);

        this.frostIcon = this.add.image(frostX, skillBarY, 'frost').setScale(0.3);
        this.frostIcon.setScrollFactor(0).setDepth(1002);

        // Skill labels
        this.add.text(fireballX, skillBarY + 30, 'RMB', {
            fontSize: '12px',
            fill: '#cccccc',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);

        this.add.text(frostX, skillBarY + 30, 'SPACE', {
            fontSize: '12px',
            fill: '#cccccc',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);

        // Cooldown overlays
        this.fireballCooldown = this.add.graphics();
        this.fireballCooldown.setScrollFactor(0).setDepth(1004);

        this.frostCooldown = this.add.graphics();
        this.frostCooldown.setScrollFactor(0).setDepth(1004);
    }
    
    createInfoPanel() {
        this.createInfoPanelElements();
    }
    
    createInfoPanelElements() {
        // Destroy existing elements if they exist
        if (this.enemyCount) {
            this.enemyCount.destroy();
        }
        if (this.worldInfo) {
            this.worldInfo.destroy();
        }
        if (this.fpsText) {
            this.fpsText.destroy();
        }
        
        // Enemy counter and world info in top-right (moved under minimap)
        const minimapBottom = 20 + 150 + 10; // minimap Y + size + spacing
        this.enemyCount = this.add.text(this.cameras.main.width - 20, minimapBottom, '', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold',
            backgroundColor: 'rgba(42, 24, 16, 0.8)',
            padding: { x: 10, y: 5 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
        
        this.worldInfo = this.add.text(this.cameras.main.width - 20, minimapBottom + 40, '', {
            fontSize: '16px',
            fill: '#ffdd44',
            fontWeight: 'bold',
            backgroundColor: 'rgba(42, 24, 16, 0.8)',
            padding: { x: 10, y: 5 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
        
        // FPS debug meter
        this.fpsText = this.add.text(this.cameras.main.width - 20, minimapBottom + 80, '', {
            fontSize: '14px',
            fill: '#00ff00',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: { x: 8, y: 4 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
    }
    
    recreateUIElements() {
        this.createInfoPanelElements();
        // Don't recreate enemy health bar UI here - it has its own recreation logic
    }
    
    createEnemyHealthBarUI() {
        // Prevent recursive recreation
        if (this.isRecreatingUI) {
            return;
        }
        this.isRecreatingUI = true;
        
        // Hide any existing health bar first
        this.hideEnemyHealthBar();
        
        // Destroy existing elements first
        if (this.enemyInfoBg && this.enemyInfoBg.destroy) {
            this.enemyInfoBg.destroy();
            this.enemyInfoBg = null;
        }
        if (this.enemyNameText && this.enemyNameText.destroy) {
            this.enemyNameText.destroy();
            this.enemyNameText = null;
        }
        if (this.enemyTypeText && this.enemyTypeText.destroy) {
            this.enemyTypeText.destroy();
            this.enemyTypeText = null;
        }
        if (this.enemyHealthBar && this.enemyHealthBar.destroy) {
            this.enemyHealthBar.destroy();
            this.enemyHealthBar = null;
        }
        
        // Create container for enemy health bar at top of screen
        const centerX = this.cameras.main.width / 2;
        
        // Background for enemy info
        this.enemyInfoBg = this.add.graphics();
        this.enemyInfoBg.setScrollFactor(0);
        this.enemyInfoBg.setDepth(2000);
        this.enemyInfoBg.setVisible(false);
        
        // Enemy name text - create with initial text to ensure proper initialization
        this.enemyNameText = this.add.text(centerX, 20, ' ', {
            fontSize: '18px',
            fill: '#ffffff',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.enemyNameText.setOrigin(0.5);
        this.enemyNameText.setScrollFactor(0);
        this.enemyNameText.setDepth(2001);
        this.enemyNameText.setVisible(false);
        
        // Enemy level/type text - create with initial text to ensure proper initialization
        this.enemyTypeText = this.add.text(centerX, 40, ' ', {
            fontSize: '14px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.enemyTypeText.setOrigin(0.5);
        this.enemyTypeText.setScrollFactor(0);
        this.enemyTypeText.setDepth(2001);
        this.enemyTypeText.setVisible(false);
        
        // Health bar graphics
        this.enemyHealthBar = this.add.graphics();
        this.enemyHealthBar.setScrollFactor(0);
        this.enemyHealthBar.setDepth(2001);
        this.enemyHealthBar.setVisible(false);
        
        // Store current hovered enemy
        this.hoveredEnemy = null;
        
        // Reset recreation flag with a small delay to ensure everything is initialized
        this.time.delayedCall(100, () => {
            this.isRecreatingUI = false;
        });
    }
    
    generateWorld() {
        // Simple cleanup - just nullify references
        this.worldTiles = null;
        this.worldWalls = null;
        this.wallColliders = [];
        
        this.worldGenerator = new WorldGenerator(this, 150, 150, 32, this.currentWorldLevel);
        this.worldTiles = this.worldGenerator.generate();
        
        // Refresh minimap for new world
        if (this.uiManager) {
            this.uiManager.refreshMinimap();
        }
        
        // Get the wall collision group
        this.worldWalls = this.worldGenerator.getWallGroup();
        
        // Add collisions with walls only if we have valid groups
        if (this.worldWalls && this.worldWalls.children && this.player) {
            const playerWallCollider = this.physics.add.collider(this.player, this.worldWalls);
            this.wallColliders.push(playerWallCollider);
        }
        if (this.worldWalls && this.worldWalls.children && this.enemies) {
            const enemyWallCollider = this.physics.add.collider(this.enemies, this.worldWalls);
            this.wallColliders.push(enemyWallCollider);
        }
    }
    
    cleanupCurrentWorld() {
        // Store player reference to preserve it
        const playerRef = this.player;
        
        // Use pool manager to clear all pooled objects
        if (this.poolManager) {
            this.poolManager.clearAll();
        }
        
        // Clean up collision registry
        if (this.collisionRegistry) {
            this.collisionRegistry.cleanup();
        }
        
        // Clean up enemy spawner
        if (this.enemySpawner) {
            this.enemySpawner.cleanupOldGroups();
        }
        
        // CRITICAL: Destroy all particles first - major source of accumulation
        if (this.particles && this.particles.manager) {
            this.particles.manager.emitters.list.forEach(emitter => {
                if (emitter && emitter.destroy) {
                    emitter.destroy();
                }
            });
        }
        
        // Clear all active skills/projectiles by destroying physics groups
        if (this.physics && this.physics.world) {
            // Remove all physics bodies except player
            const bodiesToRemove = [];
            this.physics.world.bodies.entries.forEach(body => {
                if (body.gameObject && body.gameObject !== this.player) {
                    bodiesToRemove.push(body);
                }
            });
            bodiesToRemove.forEach(body => {
                if (body.gameObject && body.gameObject.destroy) {
                    body.gameObject.destroy();
                }
            });
        }
        
        // Clear all enemies with explicit cleanup
        this.enemies.children.entries.forEach(enemy => {
            if (enemy && enemy.destroy) {
                // Cleanup any enemy-specific timers or effects
                // Health bar now handled by hover system
                // if (enemy.healthBar) {
                //     enemy.healthBar.destroy();
                // }
                enemy.destroy();
            }
        });
        // Simple cleanup for groups - let Phaser handle cleanup on scene restart
        this.enemies = null;
        this.itemDrops = null;
        
        // Clear existing portal zone and overlap handler
        if (this.portalOverlap) {
            this.portalOverlap.destroy();
            this.portalOverlap = null;
        }
        
        if (this.exitPortalZone) {
            this.exitPortalZone.destroy();
            this.exitPortalZone = null;
        }
        
        // Clear any existing world tiles and all their children (including portals)
        if (this.worldTiles) {
            // Destroy all children in the world tiles group (including portals)
            this.worldTiles.children.entries.forEach(child => {
                if (child && child.destroy) {
                    child.destroy();
                }
            });
            this.worldTiles.destroy();
            this.worldTiles = null;
        }
        
        // Clear any move target indicators
        if (this.moveTarget) {
            this.moveTarget.destroy();
            this.moveTarget = null;
        }
        
        // ULTRA AGGRESSIVE cleanup - destroy ALL graphics objects except UI
        const graphicsToDestroy = [];
        this.children.list.forEach(child => {
            if (child && child !== this.player) {
                // Preserve ALL UI elements (scrollFactor 0 and depth >= 1000)
                const isUIElement = (child.scrollFactorX === 0 && child.depth >= 1000) ||
                                   // Specific UI elements from GameScene
                                   (child === this.bottomPanel) ||
                                   (child === this.healthOrbBg) ||
                                   (child === this.healthOrb) ||
                                   (child === this.manaOrbBg) ||
                                   (child === this.manaOrb) ||
                                   (child === this.healthText) ||
                                   (child === this.manaText) ||
                                   (child === this.enemyCount) ||
                                   (child === this.worldInfo) ||
                                   (child === this.fpsText) ||
                                   // UIManager elements
                                   (this.uiManager && (
                                       child === this.uiManager.expBarBg ||
                                       child === this.uiManager.expBar ||
                                       child === this.uiManager.expText ||
                                       child === this.uiManager.levelText ||
                                       child === this.uiManager.potionHotbarBg ||
                                       child === this.uiManager.mouseHotbarBg ||
                                       child === this.uiManager.skillsHotbarBg ||
                                       // Check all hotbar slot arrays
                                       (this.uiManager.potionHotbarSlots && this.uiManager.potionHotbarSlots.some(slot => 
                                           slot && (child === slot.background || 
                                           child === slot.label || 
                                           child === slot.icon)
                                       )) ||
                                       (this.uiManager.mouseHotbarSlots && this.uiManager.mouseHotbarSlots.some(slot => 
                                           slot && (child === slot.background || 
                                           child === slot.label || 
                                           child === slot.icon)
                                       )) ||
                                       (this.uiManager.skillsHotbarSlots && this.uiManager.skillsHotbarSlots.some(slot => 
                                           slot && (child === slot.background || 
                                           child === slot.label || 
                                           child === slot.icon)
                                       )) ||
                                       // Preserve minimap container and its elements
                                       child === this.uiManager.minimapContainer
                                   ));
                
                if (!isUIElement) {
                    graphicsToDestroy.push(child);
                }
            }
        });
        
        // Destroy all non-essential objects
        graphicsToDestroy.forEach(child => {
            if (child && child.destroy) {
                child.destroy();
            }
        });
        
        // Stop ALL tweens and timers
        this.tweens.killAll();
        this.time.removeAllEvents();
        
        // No enemy spawn timer needed with fixed spawns
        
        // Recreate physics groups (safer than nuclear reset)
        if (this.physics && this.physics.world) {
            // Recreate groups
            this.enemies = this.physics.add.group({
                classType: Enemy,
                runChildUpdate: true
            });
            
            this.itemDrops = this.add.group();
            
            // Re-enable collisions
            this.physics.add.collider(this.enemies, this.enemies);
            // No automatic pickup - items require clicking in Diablo 2 style
            
            // Don't add wall collisions here - walls have been destroyed
            // Wall collisions will be re-added after new world is generated
        }
        
        // Force multiple garbage collection hints
        if (window.gc) {
            window.gc();
            setTimeout(() => window.gc && window.gc(), 100);
            setTimeout(() => window.gc && window.gc(), 200);
        }
    }
    
    setupPortalCollision() {
        // Clear existing portal zone if it exists
        if (this.exitPortalZone) {
            this.exitPortalZone.destroy();
        }
        
        // Remove any existing overlap handlers for portal collision
        if (this.portalOverlap) {
            this.portalOverlap.destroy();
        }
        
        // Create invisible collision area for exit portal
        const portalPos = this.worldGenerator.getExitPortalPosition();
        this.exitPortalZone = this.add.zone(portalPos.x, portalPos.y, 50, 50);
        this.physics.world.enable(this.exitPortalZone);
        this.exitPortalZone.body.setImmovable(true);
        
        // Store the overlap handler so we can clean it up later
        this.portalOverlap = this.physics.add.overlap(this.player, this.exitPortalZone, this.handleWorldTransition, null, this);
        
        // Listen for portal collision events
        const eventBus = CollisionEventBus.getInstance();
        this.portalUnsubscribe = eventBus.on(CollisionEventBus.Events.PLAYER_PORTAL, (data) => {
            if (data.player === this.player && data.type === 'enter') {
                // Portal entry handled by collision handler
            }
        }, this);
    }
    
    handleWorldTransition() {
        // Prevent multiple transitions
        if (this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Emit world transition event
        const eventBus = CollisionEventBus.getInstance();
        eventBus.emit(CollisionEventBus.Events.PLAYER_PORTAL, {
            player: this.player,
            portal: this.exitPortalZone,
            type: 'world_transition',
            fromWorld: this.currentWorldLevel,
            toWorld: this.currentWorldLevel + 1
        });
        
        // Transition to next world
        this.currentWorldLevel++;
        
        // Emit world transition start event for UIScene
        this.events.emit('world-transition-start');
        
        // Make player invulnerable during transition
        this.player.isInvulnerable = true;
        
        // Show transition message
        const transitionText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Entering World ${this.currentWorldLevel}...`,
            {
                fontSize: '48px',
                fill: '#ffff00',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: { x: 30, y: 15 },
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5000);
        
        // No enemy spawning timer to pause
        
        // Fade transition
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        // Wait for fade to complete before doing anything
        this.time.delayedCall(1200, () => {
            // Complete cleanup of previous world
            this.cleanupCurrentWorld();
            
            // Wait a moment for cleanup to fully complete before generating new world
            this.time.delayedCall(200, () => {
                // Generate new world
                this.generateWorld();
                
                // Get spawn position and move player
                const newSpawnPos = this.worldGenerator.getTownHallSpawnPosition();
                
                // Restore player to full health and position
                this.player.health = this.player.maxHealth;
                this.player.mana = this.player.maxMana;
                this.player.setPosition(newSpawnPos.x, newSpawnPos.y);
                this.player.setVelocity(0, 0); // Stop any movement
                this.playerTarget = null; // Clear movement target to prevent automatic movement
                this.player.setVisible(true);
                this.player.setActive(true);
                this.player.setAlpha(1); // Ensure full opacity
                this.player.setDepth(10); // Make sure player is above ground
                
                // Ensure camera is properly set up
                this.cameras.main.stopFollow();
                this.cameras.main.startFollow(this.player);
                this.cameras.main.centerOn(this.player.x, this.player.y);
                
                // UI is now managed by UIScene, no need to recreate
                
                // Only recreate game-specific UI elements
                this.recreateUIElements();
                this.createEnemyHealthBarUI();
                
                // Hide enemy health bar during transition
                this.hideEnemyHealthBar();
                
                // Hide ground item tooltip during transition
                this.hideGroundItemTooltip();
                
                // Wait a moment before spawning enemies to ensure player is safe
                this.time.delayedCall(500, () => {
                    // Reinitialize collision registry for new world
                    this.collisionRegistry = new CollisionRegistry(this);
                    
                    // Re-register collision groups
                    this.collisionRegistry.registerGroup(Collidable.Groups.PLAYER);
                    this.collisionRegistry.registerGroup(Collidable.Groups.ENEMY, {
                        classType: Enemy,
                        runChildUpdate: true
                    });
                    this.collisionRegistry.registerGroup(Collidable.Groups.PLAYER_PROJECTILE);
                    this.collisionRegistry.registerGroup(Collidable.Groups.ENEMY_PROJECTILE);
                    this.collisionRegistry.registerGroup(Collidable.Groups.WALL);
                    this.collisionRegistry.registerGroup(Collidable.Groups.ITEM);
                    this.collisionRegistry.registerGroup(Collidable.Groups.PORTAL);
                    this.collisionRegistry.registerGroup(Collidable.Groups.AREA_EFFECT);
                    
                    // Don't add player to group - it's a single entity with its own physics body
                    
                    // Get enemy group from registry
                    this.enemies = this.collisionRegistry.getGroup(Collidable.Groups.ENEMY);
                    
                    // Setup collision rules
                    this.setupCollisionRules();
                    
                    // Setup new portal collision
                    this.setupPortalCollision();
                    
                    // Generate new fixed spawn data for this world
                    this.worldSpawns = this.enemySpawner.generateWorldSpawns(this.currentWorldLevel);
                    
                    // Spawn initial enemies for new world
                    this.spawnInitialEnemies();
                    
                    // Remove invulnerability after everything is set up
                    this.time.delayedCall(1000, () => {
                        this.player.isInvulnerable = false;
                    });
                });
                
                // Fade back in
                this.cameras.main.fadeIn(1500, 0, 0, 0);
                
                // Remove transition text and reset flag after fade completes
                this.time.delayedCall(1500, () => {
                    transitionText.destroy();
                    this.isTransitioning = false;
                    
                    // Emit world transition complete event for UIScene
                    this.events.emit('world-transition-complete');
                });
            });
        });
    }
    
    spawnInitialEnemies() {
        // Spawn all fixed enemies for this world
        const spawned = this.enemySpawner.spawnWorldEnemies(
            this.worldSpawns, 
            this.player.level, 
            this.currentWorldLevel
        );
        
        console.log(`Spawned ${spawned} enemies for world ${this.currentWorldLevel}`);
    }

    update(time, delta) {
        if (!this.player.active) {
            this.gameOver();
            return;
        }

        // Handle continuous movement when mouse button is held down (only for holds, not clicks)
        if (this.isLeftMouseDown && (this.time.now - this.leftMouseDownTime) >= this.HOLD_THRESHOLD) {
            const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[0] : null;
            if (hotbarItem && hotbarItem.type === 'action' && hotbarItem.name === 'move') {
                const worldPoint = this.getPlayerCursorWorldPoint();
                this.playerTarget = { x: worldPoint.x, y: worldPoint.y };
                // Clear any portal target when manually moving
                if (this.player.targetPortal) {
                    this.player.targetPortal = null;
                }
            }
        }

        this.player.update(this.playerTarget);

        // Check if player has reached a pending item pickup
        if (this.pendingItemPickup && this.pendingItemPickup.active) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pendingItemPickup.x, this.pendingItemPickup.y);
            const pickupRange = 48; // Same range as initial check

            if (distance <= pickupRange) {
                // Player is now close enough - attempt pickup
                const success = this.uiManager.addItemToInventory(this.pendingItemPickup.itemData);
                if (success) {
                    // Track item pickup for statistics
                    if (this.playerStats) {
                        this.playerStats.itemsCollected++;
                    }
                    // Show pickup text
                    const pickupText = this.add.text(this.pendingItemPickup.x, this.pendingItemPickup.y - 20, this.pendingItemPickup.itemData.name, {
                        fontSize: '12px',
                        fill: this.pendingItemPickup.itemData.getDisplayName().color,
                        fontWeight: 'bold'
                    }).setOrigin(0.5).setDepth(1000);

                    this.tweens.add({
                        targets: pickupText,
                        y: pickupText.y - 30,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => pickupText.destroy()
                    });

                    this.pendingItemPickup.destroy();
                } else {
                    // Show "inventory full" message
                    const fullText = this.add.text(this.pendingItemPickup.x, this.pendingItemPickup.y - 20, 'Inventory Full!', {
                        fontSize: '12px',
                        fill: '#ff0000',
                        fontWeight: 'bold'
                    }).setOrigin(0.5).setDepth(1000);

                    this.tweens.add({
                        targets: fullText,
                        y: fullText.y - 30,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => fullText.destroy()
                    });
                }

                // Clear the pending pickup
                this.pendingItemPickup = null;
                this.playerTarget = null; // Stop movement
            }
        }

        // Update collision registry
        if (this.collisionRegistry) {
            this.collisionRegistry.update();
        }

        // Update enemy hover detection
        this.updateEnemyHover();

        // Update ground item hover detection
        this.updateGroundItemHover();


        // Update new UI system
        if (this.uiManager) {
            this.uiManager.updateUI();
        }

        // Throttle UI text updates for performance
        if (!this.lastUIUpdate) this.lastUIUpdate = 0;
        if (time - this.lastUIUpdate > 200) { // Update every 200ms instead of every frame
            try {
                if (this.enemyCount && this.enemyCount.active && this.enemyCount.setText) {
                    this.enemyCount.setText(`Enemies: ${this.enemies.children.entries.length}`);
                }

                if (this.worldInfo && this.worldInfo.active && this.worldInfo.setText) {
                    this.worldInfo.setText(`World: ${this.currentWorldLevel}`);
                }

                if (this.fpsText && this.fpsText.active && this.fpsText.setText) {
                    const fps = Math.round(this.game.loop.actualFps);
                    const fpsColor = fps >= 50 ? '#00ff00' : fps >= 30 ? '#ffaa00' : '#ff0000';
                    this.fpsText.setColor(fpsColor);
                    this.fpsText.setText(`FPS: ${fps}`);
                }
                this.lastUIUpdate = time;
            } catch (error) {
                // If text objects are corrupted, recreate only info panel elements
                console.warn('Text object error, recreating info panel elements:', error);
                this.createInfoPanelElements();
            }
        }

    }

    updateEnemyHover() {
        // Skip if UI is being recreated
        if (this.isRecreatingUI) {
            return;
        }
        
        // Get mouse position in world coordinates
        const pointer = this.input.activePointer;
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        // Find enemy under mouse
        let enemyUnderMouse = null;
        let closestDistance = Infinity;
        
        this.enemies.children.entries.forEach(enemy => {
            if (enemy && enemy.active) {
                const distance = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, enemy.x, enemy.y);
                // Check if mouse is over enemy (within sprite bounds)
                if (distance < 20 && distance < closestDistance) {
                    closestDistance = distance;
                    enemyUnderMouse = enemy;
                }
            }
        });
        
        // Update hovered enemy
        if (enemyUnderMouse !== this.hoveredEnemy) {
            this.hoveredEnemy = enemyUnderMouse;
            
            if (this.hoveredEnemy) {
                this.showEnemyHealthBar(this.hoveredEnemy);
                // Emit event for UIScene
                this.events.emit('enemy-hover-start', this.hoveredEnemy);
            } else {
                this.hideEnemyHealthBar();
                // Emit event for UIScene
                this.events.emit('enemy-hover-end');
            }
        } else if (this.hoveredEnemy) {
            // Update health bar for current enemy
            this.updateEnemyHealthBar(this.hoveredEnemy);
        }
    }
    
    showEnemyHealthBar(enemy) {
        // Ensure UI is created
        this.ensureEnemyHealthBarUI();
        
        // Check if UI elements exist before using them
        if (!this.enemyInfoBg || !this.enemyNameText || !this.enemyTypeText || !this.enemyHealthBar) {
            return;
        }
        
        // Show all UI elements
        this.enemyInfoBg.setVisible(true);
        this.enemyNameText.setVisible(true);
        this.enemyTypeText.setVisible(true);
        this.enemyHealthBar.setVisible(true);
        
        // Update texts safely
        const enemyName = enemy.isBoss ? enemy.bossName : (enemy.config ? enemy.config.name : 'Unknown Enemy');
        const typeText = enemy.isBoss ? `Level ${enemy.level} Boss` : `Level ${enemy.level}`;
        
        // Use a safe text update method
        this.safeSetText(this.enemyNameText, enemyName);
        this.safeSetText(this.enemyTypeText, typeText);
        
        // Update health bar
        this.updateEnemyHealthBar(enemy);
        
        // Draw background
        const centerX = this.cameras.main.width / 2;
        if (this.enemyInfoBg && this.enemyInfoBg.clear) {
            this.enemyInfoBg.clear();
            this.enemyInfoBg.fillStyle(0x000000, 0.8);
            this.enemyInfoBg.fillRect(centerX - 150, 10, 300, 60);
            this.enemyInfoBg.lineStyle(2, enemy.isBoss ? 0xffd700 : 0x808080, 1);
            this.enemyInfoBg.strokeRect(centerX - 150, 10, 300, 60);
        }
    }
    
    safeSetText(textObject, text) {
        if (!textObject || !text) return;
        
        try {
            // Check if the text object is in a valid state
            if (textObject.texture && textObject.frame && textObject.setText) {
                textObject.setText(text);
            } else {
                // Text object is invalid, mark for recreation
                this.needsEnemyHealthBarRecreation = true;
            }
        } catch (error) {
            // Silently handle error and mark for recreation
            this.needsEnemyHealthBarRecreation = true;
        }
    }
    
    ensureEnemyHealthBarUI() {
        // Check if we need to recreate the UI
        if (this.needsEnemyHealthBarRecreation || !this.enemyNameText || !this.enemyTypeText) {
            this.createEnemyHealthBarUI();
            this.needsEnemyHealthBarRecreation = false;
        }
    }
    
    updateEnemyHealthBar(enemy) {
        if (!enemy || !enemy.active) {
            this.hideEnemyHealthBar();
            return;
        }
        
        // Check if health bar graphics exists
        if (!this.enemyHealthBar || !this.enemyHealthBar.clear) {
            return;
        }
        
        const centerX = this.cameras.main.width / 2;
        const barWidth = 250;
        const barHeight = 8;
        const barY = 50;
        
        this.enemyHealthBar.clear();
        
        // Background
        this.enemyHealthBar.fillStyle(0x000000, 1);
        this.enemyHealthBar.fillRect(centerX - barWidth/2, barY, barWidth, barHeight);
        
        // Border
        this.enemyHealthBar.lineStyle(1, enemy.isBoss ? 0xffd700 : 0x808080, 1);
        this.enemyHealthBar.strokeRect(centerX - barWidth/2, barY, barWidth, barHeight);
        
        // Health fill
        const healthPercent = Math.max(0, enemy.health / enemy.maxHealth);
        if (healthPercent > 0) {
            this.enemyHealthBar.fillStyle(0xff0000, 1);
            this.enemyHealthBar.fillRect(centerX - barWidth/2 + 1, barY + 1, (barWidth - 2) * healthPercent, barHeight - 2);
        }
    }
    
    hideEnemyHealthBar() {
        if (this.enemyInfoBg && this.enemyInfoBg.setVisible) {
            this.enemyInfoBg.setVisible(false);
        }
        if (this.enemyNameText && this.enemyNameText.setVisible) {
            this.enemyNameText.setVisible(false);
        }
        if (this.enemyTypeText && this.enemyTypeText.setVisible) {
            this.enemyTypeText.setVisible(false);
        }
        if (this.enemyHealthBar && this.enemyHealthBar.setVisible) {
            this.enemyHealthBar.setVisible(false);
        }
        this.hoveredEnemy = null;
    }
    
    getItemAtPoint(worldX, worldY) {
        // Find ground item at clicked point
        let clickedItem = null;
        let closestDistance = Infinity;
        const maxPickupDistance = 30; // Pickup radius in pixels
        
        this.itemDrops.children.entries.forEach(itemSprite => {
            if (itemSprite && itemSprite.active && itemSprite.isItemDrop) {
                const distance = Phaser.Math.Distance.Between(worldX, worldY, itemSprite.x, itemSprite.y);
                if (distance <= maxPickupDistance && distance < closestDistance) {
                    closestDistance = distance;
                    clickedItem = itemSprite;
                }
            }
        });
        
        return clickedItem;
    }
    
    getItemAtPointForTooltip(worldX, worldY) {
        // Find ground item at mouse point with smaller radius for more precise tooltip detection
        let hoveredItem = null;
        let closestDistance = Infinity;
        const maxHoverDistance = 20; // Smaller radius for tooltips to be more precise
        
        this.itemDrops.children.entries.forEach(itemSprite => {
            if (itemSprite && itemSprite.active && itemSprite.isItemDrop) {
                const distance = Phaser.Math.Distance.Between(worldX, worldY, itemSprite.x, itemSprite.y);
                if (distance <= maxHoverDistance && distance < closestDistance) {
                    closestDistance = distance;
                    hoveredItem = itemSprite;
                }
            }
        });
        
        return hoveredItem;
    }
    
    pickupItemByClick(itemSprite) {
        if (itemSprite.isItemDrop && this.uiManager) {
            // Check if this item was recently dropped by the player
            if (itemSprite.playerDropped && itemSprite.dropTime) {
                const timeSinceDrop = this.time.now - itemSprite.dropTime;
                const pickupDelay = 1000; // 1 second delay before pickup allowed
                
                if (timeSinceDrop < pickupDelay) {
                    return; // Don't pick up yet
                }
                
                // Clear the player dropped flag after delay
                itemSprite.playerDropped = false;
            }
            
            // Check distance to item - player must be close enough to pick it up
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, itemSprite.x, itemSprite.y);
            const pickupRange = 48; // About 1.5 tiles (32px per tile)
            
            if (distance > pickupRange) {
                // Player is too far - move them to the item first
                this.playerTarget = { x: itemSprite.x, y: itemSprite.y };
                this.createMoveMarker(itemSprite.x, itemSprite.y);
                
                // Store the item to pick up once player reaches it
                this.pendingItemPickup = itemSprite;
                
                // Clear any portal target when picking up items
                if (this.player.targetPortal) {
                    this.player.targetPortal = null;
                }
                return;
            }
            
            // Emit item pickup event
            const eventBus = CollisionEventBus.getInstance();
            eventBus.emit(CollisionEventBus.Events.PLAYER_ITEM, {
                player: this.player,
                item: itemSprite,
                type: 'pickup_attempt'
            });
            
            const success = this.uiManager.addItemToInventory(itemSprite.itemData);
            if (success) {
                // Track item pickup for statistics
                if (this.playerStats) {
                    this.playerStats.itemsCollected++;
                }
                // Show pickup text
                const pickupText = this.add.text(itemSprite.x, itemSprite.y - 20, itemSprite.itemData.name, {
                    fontSize: '12px',
                    fill: itemSprite.itemData.getDisplayName().color,
                    fontWeight: 'bold'
                }).setOrigin(0.5).setDepth(1000);
                
                this.tweens.add({
                    targets: pickupText,
                    y: pickupText.y - 30,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => pickupText.destroy()
                });
                
                itemSprite.destroy();
                
                // Emit pickup success event
                eventBus.emit(CollisionEventBus.Events.PLAYER_ITEM, {
                    player: this.player,
                    item: itemSprite,
                    itemData: itemSprite.itemData,
                    type: 'pickup_success'
                });
            } else {
                // Show "inventory full" message
                const fullText = this.add.text(itemSprite.x, itemSprite.y - 20, 'Inventory Full!', {
                    fontSize: '12px',
                    fill: '#ff4444',
                    fontWeight: 'bold'
                }).setOrigin(0.5).setDepth(1000);
                
                this.tweens.add({
                    targets: fullText,
                    y: fullText.y - 30,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => fullText.destroy()
                });
            }
        }
    }
    
    updateGroundItemHover() {
        // Skip if UI is open or item is on cursor
        if (this.uiManager && (this.uiManager.isInventoryOpen || this.uiManager.isCharacterSheetOpen || this.uiManager.isSkillsTreeOpen || this.uiManager.isItemOnCursor)) {
            this.hideGroundItemTooltip();
            return;
        }
        
        // Get mouse position in world coordinates
        const pointer = this.input.activePointer;
        if (!pointer) {
            this.hideGroundItemTooltip();
            return;
        }
        
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        // Find ground item under mouse with smaller detection radius for tooltips
        const itemUnderMouse = this.getItemAtPointForTooltip(worldPoint.x, worldPoint.y);
        
        // Update hovered ground item
        if (itemUnderMouse !== this.hoveredGroundItem) {
            // Always hide tooltip first when changing items
            this.hideGroundItemTooltip();
            
            this.hoveredGroundItem = itemUnderMouse;
            
            if (this.hoveredGroundItem) {
                this.showGroundItemTooltip(this.hoveredGroundItem, pointer.x, pointer.y);
            }
        } else if (this.hoveredGroundItem && this.groundItemTooltip) {
            // Double-check that we're still actually hovering over the item
            const currentItem = this.getItemAtPointForTooltip(worldPoint.x, worldPoint.y);
            if (currentItem !== this.hoveredGroundItem) {
                // We moved away, hide tooltip
                this.hideGroundItemTooltip();
            } else {
                // Update tooltip position to follow mouse
                this.groundItemTooltip.x = pointer.x + 15;
                this.groundItemTooltip.y = pointer.y - 10;
            }
        } else if (this.groundItemTooltip && !this.hoveredGroundItem) {
            // Safety check: if we have a tooltip but no hovered item, hide it
            this.hideGroundItemTooltip();
        }
    }
    
    showGroundItemTooltip(itemSprite, mouseX, mouseY) {
        // Hide existing tooltip first
        this.hideGroundItemTooltip();
        
        if (!itemSprite || !itemSprite.itemData) return;
        
        const item = itemSprite.itemData;
        
        // Use the new Diablo 2-style tooltip system through UIManager
        if (this.uiManager) {
            this.uiManager.showInventoryItemTooltip(item, mouseX, mouseY);
            // Store reference for cleanup
            this.groundItemTooltip = this.uiManager.tooltipContainer;
        }
    }
    
    hideGroundItemTooltip() {
        if (this.uiManager) {
            this.uiManager.hideTooltip();
        }
        this.groundItemTooltip = null;
        this.hoveredGroundItem = null;
    }



    updateSkillCooldowns(time) {
        const skillBarY = this.cameras.main.height - 60;
        const centerX = this.cameras.main.width / 2;
        const skillSlotSize = 40;
        const skillSpacing = 50;

        // Update fireball cooldown
        const fireballCooldown = Math.max(0, this.player.skills.fireball.cooldown - (time - this.player.skills.fireball.lastUsed));
        const fireballPercent = fireballCooldown / this.player.skills.fireball.cooldown;

        this.fireballCooldown.clear();
        if (fireballPercent > 0) {
            const fireballX = centerX - skillSpacing;
            this.fireballCooldown.fillStyle(0x000000, 0.7);
            this.fireballCooldown.fillRect(
                fireballX - skillSlotSize/2,
                skillBarY - skillSlotSize/2 + (skillSlotSize * (1 - fireballPercent)),
                skillSlotSize,
                skillSlotSize * fireballPercent
            );
        }

        // Update frost nova cooldown
        const frostNovaCooldown = Math.max(0, this.player.skills.frostNova.cooldown - (time - this.player.skills.frostNova.lastUsed));
        const frostPercent = frostNovaCooldown / this.player.skills.frostNova.cooldown;

        this.frostCooldown.clear();
        if (frostPercent > 0) {
            const frostX = centerX + skillSpacing;
            this.frostCooldown.fillStyle(0x000000, 0.7);
            this.frostCooldown.fillRect(
                frostX - skillSlotSize/2,
                skillBarY - skillSlotSize/2 + (skillSlotSize * (1 - frostPercent)),
                skillSlotSize,
                skillSlotSize * frostPercent
            );
        }
    }
    
    gameOver() {
        // No enemy spawn timer to remove with fixed spawns
        
        // Calculate play time
        const playTime = this.time.now - this.gameStartTime;
        
        // Prepare player data for EndGameScreen
        const playerData = {
            level: this.player.level,
            experience: this.player.experience,
            worldLevel: this.currentWorldLevel,
            enemiesKilled: this.playerStats.enemiesKilled,
            itemsCollected: this.playerStats.itemsCollected,
            playTime: playTime
        };
        
        // Fade out and transition to EndGameScreen
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.time.delayedCall(1500, () => {
            this.scene.start('EndGameScreen', playerData);
        });
    }
    
    respawnPlayer() {
        if (this.player) {
            // Reset death state
            this.player.isDead = false;
            
            // Restore health and mana to full
            this.player.health = this.player.maxHealth;
            this.player.mana = this.player.maxMana;
            
            // Teleport player to town center
            const spawnPos = this.worldGenerator.getTownHallSpawnPosition();
            this.player.setPosition(spawnPos.x, spawnPos.y);
            
            // Stop player movement
            this.player.body.setVelocity(0);
            this.playerTarget = null;
            
            // Update UI to reflect restored health/mana and experience changes
            if (this.uiManager) {
                this.uiManager.updateHealthManaGlobes();
                this.uiManager.updateExperienceBar();
            }
            
            // Fade the game scene back in
            this.cameras.main.fadeIn(800, 0, 0, 0);
        }
    }
    
    createTownPortal() {
        // Check if player already has an active portal
        if (this.activePortals.length > 0) {
            // Destroy existing portal(s)
            this.activePortals.forEach(portal => {
                if (portal && !portal.destroyed) {
                    portal.destroyPortal();
                }
            });
            this.activePortals = [];
        }
        
        // Don't allow portal creation if player is dead
        if (this.player.isDead) {
            return;
        }
        
        // Don't allow portal creation if player is in town
        if (this.worldGenerator && this.worldGenerator.isInTown(this.player.x, this.player.y)) {
            return;
        }
        
        // Create new portal at player position
        const fieldPortal = new TownPortal(this, this.player.x, this.player.y, false);
        this.activePortals.push(fieldPortal);
        
        // Add portal to collision system
        if (this.collisionRegistry) {
            const portalGroup = this.collisionRegistry.getGroup(Collidable.Groups.PORTAL);
            if (portalGroup) {
                portalGroup.add(fieldPortal);
            }
        }
        
        // Play portal creation sound effect (if we had one)
        // this.sound.play('portal_open');
    }
    
    teleportToTown(returnData) {
        // Store return data for creating return portal
        this.townReturnData = returnData;
        
        // Transition to town
        this.isTransitioning = true;
        
        // Fade out
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.time.delayedCall(500, () => {
            // Move player to town hall spawn position
            const spawnPos = this.worldGenerator.getTownHallSpawnPosition();
            this.player.x = spawnPos.x;
            this.player.y = spawnPos.y;
            
            // Reset player velocity
            this.player.body.setVelocity(0, 0);
            
            // Clear any active player target
            this.playerTarget = null;
            
            // Check if we already have a return portal in town to avoid duplicates
            let hasReturnPortal = false;
            for (const portal of this.activePortals) {
                if (portal && !portal.destroyed && portal.isReturnPortal) {
                    hasReturnPortal = true;
                    break;
                }
            }
            
            // Only create return portal if we don't already have one
            if (this.townReturnData && !hasReturnPortal) {
                const returnPortal = new TownPortal(
                    this, 
                    spawnPos.x + 100, // Offset from spawn position
                    spawnPos.y, 
                    true, 
                    this.townReturnData
                );
                
                this.activePortals.push(returnPortal);
                
                // Add to collision system
                if (this.collisionRegistry) {
                    const portalGroup = this.collisionRegistry.getGroup(Collidable.Groups.PORTAL);
                    if (portalGroup) {
                        portalGroup.add(returnPortal);
                    }
                }
            }
            
            // Fade back in
            this.cameras.main.fadeIn(500, 0, 0, 0);
            this.isTransitioning = false;
        });
    }
    
    returnFromTown(returnData) {
        if (!returnData) return;
        
        this.isTransitioning = true;
        
        // Fade out
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.time.delayedCall(500, () => {
            // Move player back to original position
            this.player.x = returnData.x;
            this.player.y = returnData.y;
            
            // Reset player velocity
            this.player.body.setVelocity(0, 0);
            
            // Clear any active player target
            this.playerTarget = null;
            
            // Clear all portals (both field and town portals disappear)
            this.activePortals.forEach(portal => {
                if (portal && !portal.destroyed) {
                    portal.destroyPortal();
                }
            });
            this.activePortals = [];
            
            // Clear town return data
            this.townReturnData = null;
            
            // Fade back in
            this.cameras.main.fadeIn(500, 0, 0, 0);
            this.isTransitioning = false;
        });
    }
    
    // Methods for UIScene communication
    dropItemAtPosition(item, worldPos) {
        // Create item drop at world position
        const itemDrop = new Item(this, worldPos.x, worldPos.y, item);
        this.itemDrops.add(itemDrop);
    }
    
    playerCastSkill(skillId, targetPos) {
        // Cast skill through player
        if (this.player && this.player[skillId]) {
            this.player[skillId](targetPos);
        }
    }
}