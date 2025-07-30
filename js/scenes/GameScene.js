class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.currentWorldLevel = 1;
    }
    
    create() {
        // Initialize transition flag
        this.isTransitioning = false;
        
        this.generateWorld();
        
        this.physics.world.setBounds(0, 0, 150 * 32, 150 * 32);
        
        // Spawn player at town hall
        const spawnPos = this.worldGenerator.getTownHallSpawnPosition();
        this.player = new Player(this, spawnPos.x, spawnPos.y);
        
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });
        
        // Initialize item drops group
        this.itemDrops = this.add.group();
        
        this.spawnEnemies(35);
        
        this.setupCamera();
        this.setupControls();
        this.setupUI();
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this);
        
        // Enemies can collide with each other but not with player (so they can attack)
        this.physics.add.collider(this.enemies, this.enemies);
        
        // Item pickup collision
        this.physics.add.overlap(this.player, this.itemDrops, this.pickupItem, null, this);
        
        // Portal collision for world transition
        this.setupPortalCollision();
        
        // Re-enable periodic enemy spawning with higher rate
        this.enemySpawnTimer = this.time.addEvent({
            delay: 6000, // Spawn every 6 seconds
            callback: () => this.spawnEnemies(5), // Spawn 5 enemies at a time
            loop: true
        });
    }
    
    setupCamera() {
        this.cameras.main.setBounds(0, 0, 150 * 32, 150 * 32);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);
    }
    
    setupControls() {
        this.playerTarget = null;
        
        this.input.on('pointerdown', (pointer) => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            
            if (pointer.leftButtonDown()) {
                // Left click - use LMB hotbar slot (index 6)
                this.handleHotbarAction(6, worldPoint);
                
            } else if (pointer.rightButtonDown()) {
                // Right click - use RMB hotbar slot (index 7)
                this.handleHotbarAction(7, worldPoint);
                
            } else if (pointer.middleButtonDown()) {
                // Middle click to teleport (legacy)
                this.player.castTeleport(worldPoint.x, worldPoint.y);
            }
        });
        
        // Keyboard controls for hotbar slots 1-6
        this.input.keyboard.on('keydown-ONE', () => {
            this.handleHotbarAction(0, this.getPlayerCursorWorldPoint());
        });
        this.input.keyboard.on('keydown-TWO', () => {
            this.handleHotbarAction(1, this.getPlayerCursorWorldPoint());
        });
        this.input.keyboard.on('keydown-THREE', () => {
            this.handleHotbarAction(2, this.getPlayerCursorWorldPoint());
        });
        this.input.keyboard.on('keydown-FOUR', () => {
            this.handleHotbarAction(3, this.getPlayerCursorWorldPoint());
        });
        this.input.keyboard.on('keydown-FIVE', () => {
            this.handleHotbarAction(4, this.getPlayerCursorWorldPoint());
        });
        this.input.keyboard.on('keydown-SIX', () => {
            this.handleHotbarAction(5, this.getPlayerCursorWorldPoint());
        });
        
        // Enable right-click context menu prevention
        this.input.mouse.disableContextMenu();
    }
    
    getPlayerCursorWorldPoint() {
        // Get current mouse position and convert to world coordinates
        const pointer = this.input.activePointer;
        return this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    }
    
    handleHotbarAction(slotIndex, worldPoint) {
        const hotbarItem = this.player.hotbar[slotIndex];
        if (!hotbarItem) return;
        
        if (hotbarItem.type === 'skill') {
            this.handleSkillCast(hotbarItem.name, worldPoint);
        } else if (hotbarItem.type === 'item') {
            this.uiManager.useItem(hotbarItem.item);
        } else if (hotbarItem.type === 'action') {
            if (hotbarItem.name === 'move') {
                this.handleMovement(worldPoint);
            }
        }
    }
    
    handleSkillCast(skillName, worldPoint) {
        switch (skillName) {
            case 'fireball':
                this.player.castFireball(worldPoint.x, worldPoint.y);
                break;
            case 'frostNova':
                this.player.castFrostNova();
                break;
            case 'teleport':
                this.player.castTeleport(worldPoint.x, worldPoint.y);
                break;
            case 'chainLightning':
                this.player.castChainLightning();
                break;
            case 'iceBolt':
                this.player.castIceBolt(worldPoint.x, worldPoint.y);
                break;
            case 'meteor':
                this.player.castMeteor(worldPoint.x, worldPoint.y);
                break;
        }
    }
    
    handleMovement(worldPoint) {
        // Movement logic
        this.playerTarget = { x: worldPoint.x, y: worldPoint.y };
        
        // Visual feedback for movement target
        if (this.moveTarget) this.moveTarget.destroy();
        this.moveTarget = this.add.graphics();
        this.moveTarget.lineStyle(2, 0xffffff, 0.8);
        this.moveTarget.strokeCircle(worldPoint.x, worldPoint.y, 10);
        this.moveTarget.setDepth(100);
        
        this.time.delayedCall(1000, () => {
            if (this.moveTarget) this.moveTarget.destroy();
        });
    }
    
    setupUI() {
        // Create basic bottom panel for health/mana orbs only
        this.createBottomPanel();
        this.createHealthOrb();
        this.createManaOrb();
        this.createInfoPanel();
    }
    
    createBottomPanel() {
        const panelHeight = 120;
        const panelY = this.cameras.main.height - panelHeight;
        
        // Main panel background
        this.bottomPanel = this.add.graphics();
        this.bottomPanel.fillStyle(0x2a1810, 0.95);
        this.bottomPanel.fillRect(0, panelY, this.cameras.main.width, panelHeight);
        
        // Panel border
        this.bottomPanel.lineStyle(2, 0x8b4513, 1);
        this.bottomPanel.strokeRect(0, panelY, this.cameras.main.width, panelHeight);
        
        // Decorative lines
        this.bottomPanel.lineStyle(1, 0x654321, 0.8);
        this.bottomPanel.lineBetween(0, panelY + 5, this.cameras.main.width, panelY + 5);
        this.bottomPanel.lineBetween(0, panelY + panelHeight - 5, this.cameras.main.width, panelY + panelHeight - 5);
        
        this.bottomPanel.setScrollFactor(0).setDepth(1000);
    }
    
    createHealthOrb() {
        const orbSize = 80;
        const orbX = 50;
        const orbY = this.cameras.main.height - 100;
        
        // Health orb background (dark red)
        this.healthOrbBg = this.add.graphics();
        this.healthOrbBg.fillStyle(0x330000, 1);
        this.healthOrbBg.fillCircle(orbX, orbY, orbSize / 2);
        this.healthOrbBg.lineStyle(3, 0x8b0000, 1);
        this.healthOrbBg.strokeCircle(orbX, orbY, orbSize / 2);
        this.healthOrbBg.setScrollFactor(0).setDepth(1001);
        
        // Health orb fill
        this.healthOrb = this.add.graphics();
        this.healthOrb.setScrollFactor(0).setDepth(1002);
        
        // Health text
        this.healthText = this.add.text(orbX, orbY, '', {
            fontSize: '14px',
            fill: '#ffffff',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
    }
    
    createManaOrb() {
        const orbSize = 80;
        const orbX = this.cameras.main.width - 50;
        const orbY = this.cameras.main.height - 100;
        
        // Mana orb background (dark blue)
        this.manaOrbBg = this.add.graphics();
        this.manaOrbBg.fillStyle(0x000033, 1);
        this.manaOrbBg.fillCircle(orbX, orbY, orbSize / 2);
        this.manaOrbBg.lineStyle(3, 0x000088, 1);
        this.manaOrbBg.strokeCircle(orbX, orbY, orbSize / 2);
        this.manaOrbBg.setScrollFactor(0).setDepth(1001);
        
        // Mana orb fill
        this.manaOrb = this.add.graphics();
        this.manaOrb.setScrollFactor(0).setDepth(1002);
        
        // Mana text
        this.manaText = this.add.text(orbX, orbY, '', {
            fontSize: '14px',
            fill: '#ffffff',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
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
        
        // Enemy counter and world info in top-right
        this.enemyCount = this.add.text(this.cameras.main.width - 20, 20, '', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold',
            backgroundColor: 'rgba(42, 24, 16, 0.8)',
            padding: { x: 10, y: 5 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
        
        this.worldInfo = this.add.text(this.cameras.main.width - 20, 60, '', {
            fontSize: '16px',
            fill: '#ffdd44',
            fontWeight: 'bold',
            backgroundColor: 'rgba(42, 24, 16, 0.8)',
            padding: { x: 10, y: 5 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
        
        // FPS debug meter
        this.fpsText = this.add.text(this.cameras.main.width - 20, 100, '', {
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
    }
    
    generateWorld() {
        // Clear existing world if it exists
        if (this.worldTiles) {
            this.worldTiles.destroy();
        }
        
        this.worldGenerator = new WorldGenerator(this, 150, 150, 32, this.currentWorldLevel);
        this.worldTiles = this.worldGenerator.generate();
    }
    
    cleanupCurrentWorld() {
        // Stop and destroy enemy spawn timer
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
            this.enemySpawnTimer = null;
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
                if (enemy.healthBar) {
                    enemy.healthBar.destroy();
                }
                enemy.destroy();
            }
        });
        this.enemies.clear(true, true);
        
        // Clear all item drops
        this.itemDrops.clear(true, true);
        
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
                                   // Player health/mana bars
                                   (this.player && (
                                       child === this.player.healthBar ||
                                       child === this.player.manaBar
                                   )) ||
                                   // UIManager elements
                                   (this.uiManager && (
                                       child === this.uiManager.expBarBg ||
                                       child === this.uiManager.expBar ||
                                       child === this.uiManager.expText ||
                                       child === this.uiManager.levelText ||
                                       child === this.uiManager.hotbarBg ||
                                       this.uiManager.hotbarSlots.some(slot => 
                                           child === slot.background || 
                                           child === slot.label || 
                                           child === slot.icon
                                       )
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
        
        // Recreate the enemy spawn timer immediately
        this.enemySpawnTimer = this.time.addEvent({
            delay: 6000,
            callback: () => this.spawnEnemies(5),
            loop: true,
            paused: true // Start paused
        });
        
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
            this.physics.add.overlap(this.player, this.itemDrops, this.pickupItem, null, this);
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
    }
    
    handleWorldTransition() {
        // Prevent multiple transitions
        if (this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Transition to next world
        this.currentWorldLevel++;
        
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
        
        // Stop enemy spawning timer during transition
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.paused = true;
        }
        
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
                this.player.setVisible(true);
                this.player.setActive(true);
                this.player.setAlpha(1); // Ensure full opacity
                this.player.setDepth(10); // Make sure player is above ground
                
                // Ensure camera is properly set up
                this.cameras.main.stopFollow();
                this.cameras.main.startFollow(this.player);
                this.cameras.main.centerOn(this.player.x, this.player.y);
                
                // Force recreate player health bar after world transition
                if (this.player.healthBar) {
                    this.player.healthBar.destroy();
                }
                this.player.createHealthBar();
                
                // Recreate UI elements to ensure they work properly
                this.recreateUIElements();
                
                // Wait a moment before spawning enemies to ensure player is safe
                this.time.delayedCall(500, () => {
                    // Setup new portal collision
                    this.setupPortalCollision();
                    
                    // Spawn new enemies (scaled for world level)
                    this.spawnEnemies(35);
                    
                    // Resume the enemy spawning timer (it was recreated in cleanup)
                    if (this.enemySpawnTimer) {
                        this.enemySpawnTimer.paused = false;
                    }
                    
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
                });
            });
        });
    }
    
    spawnEnemies(count) {
        const positions = this.worldGenerator.getSpawnablePositions(count);
        
        positions.forEach(pos => {
            // Scale enemy level with world level and player level
            const baseLevel = Math.max(1, this.player.level + Phaser.Math.Between(-1, 1));
            const worldScaledLevel = baseLevel + Math.floor((this.currentWorldLevel - 1) * 0.5);
            const enemy = new Enemy(this, pos.x, pos.y, worldScaledLevel);
            enemy.playerRef = this.player; // Set player reference once at spawn
            this.enemies.add(enemy);
        });
    }
    
    update(time, delta) {
        if (!this.player.active) {
            this.gameOver();
            return;
        }
        
        this.player.update(this.playerTarget);
        
        
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
                // If text objects are corrupted, recreate them
                console.warn('Text object error, recreating UI elements:', error);
                this.recreateUIElements();
            }
        }
        
        // Keep old orbs working alongside new UI
        if (this.healthOrb) {
            this.updateHealthOrb();
        }
        if (this.manaOrb) {
            this.updateManaOrb();
        }
    }
    
    pickupItem(player, itemSprite) {
        if (itemSprite.isItemDrop && this.uiManager) {
            const success = this.uiManager.addItemToInventory(itemSprite.itemData);
            if (success) {
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
    
    updateHealthOrb() {
        const orbSize = 80;
        const orbX = 50;
        const orbY = this.cameras.main.height - 100;
        const healthPercent = this.player.health / this.player.maxHealth;
        
        this.healthOrb.clear();
        
        // Create gradient effect for health orb
        const radius = orbSize / 2 - 2;
        const startAngle = Math.PI * 1.5; // Start from top
        const endAngle = startAngle + (Math.PI * 2 * healthPercent);
        
        if (healthPercent > 0) {
            this.healthOrb.fillStyle(0xff0000, 0.8);
            this.healthOrb.slice(orbX, orbY, radius, startAngle, endAngle, false);
            this.healthOrb.fillPath();
        }
        
        this.healthText.setText(`${Math.floor(this.player.health)}`);
    }
    
    updateManaOrb() {
        const orbSize = 80;
        const orbX = this.cameras.main.width - 50;
        const orbY = this.cameras.main.height - 100;
        const manaPercent = this.player.mana / this.player.maxMana;
        
        this.manaOrb.clear();
        
        // Create gradient effect for mana orb
        const radius = orbSize / 2 - 2;
        const startAngle = Math.PI * 1.5; // Start from top
        const endAngle = startAngle + (Math.PI * 2 * manaPercent);
        
        if (manaPercent > 0) {
            this.manaOrb.fillStyle(0x0088ff, 0.8);
            this.manaOrb.slice(orbX, orbY, radius, startAngle, endAngle, false);
            this.manaOrb.fillPath();
        }
        
        this.manaText.setText(`${Math.floor(this.player.mana)}`);
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
        this.enemySpawnTimer.remove();
        
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'GAME OVER\nPress R to restart',
            {
                fontSize: '48px',
                fill: '#ff0000',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
        
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
    }
}