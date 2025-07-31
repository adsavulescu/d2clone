class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.player;
        
        // UI State
        this.inventoryOpen = false;
        this.characterSheetOpen = false;
        this.skillTreeOpen = false;
        
        // UI Elements
        this.inventoryPanel = null;
        this.characterPanel = null;
        this.skillTreePanel = null;
        this.tooltipText = null;
        
        // Minimap elements
        this.minimapContainer = null;
        this.minimapBackground = null;
        this.minimapTerrain = null;
        this.minimapPlayer = null;
        this.minimapEnemies = [];
        this.minimapPortals = [];
        
        // Hotbar elements
        this.potionHotbarSlots = [];
        this.mouseHotbarSlots = [];
        this.skillsHotbarSlots = [];
        
        // Diablo 2 style item picking system
        this.draggedItem = null;
        this.dragIcon = null;
        this.isItemOnCursor = false;
        this.cursorFollowCallback = null;
        
        this.setupUI();
        this.setupControls();
    }
    
    setupUI() {
        this.createExperienceBar();
        this.createHealthManaGlobes();
        this.createPotionHotbar();
        this.createSkillsHotbar();
        this.createMinimap();
        this.createInfoPanels();
    }
    
    setupControls() {
        // Toggle inventory with 'I'
        this.scene.input.keyboard.on('keydown-I', () => {
            this.toggleInventory();
        });
        
        // Toggle character sheet with 'C'
        this.scene.input.keyboard.on('keydown-C', () => {
            this.toggleCharacterSheet();
        });
        
        // Toggle skill tree with 'S'
        this.scene.input.keyboard.on('keydown-S', () => {
            this.toggleSkillTree();
        });
        
        // Keys 1-4 for skills hotbar
        const key1 = this.scene.input.keyboard.addKey('ONE');
        const key2 = this.scene.input.keyboard.addKey('TWO');
        const key3 = this.scene.input.keyboard.addKey('THREE');
        const key4 = this.scene.input.keyboard.addKey('FOUR');
        
        key1.on('down', () => this.useSkillsHotbarSlot(0));
        key2.on('down', () => this.useSkillsHotbarSlot(1));
        key3.on('down', () => this.useSkillsHotbarSlot(2));
        key4.on('down', () => this.useSkillsHotbarSlot(3));
        
        // Q and E for potion hotbar
        this.scene.input.keyboard.on('keydown-Q', () => {
            this.usePotionHotbarSlot(0);
        });
        this.scene.input.keyboard.on('keydown-E', () => {
            this.usePotionHotbarSlot(1);
        });
        
        // ESC to close all panels
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.closeAllPanels();
        });
    }
    
    createExperienceBar() {
        const barWidth = 400;
        const barHeight = 20;
        const barX = (this.scene.cameras.main.width - barWidth) / 2;
        const barY = this.scene.cameras.main.height - 50; // Move up slightly for better alignment
        
        // Experience bar background
        this.expBarBg = this.scene.add.graphics();
        this.expBarBg.fillStyle(0x000000, 1);
        this.expBarBg.fillRect(barX, barY, barWidth, barHeight);
        this.expBarBg.lineStyle(2, 0x8b4513, 1);
        this.expBarBg.strokeRect(barX, barY, barWidth, barHeight);
        this.expBarBg.setScrollFactor(0).setDepth(1000);
        
        // Experience bar fill
        this.expBar = this.scene.add.graphics();
        this.expBar.setScrollFactor(0).setDepth(1001);
        
        // Experience text
        this.expText = this.scene.add.text(barX + barWidth/2, barY + barHeight/2, '', {
            fontSize: '12px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
        
    }
    
    createHealthManaGlobes() {
        const globeSize = 120; // Increased from 60 to 120 (2x size)
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        // Health globe (bottom left)
        const healthGlobeX = 80; // Moved right to accommodate larger size
        const healthGlobeY = screenHeight - 100; // Moved up to accommodate larger size
        
        // Mana globe (bottom right)  
        const manaGlobeX = screenWidth - 80; // Moved left to accommodate larger size
        const manaGlobeY = screenHeight - 100; // Moved up to accommodate larger size
        
        // Create health globe
        this.healthGlobe = this.createGlobe(healthGlobeX, healthGlobeY, globeSize, 0xcc0000, 0xff4444);
        
        // Create mana globe
        this.manaGlobe = this.createGlobe(manaGlobeX, manaGlobeY, globeSize, 0x0000cc, 0x4444ff);
        
        // Add text labels
        this.healthText = this.scene.add.text(healthGlobeX, healthGlobeY + globeSize/2 + 15, '', {
            fontSize: '10px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
        
        this.manaText = this.scene.add.text(manaGlobeX, manaGlobeY + globeSize/2 + 15, '', {
            fontSize: '10px', 
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
    }
    
    createGlobe(x, y, size, darkColor, lightColor) {
        // Globe background (empty state)
        const globeBg = this.scene.add.graphics();
        globeBg.fillStyle(0x2a1810, 0.8);
        globeBg.fillCircle(x, y, size/2);
        globeBg.lineStyle(2, 0x8b4513, 1);
        globeBg.strokeCircle(x, y, size/2);
        globeBg.setScrollFactor(0).setDepth(1000);
        
        // Globe fill (will be clipped from bottom to top)
        const globeFill = this.scene.add.graphics();
        globeFill.setScrollFactor(0).setDepth(1001);
        
        // Globe highlight (glass effect)
        const globeHighlight = this.scene.add.graphics();
        globeHighlight.fillStyle(0xffffff, 0.3);
        // Create a curved highlight on upper left
        globeHighlight.fillEllipse(x - size/6, y - size/6, size/3, size/4);
        globeHighlight.setScrollFactor(0).setDepth(1002);
        
        return {
            background: globeBg,
            fill: globeFill,
            highlight: globeHighlight,
            x: x,
            y: y,
            size: size,
            darkColor: darkColor,
            lightColor: lightColor
        };
    }
    
    createPotionHotbar() {
        const slotSize = 40;
        const slotSpacing = 45;
        const hotbarX = 200; // Moved further right to accommodate larger health globe
        const hotbarY = this.scene.cameras.main.height - 80; // Moved down closer to bottom
        
        // Background for potion hotbar
        const bgWidth = 2 * slotSpacing + 20;
        this.potionHotbarBg = this.scene.add.graphics();
        this.potionHotbarBg.fillStyle(0x2a1810, 0.9);
        this.potionHotbarBg.fillRect(hotbarX - bgWidth/2, hotbarY - 35, bgWidth, 70);
        this.potionHotbarBg.lineStyle(2, 0x8b4513, 1);
        this.potionHotbarBg.strokeRect(hotbarX - bgWidth/2, hotbarY - 35, bgWidth, 70);
        this.potionHotbarBg.setScrollFactor(0).setDepth(1000);
        
        // Create 2 potion slots
        const potionLabels = ['Q', 'E'];
        for (let i = 0; i < 2; i++) {
            const slotX = hotbarX - slotSpacing/2 + (i * slotSpacing);
            
            const slot = this.createHotbarSlot(slotX, hotbarY, slotSize, potionLabels[i], 'potion', i);
            this.potionHotbarSlots.push(slot);
        }
    }
    
    createSkillsHotbar() {
        const slotSize = 40;
        const mouseSlotSize = 45;
        const slotSpacing = 45;
        const hotbarX = this.scene.cameras.main.width - 250; // Moved further left to accommodate larger mana globe
        const mouseHotbarY = this.scene.cameras.main.height - 130;
        const skillsHotbarY = this.scene.cameras.main.height - 70;
        
        // Background for mouse hotbar (increased height to accommodate labels)
        const mouseBgWidth = 3 * slotSpacing + 30;
        const mouseBgHeight = 80; // Increased from 60 to accommodate text labels
        this.mouseHotbarBg = this.scene.add.graphics();
        this.mouseHotbarBg.fillStyle(0x2a1810, 0.9);
        this.mouseHotbarBg.fillRect(hotbarX - mouseBgWidth/2, mouseHotbarY - 30, mouseBgWidth, mouseBgHeight);
        this.mouseHotbarBg.lineStyle(2, 0x8b4513, 1);
        this.mouseHotbarBg.strokeRect(hotbarX - mouseBgWidth/2, mouseHotbarY - 30, mouseBgWidth, mouseBgHeight);
        this.mouseHotbarBg.setScrollFactor(0).setDepth(1000);
        
        // Create 3 mouse button slots
        const mouseLabels = ['LMB', 'MMB', 'RMB'];
        for (let i = 0; i < 3; i++) {
            const slotX = hotbarX - slotSpacing + (i * slotSpacing);
            
            const slot = this.createHotbarSlot(slotX, mouseHotbarY, mouseSlotSize, mouseLabels[i], 'mouse', i);
            this.mouseHotbarSlots.push(slot);
        }
        
        // Background for skills hotbar (increased height to accommodate labels)
        const skillsBgWidth = 4 * slotSpacing + 20;
        const skillsBgHeight = 70; // Increased from 50 to accommodate text labels
        this.skillsHotbarBg = this.scene.add.graphics();
        this.skillsHotbarBg.fillStyle(0x2a1810, 0.9);
        this.skillsHotbarBg.fillRect(hotbarX - skillsBgWidth/2, skillsHotbarY - 25, skillsBgWidth, skillsBgHeight);
        this.skillsHotbarBg.lineStyle(2, 0x8b4513, 1);
        this.skillsHotbarBg.strokeRect(hotbarX - skillsBgWidth/2, skillsHotbarY - 25, skillsBgWidth, skillsBgHeight);
        this.skillsHotbarBg.setScrollFactor(0).setDepth(1000);
        
        // Create 4 skill slots
        const skillLabels = ['1', '2', '3', '4'];
        for (let i = 0; i < 4; i++) {
            const slotX = hotbarX - (1.5 * slotSpacing) + (i * slotSpacing);
            
            const slot = this.createHotbarSlot(slotX, skillsHotbarY, slotSize, skillLabels[i], 'skill', i);
            this.skillsHotbarSlots.push(slot);
        }
        
        this.updateAllHotbars();
    }
    
    createHotbarSlot(x, y, size, label, slotType, index) {
        // Slot background
        const slot = this.scene.add.graphics();
        const slotColor = slotType === 'mouse' ? 0x2a2a2a : 0x1a1a1a;
        const borderColor = slotType === 'mouse' ? 0xa0522d : 0x8b4513;
        
        slot.fillStyle(slotColor, 1);
        slot.fillRect(x - size/2, y - size/2, size, size);
        slot.lineStyle(2, borderColor, 1);
        slot.strokeRect(x - size/2, y - size/2, size, size);
        slot.setScrollFactor(0).setDepth(1001);
        
        // Slot label
        const labelText = this.scene.add.text(x, y + size/2 + 5, label, {
            fontSize: '10px',
            fill: slotType === 'mouse' ? '#ffff88' : '#cccccc',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
        
        // Icon placeholder
        const icon = this.scene.add.graphics();
        icon.setScrollFactor(0).setDepth(1002);
        icon.x = x;
        icon.y = y;
        
        // Make slot interactive
        slot.setInteractive(new Phaser.Geom.Rectangle(x - size/2, y - size/2, size, size), Phaser.Geom.Rectangle.Contains);
        
        // Enable as drop zone
        const dropZone = this.scene.add.zone(x, y, size, size).setRectangleDropZone(size, size);
        dropZone.setScrollFactor(0).setDepth(1000);
        
        const slotData = {
            slot: slot,
            icon: icon,
            label: labelText,
            x: x,
            y: y,
            size: size,
            cooldownOverlay: null,
            slotType: slotType,
            slotIndex: index,
            dropZone: dropZone
        };
        
        // Setup interactions
        this.setupSlotInteractions(slotData);
        
        return slotData;
    }
    
    setupSlotInteractions(slotData) {
        const { slot, x, y, slotType, slotIndex } = slotData;
        
        // Hover events for tooltips and visual feedback
        slot.on('pointerover', () => {
            if (this.isItemOnCursor && this.draggedItem) {
                // Visual feedback when hovering with item on cursor
                slot.clear();
                slot.fillStyle(0x3a3a3a, 1);
                slot.fillRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
                slot.lineStyle(3, 0x00ff00, 1);
                slot.strokeRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
            } else {
                this.showHotbarTooltip(slotType, slotIndex, x, y - 60);
            }
        });
        slot.on('pointerout', () => {
            if (this.isItemOnCursor && this.draggedItem) {
                // Restore original appearance when leaving with item on cursor
                const slotColor = slotType === 'mouse' ? 0x2a2a2a : 0x1a1a1a;
                const borderColor = slotType === 'mouse' ? 0xa0522d : 0x8b4513;
                slot.clear();
                slot.fillStyle(slotColor, 1);
                slot.fillRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
                slot.lineStyle(2, borderColor, 1);
                slot.strokeRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
            } else {
                this.hideTooltip();
            }
        });
        
        // Left-click to pickup/place items from/to hotbar (Diablo 2 style)
        slot.on('pointerdown', (pointer, localX, localY, event) => {
            if (pointer.leftButtonDown()) {
                if (this.isItemOnCursor && this.draggedItem) {
                    // Place item in hotbar slot
                    this.handleDrop(slotType, slotIndex);
                } else {
                    // Pickup item from hotbar slot
                    this.pickupItemFromHotbar(slotType, slotIndex);
                }
                event.stopPropagation();
            }
        });
        
        // Drop events
        this.scene.input.on('drop', (pointer, gameObject, dropZone) => {
            if (dropZone === slotData.dropZone && this.draggedItem) {
                this.handleDrop(slotType, slotIndex);
            }
        });
        
        // Visual feedback for drag over
        this.scene.input.on('dragenter', (pointer, gameObject, dropZone) => {
            if (dropZone === slotData.dropZone) {
                slot.clear();
                slot.fillStyle(0x3a3a3a, 1);
                slot.fillRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
                slot.lineStyle(3, 0x00ff00, 1);
                slot.strokeRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
            }
        });
        
        this.scene.input.on('dragleave', (pointer, gameObject, dropZone) => {
            if (dropZone === slotData.dropZone) {
                // Restore original appearance
                const slotColor = slotType === 'mouse' ? 0x2a2a2a : 0x1a1a1a;
                const borderColor = slotType === 'mouse' ? 0xa0522d : 0x8b4513;
                slot.clear();
                slot.fillStyle(slotColor, 1);
                slot.fillRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
                slot.lineStyle(2, borderColor, 1);
                slot.strokeRect(x - slotData.size/2, y - slotData.size/2, slotData.size, slotData.size);
            }
        });
    }
    
    createInfoPanels() {
        // Character info panel (top-left)
        this.characterInfo = this.scene.add.text(20, 50, '', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: 'rgba(42, 24, 16, 0.8)',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(1000);
        
        // Controls info panel (top-left, below character info)
        this.controlsInfo = this.scene.add.text(20, 150, 
            'I - Inventory\nC - Character\nS - Skills\n1-4 - Skills\nQ/E - Potions\nLMB/MMB/RMB - Mouse Actions\nDrag item to world - Drop', {
            fontSize: '10px',
            fill: '#cccccc',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 5, y: 3 }
        }).setScrollFactor(0).setDepth(1000);
    }
    
    createMinimap() {
        const minimapSize = 150;
        const minimapX = this.scene.cameras.main.width - minimapSize - 20;
        const minimapY = 20;
        
        // Create minimap container
        this.minimapContainer = this.scene.add.container(minimapX, minimapY);
        this.minimapContainer.setScrollFactor(0).setDepth(999);
        
        // Create border frame (Diablo 2 style)
        const border = this.scene.add.graphics();
        border.lineStyle(3, 0x8B4513); // Dark brown border
        border.strokeRect(0, 0, minimapSize, minimapSize);
        border.lineStyle(1, 0xDAA520); // Gold inner border
        border.strokeRect(2, 2, minimapSize - 4, minimapSize - 4);
        
        // Create dark background
        this.minimapBackground = this.scene.add.graphics();
        this.minimapBackground.fillStyle(0x1a1a1a, 0.9);
        this.minimapBackground.fillRect(3, 3, minimapSize - 6, minimapSize - 6);
        
        // Create terrain graphics
        this.minimapTerrain = this.scene.add.graphics();
        
        // Add elements to container
        this.minimapContainer.add([border, this.minimapBackground, this.minimapTerrain]);
        
        // Create player dot
        this.minimapPlayer = this.scene.add.graphics();
        this.minimapPlayer.fillStyle(0x00ff00, 1.0); // Bright green for player
        this.minimapPlayer.fillCircle(0, 0, 3);
        this.minimapContainer.add(this.minimapPlayer);
        
        // Initialize with current world terrain
        this.renderMinimapTerrain();
    }
    
    renderMinimapTerrain() {
        if (!this.minimapTerrain || !this.scene.worldGenerator) return;
        
        this.minimapTerrain.clear();
        const minimapSize = 150;
        const worldSize = 150 * 32; // World is 150x150 tiles, 32px each
        const scale = (minimapSize - 6) / worldSize;
        
        // Get terrain data from world generator
        const terrainGrid = this.scene.worldGenerator.terrainGrid;
        const tileSize = this.scene.worldGenerator.tileSize;
        
        if (!terrainGrid) return;
        
        // Render terrain tiles
        for (let x = 0; x < terrainGrid.length; x++) {
            for (let y = 0; y < terrainGrid[x].length; y++) {
                const tileType = terrainGrid[x][y];
                let color = 0x2d4a2d; // Default dark green
                
                switch (tileType) {
                    case 'grass':
                        color = 0x2d4a2d; // Dark green
                        break;
                    case 'dirt':
                        color = 0x8b4513; // Brown
                        break;
                    case 'stone':
                        color = 0x696969; // Gray
                        break;
                    case 'wall':
                        color = 0x000000; // Black for walls
                        break;
                }
                
                const minimapX = 3 + (x * tileSize * scale);
                const minimapY = 3 + (y * tileSize * scale);
                const pixelSize = Math.max(1, tileSize * scale);
                
                this.minimapTerrain.fillStyle(color, 0.8);
                this.minimapTerrain.fillRect(minimapX, minimapY, pixelSize, pixelSize);
            }
        }
        
        // Render portals
        if (this.scene.worldGenerator.exitPoint) {
            const portal = this.scene.worldGenerator.exitPoint;
            const minimapX = 3 + (portal.x * tileSize * scale);
            const minimapY = 3 + (portal.y * tileSize * scale);
            
            this.minimapTerrain.fillStyle(0x9400d3, 1.0); // Purple for portal (Diablo 2 style)
            this.minimapTerrain.fillCircle(minimapX, minimapY, 4);
            this.minimapTerrain.lineStyle(1, 0xff00ff, 1.0);
            this.minimapTerrain.strokeCircle(minimapX, minimapY, 4);
        }
    }
    
    updateMinimap() {
        if (!this.minimapContainer || !this.minimapPlayer) return;
        
        const minimapSize = 150;
        const worldSize = 150 * 32;
        const scale = (minimapSize - 6) / worldSize;
        
        // Update player position
        const playerMinimapX = 3 + (this.player.x * scale);
        const playerMinimapY = 3 + (this.player.y * scale);
        this.minimapPlayer.x = playerMinimapX;
        this.minimapPlayer.y = playerMinimapY;
        
        // Clear existing enemy dots
        this.minimapEnemies.forEach(dot => dot.destroy());
        this.minimapEnemies = [];
        
        // Add enemy dots
        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemy => {
                if (enemy.active) {
                    const enemyMinimapX = 3 + (enemy.x * scale);
                    const enemyMinimapY = 3 + (enemy.y * scale);
                    
                    const enemyDot = this.scene.add.graphics();
                    enemyDot.fillStyle(0xff0000, 1.0); // Red for enemies
                    enemyDot.fillCircle(enemyMinimapX, enemyMinimapY, 2);
                    enemyDot.setScrollFactor(0).setDepth(1000);
                    
                    this.minimapContainer.add(enemyDot);
                    this.minimapEnemies.push(enemyDot);
                }
            });
        }
    }
    
    refreshMinimap() {
        // Called when transitioning to a new world
        if (this.minimapTerrain) {
            this.renderMinimapTerrain();
        }
    }
    
    updateUI() {
        this.updateExperienceBar();
        this.updateHealthManaGlobes();
        this.updateCharacterInfo();
        this.updateAllHotbars();
        this.updateMinimap();
    }
    
    updateExperienceBar() {
        const barWidth = 400;
        const barHeight = 20;
        const barX = (this.scene.cameras.main.width - barWidth) / 2;
        const barY = this.scene.cameras.main.height - 50; // Move up slightly to match createExperienceBar
        
        const expPercent = this.player.experience / this.player.experienceToNext;
        
        this.expBar.clear();
        this.expBar.fillStyle(0x0088ff, 0.8);
        this.expBar.fillRect(barX + 2, barY + 2, (barWidth - 4) * expPercent, barHeight - 4);
        
        this.expText.setText(`${this.player.experience} / ${this.player.experienceToNext}`);
    }
    
    updateHealthManaGlobes() {
        // Update health globe
        if (this.healthGlobe) {
            this.updateGlobe(this.healthGlobe, this.player.health, this.player.maxHealth);
            this.healthText.setText(`${Math.floor(this.player.health)}/${this.player.maxHealth}`);
        }
        
        // Update mana globe
        if (this.manaGlobe) {
            this.updateGlobe(this.manaGlobe, this.player.mana, this.player.maxMana);
            this.manaText.setText(`${Math.floor(this.player.mana)}/${this.player.maxMana}`);
        }
    }
    
    updateGlobe(globe, current, max) {
        const percentage = Math.max(0, Math.min(1, current / max));
        
        // Clear the fill
        globe.fill.clear();
        
        if (percentage > 0) {
            const radius = globe.size / 2;
            
            // Calculate the fill height (from bottom)
            const fillHeight = (globe.size - 4) * percentage; // -4 for border
            const fillBottom = globe.y + radius - 2; // Bottom of the globe
            const fillTop = fillBottom - fillHeight;
            
            // Create a circular fill that grows from bottom to top
            // We'll approximate this by drawing horizontal slices
            const slices = Math.ceil(fillHeight);
            
            for (let i = 0; i < slices; i++) {
                const sliceY = fillBottom - i;
                if (sliceY < fillTop) break;
                
                // Calculate the width of the circle at this Y position
                const distanceFromCenter = Math.abs(sliceY - globe.y);
                if (distanceFromCenter >= radius - 2) continue;
                
                const halfWidth = Math.sqrt(Math.pow(radius - 2, 2) - Math.pow(distanceFromCenter, 2));
                
                // Color gradient - darker at bottom, lighter at top
                const gradientFactor = 1 - (i / fillHeight);
                const r = Math.floor(((globe.darkColor >> 16) & 0xFF) + gradientFactor * (((globe.lightColor >> 16) & 0xFF) - ((globe.darkColor >> 16) & 0xFF)));
                const g = Math.floor(((globe.darkColor >> 8) & 0xFF) + gradientFactor * (((globe.lightColor >> 8) & 0xFF) - ((globe.darkColor >> 8) & 0xFF)));
                const b = Math.floor((globe.darkColor & 0xFF) + gradientFactor * ((globe.lightColor & 0xFF) - (globe.darkColor & 0xFF)));
                const color = (r << 16) | (g << 8) | b;
                
                globe.fill.fillStyle(color, 1);
                globe.fill.fillRect(globe.x - halfWidth, sliceY, halfWidth * 2, 1);
            }
        }
    }
    
    updateCharacterInfo() {
        const info = [
            `Level: ${this.player.level}`,
            `Stat Points: ${this.player.statPoints}`,
            `Skill Points: ${this.player.skillPoints}`
        ];
        
        this.characterInfo.setText(info.join('\n'));
    }
    
    updateAllHotbars() {
        this.updatePotionHotbar();
        this.updateMouseHotbar();
        this.updateSkillsHotbar();
    }
    
    updatePotionHotbar() {
        for (let i = 0; i < this.potionHotbarSlots.length; i++) {
            const slot = this.potionHotbarSlots[i];
            const hotbarItem = this.player.potionHotbar ? this.player.potionHotbar[i] : null;
            
            slot.icon.clear();
            
            if (hotbarItem && hotbarItem.type === 'item') {
                this.drawItemIcon(slot.icon, hotbarItem.item);
                
                // Add stack size indicator if item is stackable and > 1
                if (hotbarItem.item.stackable && hotbarItem.item.stackSize > 1) {
                    if (!slot.stackText) {
                        slot.stackText = this.scene.add.text(
                            slot.x + slot.size/2 - 2,
                            slot.y + slot.size/2 - 2,
                            '',
                            {
                                fontSize: '10px',
                                fill: '#ffffff',
                                fontWeight: 'bold',
                                stroke: '#000000',
                                strokeThickness: 2
                            }
                        ).setOrigin(1, 1).setScrollFactor(0).setDepth(1005);
                    }
                    slot.stackText.setText(hotbarItem.item.stackSize.toString());
                    slot.stackText.setVisible(true);
                } else if (slot.stackText) {
                    slot.stackText.setVisible(false);
                }
                
                // Update potion cooldown overlay
                this.updatePotionCooldown(slot, i);
            } else if (slot.stackText) {
                slot.stackText.setVisible(false);
            }
        }
    }
    
    updatePotionCooldown(slot, slotIndex) {
        const hotbarItem = this.player.potionHotbar ? this.player.potionHotbar[slotIndex] : null;
        if (!hotbarItem || !hotbarItem.item) return;
        
        let cooldownRemaining = 0;
        let cooldownDuration = 0;
        
        // Determine which cooldown to check based on potion type
        if (hotbarItem.item.name.includes('Healing')) {
            cooldownRemaining = this.player.getHealthPotionCooldownRemaining();
            cooldownDuration = this.player.healthPotionCooldown;
        } else if (hotbarItem.item.name.includes('Mana')) {
            cooldownRemaining = this.player.getManaPotionCooldownRemaining();
            cooldownDuration = this.player.manaPotionCooldown;
        }
        
        const cooldownPercent = cooldownDuration > 0 ? cooldownRemaining / cooldownDuration : 0;
        
        if (!slot.cooldownOverlay) {
            slot.cooldownOverlay = this.scene.add.graphics();
            slot.cooldownOverlay.setScrollFactor(0).setDepth(1004);
        }
        
        slot.cooldownOverlay.clear();
        if (cooldownPercent > 0) {
            slot.cooldownOverlay.fillStyle(0x000000, 0.7);
            const overlaySize = slot.size || 40;
            slot.cooldownOverlay.fillRect(
                slot.x - overlaySize/2, 
                slot.y - overlaySize/2 + (overlaySize * (1 - cooldownPercent)), 
                overlaySize, 
                overlaySize * cooldownPercent
            );
        }
    }
    
    updateMouseHotbar() {
        for (let i = 0; i < this.mouseHotbarSlots.length; i++) {
            const slot = this.mouseHotbarSlots[i];
            const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[i] : null;
            
            slot.icon.clear();
            
            if (hotbarItem) {
                if (hotbarItem.type === 'skill') {
                    const skill = this.player.skills[hotbarItem.name];
                    if (skill && skill.level > 0) {
                        this.drawSkillIcon(slot.icon, hotbarItem.name);
                        this.updateSkillCooldown(slot, hotbarItem.name);
                    } else {
                        this.drawSkillIcon(slot.icon, hotbarItem.name, true);
                    }
                } else if (hotbarItem.type === 'action') {
                    this.drawActionIcon(slot.icon, hotbarItem.name);
                }
            }
        }
    }
    
    updateSkillsHotbar() {
        for (let i = 0; i < this.skillsHotbarSlots.length; i++) {
            const slot = this.skillsHotbarSlots[i];
            const hotbarItem = this.player.skillsHotbar ? this.player.skillsHotbar[i] : null;
            
            slot.icon.clear();
            
            if (hotbarItem && hotbarItem.type === 'skill') {
                const skill = this.player.skills[hotbarItem.name];
                if (skill && skill.level > 0) {
                    this.drawSkillIcon(slot.icon, hotbarItem.name);
                    this.updateSkillCooldown(slot, hotbarItem.name);
                } else {
                    this.drawSkillIcon(slot.icon, hotbarItem.name, true);
                }
            }
        }
    }
    
    drawItemIcon(graphics, item) {
        graphics.clear();
        
        const rarityColors = {
            'normal': 0xffffff,
            'magic': 0x4444ff,
            'rare': 0xffff44,
            'unique': 0x8b4513
        };
        const baseColor = rarityColors[item.rarity] || 0xffffff;
        
        switch (item.type) {
            case 'potion':
                if (item.name.includes('Healing')) {
                    // Red bottle shape - color varies by tier
                    const baseRed = item.potionTier > 4 ? 0xff0000 : 0xcc0000;
                    const lightRed = item.potionTier > 4 ? 0xff6666 : 0xff4444;
                    
                    graphics.fillStyle(baseRed, 1);
                    graphics.fillRoundedRect(-8, -10, 16, 20, 3);
                    graphics.fillStyle(lightRed, 1);
                    graphics.fillRoundedRect(-6, -8, 12, 16, 2);
                    // Cork/cap
                    graphics.fillStyle(0x8b4513, 1);
                    graphics.fillRect(-4, -12, 8, 4);
                } else if (item.name.includes('Mana')) {
                    // Blue bottle shape - color varies by tier
                    const baseBlue = item.potionTier > 4 ? 0x0000ff : 0x0000cc;
                    const lightBlue = item.potionTier > 4 ? 0x6666ff : 0x4444ff;
                    
                    graphics.fillStyle(baseBlue, 1);
                    graphics.fillRoundedRect(-8, -10, 16, 20, 3);
                    graphics.fillStyle(lightBlue, 1);
                    graphics.fillRoundedRect(-6, -8, 12, 16, 2);
                    // Cork/cap
                    graphics.fillStyle(0x8b4513, 1);
                    graphics.fillRect(-4, -12, 8, 4);
                }
                break;
                
            case 'weapon':
                // Sword icon
                graphics.fillStyle(baseColor, 1);
                // Blade
                graphics.fillRect(-2, -12, 4, 16);
                // Crossguard
                graphics.fillRect(-6, -4, 12, 2);
                // Handle
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(-1, 4, 2, 6);
                // Pommel
                graphics.fillCircle(0, 11, 2);
                break;
                
            case 'armor':
                // Chestplate icon
                graphics.fillStyle(baseColor, 1);
                // Main body
                graphics.fillRoundedRect(-8, -8, 16, 16, 2);
                // Shoulder plates
                graphics.fillRect(-10, -6, 4, 6);
                graphics.fillRect(6, -6, 4, 6);
                // Center detail
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-1, -6, 2, 12);
                break;
                
            case 'helmet':
                // Helmet icon
                graphics.fillStyle(baseColor, 1);
                // Main helmet shape
                graphics.fillEllipse(0, -2, 16, 12);
                // Visor/face guard
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-6, -4, 12, 6);
                // Plume/crest
                graphics.fillStyle(0xaa0000, 1);
                graphics.fillRect(-1, -10, 2, 6);
                break;
                
            case 'boots':
                // Boot icon
                graphics.fillStyle(baseColor, 1);
                // Boot body
                graphics.fillRoundedRect(-6, -4, 12, 12, 2);
                // Sole
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(-8, 6, 16, 3);
                // Laces
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-2, -2, 4, 6);
                break;
                
            case 'gloves':
                // Glove icon
                graphics.fillStyle(baseColor, 1);
                // Palm
                graphics.fillRoundedRect(-6, -2, 12, 8, 2);
                // Fingers
                graphics.fillRect(-5, -8, 2, 6);
                graphics.fillRect(-1, -10, 2, 8);
                graphics.fillRect(3, -8, 2, 6);
                // Thumb
                graphics.fillRect(-8, 0, 3, 4);
                break;
                
            case 'belt':
                // Belt icon
                graphics.fillStyle(baseColor, 1);
                // Belt strap
                graphics.fillRect(-10, -2, 20, 4);
                // Buckle
                graphics.fillStyle(0xffd700, 1);
                graphics.fillRect(-3, -4, 6, 8);
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-2, -3, 4, 6);
                break;
                
            case 'ring':
                // Ring icon
                graphics.fillStyle(baseColor, 1);
                // Ring band
                graphics.strokeCircle(0, 0, 6);
                graphics.lineStyle(3, baseColor, 1);
                graphics.strokeCircle(0, 0, 6);
                // Gem
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(0, -6, 3);
                break;
                
            case 'amulet':
                // Amulet icon
                graphics.fillStyle(baseColor, 1);
                // Chain
                graphics.lineStyle(2, 0x888888, 1);
                graphics.strokeCircle(0, -8, 8);
                // Pendant
                graphics.fillStyle(baseColor, 1);
                graphics.fillEllipse(0, 2, 8, 12);
                // Gem in center
                graphics.fillStyle(0xff00ff, 1);
                graphics.fillCircle(0, 2, 3);
                break;
                
            case 'shield':
                // Shield icon
                graphics.fillStyle(baseColor, 1);
                // Shield shape
                graphics.fillRoundedRect(-8, -10, 16, 20, 8);
                // Boss (center)
                graphics.fillStyle(0xffd700, 1);
                graphics.fillCircle(0, 0, 4);
                // Cross design
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-1, -8, 2, 16);
                graphics.fillRect(-6, -1, 12, 2);
                break;
                
            default:
                // Generic item icon
                graphics.fillStyle(baseColor, 1);
                graphics.fillRect(-8, -8, 16, 16);
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-6, -6, 12, 12);
                break;
        }
    }
    
    drawActionIcon(graphics, actionName) {
        graphics.clear();
        
        if (actionName === 'move') {
            // Draw movement arrow
            graphics.fillStyle(0x88ff88, 1);
            graphics.fillTriangle(0, -12, -8, 8, 8, 8);
        }
    }
    
    drawSkillIcon(graphics, skillName, grayed = false) {
        graphics.clear();
        
        const alpha = grayed ? 0.3 : 1;
        const tint = grayed ? 0.5 : 1;
        
        switch (skillName) {
            case 'fireball':
                graphics.fillStyle(0xff8800, alpha * tint);
                graphics.fillCircle(0, 0, 12);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            case 'frostNova':
                graphics.fillStyle(0x88ddff, alpha * 0.8);
                graphics.fillCircle(0, 0, 15);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 15);
                }
                break;
            case 'teleport':
                graphics.fillStyle(0x0088ff, alpha);
                graphics.fillRect(-10, -10, 20, 20);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillRect(-10, -10, 20, 20);
                }
                break;
            case 'chainLightning':
                graphics.lineStyle(3, 0xaaffff, alpha);
                graphics.moveTo(-12, -8);
                graphics.lineTo(0, 0);
                graphics.lineTo(12, -8);
                graphics.lineTo(6, 8);
                graphics.strokePath();
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 15);
                }
                break;
            case 'iceBolt':
                graphics.fillStyle(0xccffff, alpha);
                graphics.fillTriangle(-8, 10, 8, 10, 0, -12);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillTriangle(-8, 10, 8, 10, 0, -12);
                }
                break;
            case 'meteor':
                graphics.fillStyle(0xff6600, alpha);
                graphics.fillCircle(0, 0, 10);
                graphics.fillStyle(0xffaa00, alpha * 0.8);
                graphics.fillCircle(-2, -2, 6);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            case 'lightningBolt':
                graphics.lineStyle(4, 0xffffaa, alpha);
                graphics.moveTo(-8, -10);
                graphics.lineTo(0, 0);
                graphics.lineTo(8, -10);
                graphics.strokePath();
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            case 'blizzard':
                graphics.fillStyle(0x88ddff, alpha * 0.7);
                graphics.fillCircle(0, 0, 12);
                graphics.fillStyle(0xffffff, alpha);
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * 8;
                    const y = Math.sin(angle) * 8;
                    graphics.fillCircle(x, y, 2);
                }
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 15);
                }
                break;
            case 'hydra':
                graphics.fillStyle(0xff4400, alpha);
                graphics.fillEllipse(0, 0, 16, 20);
                graphics.fillStyle(0xff8800, alpha);
                graphics.fillTriangle(-6, -8, 6, -8, 0, -12);
                graphics.fillTriangle(-4, -4, 4, -4, 0, -8);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            case 'energyShield':
                graphics.lineStyle(3, 0x4488ff, alpha);
                graphics.strokeCircle(0, 0, 10);
                graphics.fillStyle(0x4488ff, alpha * 0.3);
                graphics.fillCircle(0, 0, 10);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            case 'thunderStorm':
                graphics.fillStyle(0x333366, alpha * 0.5);
                graphics.fillCircle(0, -5, 12);
                graphics.lineStyle(2, 0xffffaa, alpha);
                graphics.moveTo(-4, 2);
                graphics.lineTo(0, 8);
                graphics.lineTo(4, 2);
                graphics.strokePath();
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            case 'chillingArmor':
                graphics.fillStyle(0x88ddff, alpha * 0.4);
                graphics.fillCircle(0, 0, 12);
                graphics.lineStyle(2, 0x88ddff, alpha);
                graphics.strokeCircle(0, 0, 8);
                graphics.strokeCircle(0, 0, 12);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 15);
                }
                break;
            // Passive skills
            case 'warmth':
                graphics.fillStyle(0xff8844, alpha * 0.6);
                graphics.fillCircle(0, 0, 10);
                graphics.fillStyle(0xffaa44, alpha);
                graphics.fillCircle(0, 0, 6);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            case 'staticField':
                graphics.lineStyle(2, 0xaaffff, alpha);
                graphics.strokeCircle(0, 0, 8);
                graphics.moveTo(-6, 0);
                graphics.lineTo(6, 0);
                graphics.moveTo(0, -6);
                graphics.lineTo(0, 6);
                graphics.strokePath();
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 10);
                }
                break;
            case 'fireResistance':
                graphics.fillStyle(0xff4444, alpha * 0.7);
                graphics.fillRect(-8, -8, 16, 16);
                graphics.fillStyle(0xffffff, alpha);
                graphics.fillRect(-6, -1, 12, 2);
                graphics.fillRect(-1, -6, 2, 12);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillRect(-10, -10, 20, 20);
                }
                break;
            case 'coldResistance':
                graphics.fillStyle(0x4488ff, alpha * 0.7);
                graphics.fillRect(-8, -8, 16, 16);
                graphics.fillStyle(0xffffff, alpha);
                graphics.fillRect(-6, -1, 12, 2);
                graphics.fillRect(-1, -6, 2, 12);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillRect(-10, -10, 20, 20);
                }
                break;
            case 'lightningResistance':
                graphics.fillStyle(0xffff44, alpha * 0.7);
                graphics.fillRect(-8, -8, 16, 16);
                graphics.fillStyle(0xffffff, alpha);
                graphics.fillRect(-6, -1, 12, 2);
                graphics.fillRect(-1, -6, 2, 12);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillRect(-10, -10, 20, 20);
                }
                break;
            case 'mastery':
                graphics.fillStyle(0x8844ff, alpha * 0.7);
                graphics.fillCircle(0, 0, 10);
                graphics.fillStyle(0xffffff, alpha);
                // Draw a star manually since fillStar doesn't exist
                const starPoints = [];
                for (let i = 0; i < 5; i++) {
                    const outerAngle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
                    starPoints.push(Math.cos(outerAngle) * 8, Math.sin(outerAngle) * 8);
                    starPoints.push(Math.cos(innerAngle) * 4, Math.sin(innerAngle) * 4);
                }
                graphics.fillPoints(starPoints, true);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillCircle(0, 0, 12);
                }
                break;
            default:
                // Generic skill icon for unknown skills
                graphics.fillStyle(0x666666, alpha);
                graphics.fillRect(-8, -8, 16, 16);
                graphics.fillStyle(0x999999, alpha);
                graphics.fillRect(-6, -6, 12, 12);
                if (grayed) {
                    graphics.fillStyle(0x333333, 0.6);
                    graphics.fillRect(-10, -10, 20, 20);
                }
                break;
        }
    }
    
    updateSkillCooldown(slot, skillName) {
        const skill = this.player.skills[skillName];
        const currentTime = this.scene.time.now;
        
        const cooldownRemaining = Math.max(0, skill.cooldown - (currentTime - skill.lastUsed));
        const cooldownPercent = cooldownRemaining / skill.cooldown;
        
        if (!slot.cooldownOverlay) {
            slot.cooldownOverlay = this.scene.add.graphics();
            slot.cooldownOverlay.setScrollFactor(0).setDepth(1004);
        }
        
        slot.cooldownOverlay.clear();
        if (cooldownPercent > 0) {
            slot.cooldownOverlay.fillStyle(0x000000, 0.7);
            const overlaySize = slot.size || 40;
            slot.cooldownOverlay.fillRect(
                slot.x - overlaySize/2, 
                slot.y - overlaySize/2 + (overlaySize * (1 - cooldownPercent)), 
                overlaySize, 
                overlaySize * cooldownPercent
            );
        }
    }
    
    usePotionHotbarSlot(index) {
        const hotbarItem = this.player.potionHotbar ? this.player.potionHotbar[index] : null;
        if (!hotbarItem || hotbarItem.type !== 'item') return;
        
        // Check specific potion cooldown
        const isHealthPotion = hotbarItem.item.name.includes('Healing');
        const isManaPotion = hotbarItem.item.name.includes('Mana');
        
        let canUse = false;
        let remainingCooldown = 0;
        
        if (isHealthPotion) {
            canUse = this.player.canUseHealthPotion();
            remainingCooldown = this.player.getHealthPotionCooldownRemaining();
        } else if (isManaPotion) {
            canUse = this.player.canUseManaPotion();
            remainingCooldown = this.player.getManaPotionCooldownRemaining();
        }
        
        if (!canUse) {
            const remainingSeconds = Math.ceil(remainingCooldown / 1000);
            const potionType = isHealthPotion ? 'Health' : 'Mana';
            this.showFeedbackMessage(`${potionType} potion cooldown: ${remainingSeconds}s`, 
                this.potionHotbarSlots[index].x, 
                this.potionHotbarSlots[index].y - 40, 
                '#ff8800');
            return;
        }
        
        // Try to use the potion (this checks cooldowns and applies effects)
        const success = hotbarItem.item.use(this.player);
        if (success) {
            // Decrement stack size only on successful use
            hotbarItem.item.stackSize--;
            
            // Show healing/mana restore feedback
            const potionType = hotbarItem.item.name.includes('Healing') ? 'health' : 'mana';
            const amount = potionType === 'health' ? hotbarItem.item.healAmount : hotbarItem.item.manaAmount;
            const color = potionType === 'health' ? '#ff4444' : '#4444ff';
            
            this.showFeedbackMessage(`+${amount} ${potionType} over time`, 
                this.potionHotbarSlots[index].x, 
                this.potionHotbarSlots[index].y - 40, 
                color);
            
            // Remove empty potion from hotbar or update stack display
            if (hotbarItem.item.stackSize <= 0) {
                this.player.potionHotbar[index] = null;
            }
            this.updatePotionHotbar(); // Always update to show new stack size
        }
    }
    
    useSkillsHotbarSlot(index) {
        const hotbarItem = this.player.skillsHotbar ? this.player.skillsHotbar[index] : null;
        if (!hotbarItem || hotbarItem.type !== 'skill') return;
        
        const skill = this.player.skills[hotbarItem.name];
        
        // Check if skill is learned
        if (!skill || skill.level === 0) {
            this.showSkillNotLearnedMessage(hotbarItem.name);
            return;
        }
        
        // Get mouse position for targeted skills
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        // Handle different skill types
        if (hotbarItem.name === 'frostNova') {
            this.player.castFrostNova();
        } else if (hotbarItem.name === 'teleport') {
            this.player.castTeleport(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'fireball') {
            this.player.castFireball(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'chainLightning') {
            this.player.castChainLightning(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'iceBolt') {
            this.player.castIceBolt(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'meteor') {
            this.player.castMeteor(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'lightningBolt') {
            this.player.castLightningBolt(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'blizzard') {
            this.player.castBlizzard(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'hydra') {
            this.player.castHydra(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.name === 'energyShield') {
            this.player.castEnergyShield();
        } else if (hotbarItem.name === 'thunderStorm') {
            this.player.castThunderStorm();
        } else if (hotbarItem.name === 'chillingArmor') {
            this.player.castChillingArmor();
        }
    }
    
    isAnyUIOpen() {
        return this.inventoryOpen || this.characterSheetOpen || this.skillTreeOpen;
    }
    
    stopPlayerMovement() {
        // Clear any active movement target
        this.scene.playerTarget = null;
        
        // Stop player immediately
        if (this.player && this.player.body) {
            this.player.body.setVelocity(0, 0);
        }
        
        // Clear any move marker
        if (this.scene.moveMarker) {
            this.scene.moveMarker.destroy();
            this.scene.moveMarker = null;
        }
    }
    
    useMouseHotbarSlot(index, worldPoint) {
        const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[index] : null;
        if (!hotbarItem) return;
        
        if (hotbarItem.type === 'action' && hotbarItem.name === 'move') {
            // Handle movement - but only if no UI panels are open
            if (!this.isAnyUIOpen()) {
                this.scene.playerTarget = worldPoint;
                this.scene.createMoveMarker(worldPoint.x, worldPoint.y);
                // Clear any pending item pickup when moving to a new location
                this.scene.pendingItemPickup = null;
            }
        } else if (hotbarItem.type === 'skill') {
            // Don't cast skills when UI is open
            if (this.isAnyUIOpen()) {
                return;
            }
            
            const skill = this.player.skills[hotbarItem.name];
            
            // Check if skill is learned
            if (!skill || skill.level === 0) {
                this.showSkillNotLearnedMessage(hotbarItem.name);
                return;
            }
            
            // Handle different skill types
            if (hotbarItem.name === 'frostNova') {
                this.player.castFrostNova();
            } else if (hotbarItem.name === 'teleport') {
                this.player.castTeleport(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'fireball') {
                this.player.castFireball(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'chainLightning') {
                this.player.castChainLightning(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'iceBolt') {
                this.player.castIceBolt(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'meteor') {
                this.player.castMeteor(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'lightningBolt') {
                this.player.castLightningBolt(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'blizzard') {
                this.player.castBlizzard(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'hydra') {
                this.player.castHydra(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'energyShield') {
                this.player.castEnergyShield();
            } else if (hotbarItem.name === 'thunderStorm') {
                this.player.castThunderStorm();
            } else if (hotbarItem.name === 'chillingArmor') {
                this.player.castChillingArmor();
            }
        }
    }
    
    showSkillNotLearnedMessage(skillName) {
        // Show a message that the skill needs to be learned
        const message = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 100,
            `${this.capitalizeFirst(skillName)} not learned!\nPress S to open Skills panel`,
            {
                fontSize: '16px',
                fill: '#ff4444',
                fontWeight: 'bold',
                align: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 10, y: 8 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
        
        // Auto-remove message after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (message.active) {
                message.destroy();
            }
        });
    }
    
    toggleInventory() {
        if (this.inventoryOpen) {
            this.closeInventory();
        } else {
            this.openInventory();
        }
    }
    
    openInventory() {
        this.closeAllPanels();
        
        // Extra tooltip cleanup when opening panels
        this.hideTooltip();
        if (this.scene && this.scene.hideGroundItemTooltip) {
            this.scene.hideGroundItemTooltip();
        }
        
        this.stopPlayerMovement();
        this.inventoryOpen = true;
        this.createInventoryPanel();
    }
    
    closeInventory() {
        this.inventoryOpen = false;
        
        // Clean up any active tooltips
        this.hideTooltip();
        if (this.scene && this.scene.hideGroundItemTooltip) {
            this.scene.hideGroundItemTooltip();
        }
        
        if (this.inventoryElements) {
            this.inventoryElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.inventoryElements = [];
        }
    }
    
    createInventoryPanel() {
        const panelWidth = 580;  // Adjusted width for better fit
        const panelHeight = 450; // Taller to accommodate 7 rows
        const panelX = (this.scene.cameras.main.width - panelWidth) / 2;
        const panelY = (this.scene.cameras.main.height - panelHeight) / 2;
        
        // Store inventory elements in an array instead of container
        this.inventoryElements = [];
        
        // Panel background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a1810, 0.95);
        bg.fillRect(panelX, panelY, panelWidth, panelHeight);
        bg.lineStyle(3, 0x8b4513, 1);
        bg.strokeRect(panelX, panelY, panelWidth, panelHeight);
        bg.setScrollFactor(0).setDepth(2000);
        
        // Title
        const title = this.scene.add.text(panelX + panelWidth/2, panelY + 20, 'INVENTORY', {
            fontSize: '18px',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        
        this.inventoryElements.push(bg, title);
        
        // Equipment section label
        const equipLabel = this.scene.add.text(panelX + 150, panelY + 35, 'EQUIPMENT', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        
        // Inventory section label - centered over the grid
        const invLabel = this.scene.add.text(panelX + 410, panelY + 35, 'ITEMS', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        
        this.inventoryElements.push(equipLabel, invLabel);
        
        // Create equipment slots (left side)
        this.createEquipmentSlots(panelX + 20, panelY + 65);
        
        // Create inventory grid (right side) - centered in available space
        this.createInventoryGrid(panelX + 320, panelY + 75);
    }
    
    createEquipmentSlots(startX, startY) {
        const slotSize = 40;
        const centerX = startX + 120;
        const centerY = startY + 120;
        
        // Equipment slot positions (arranged around character)
        const equipmentSlots = [
            { slot: 'helmet', x: centerX, y: startY + 20, label: 'Helmet' },
            { slot: 'amulet', x: centerX + 60, y: startY + 60, label: 'Amulet' },
            { slot: 'armor', x: centerX, y: centerY, label: 'Armor' },
            { slot: 'weapon', x: centerX - 60, y: centerY, label: 'Weapon' },
            { slot: 'shield', x: centerX + 60, y: centerY, label: 'Shield' },
            { slot: 'ring1', x: centerX - 60, y: centerY + 60, label: 'Ring 1' },
            { slot: 'belt', x: centerX, y: centerY + 60, label: 'Belt' },
            { slot: 'ring2', x: centerX + 60, y: centerY + 60, label: 'Ring 2' },
            { slot: 'gloves', x: centerX - 60, y: centerY + 120, label: 'Gloves' },
            { slot: 'boots', x: centerX, y: centerY + 120, label: 'Boots' }
        ];
        
        equipmentSlots.forEach(equipSlot => {
            // Equipment slot background
            const slot = this.scene.add.graphics();
            slot.fillStyle(0x1a1a1a, 1);
            slot.fillRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
            slot.lineStyle(2, 0x8b4513, 1);
            slot.strokeRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
            slot.setScrollFactor(0).setDepth(2001);
            
            // Equipment slot label
            const label = this.scene.add.text(equipSlot.x, equipSlot.y + slotSize/2 + 15, equipSlot.label, {
                fontSize: '10px',
                fill: '#cccccc',
                fontWeight: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
            
            // Create drop zone for equipment slot
            const dropZone = this.scene.add.zone(equipSlot.x, equipSlot.y, slotSize, slotSize)
                .setRectangleDropZone(slotSize, slotSize)
                .setScrollFactor(0).setDepth(2000);
            
            // Store equipment slot info for highlighting and drop handling
            equipSlot.graphics = slot;
            equipSlot.dropZone = dropZone;
            
            // Setup drop interactions
            this.setupEquipmentSlotInteractions(equipSlot, slot, dropZone, slotSize);
            
            // Check if item is equipped in this slot
            const equippedItem = this.player.equipment[equipSlot.slot];
            if (equippedItem) {
                const itemIcon = this.scene.add.graphics();
                itemIcon.x = equipSlot.x;
                itemIcon.y = equipSlot.y;
                itemIcon.setScrollFactor(0).setDepth(2002);
                this.drawItemIcon(itemIcon, equippedItem);
                this.inventoryElements.push(itemIcon);
                
                // Add Diablo 2 style click functionality for equipped items
                const equippedContainer = this.scene.add.container(equipSlot.x, equipSlot.y);
                equippedContainer.setSize(slotSize, slotSize);
                equippedContainer.setInteractive();
                equippedContainer.setScrollFactor(0).setDepth(2003);
                equippedContainer.itemData = {
                    type: 'item',
                    item: equippedItem,
                    display: equippedItem.name,
                    equipmentSlot: equipSlot.slot
                };
                
                // Diablo 2 style click to pick up equipped item
                equippedContainer.on('pointerdown', (pointer) => {
                    if (pointer.leftButtonDown()) {
                        this.pickupItem(equippedContainer.itemData);
                    } else if (pointer.rightButtonDown()) {
                        this.unequipItemToInventory(equippedContainer.itemData);
                    }
                });
                
                // Tooltip events (only when no item on cursor)
                equippedContainer.on('pointerover', () => {
                    if (!this.isItemOnCursor) {
                        this.showInventoryItemTooltip(equippedItem, equipSlot.x, equipSlot.y - 30);
                    }
                });
                equippedContainer.on('pointerout', () => {
                    this.hideTooltip();
                });
                
                this.inventoryElements.push(equippedContainer);
            }
            
            this.inventoryElements.push(slot, label, dropZone);
        });
        
        // No character representation needed - equipment slots are self-explanatory
        
        // Add vertical separator line
        const separator = this.scene.add.graphics();
        separator.lineStyle(2, 0x8b4513, 0.8);
        separator.lineBetween(startX + 250, startY, startX + 250, startY + 300);
        separator.setScrollFactor(0).setDepth(2001);
        this.inventoryElements.push(separator);
    }

    createInventoryGrid(startX, startY) {
        const slotSize = 28;    // Slightly smaller slots to fit better
        const spacing = 32;     // Add proper padding between slots
        const padding = 2;      // Padding inside each slot
        
        for (let row = 0; row < this.player.inventory.height; row++) {
            for (let col = 0; col < this.player.inventory.width; col++) {
                const slotX = startX + (col * spacing) + padding;
                const slotY = startY + (row * spacing) + padding;
                const slotIndex = row * this.player.inventory.width + col;
                
                const slot = this.scene.add.graphics();
                slot.fillStyle(0x1a1a1a, 1);
                slot.fillRect(slotX, slotY, slotSize - padding, slotSize - padding);
                slot.lineStyle(1, 0x666666, 1);
                slot.strokeRect(slotX, slotY, slotSize - padding, slotSize - padding);
                slot.setScrollFactor(0).setDepth(2001);
                
                // Create drop zone for this inventory slot
                const dropZone = this.scene.add.zone(
                    slotX + (slotSize - padding)/2, 
                    slotY + (slotSize - padding)/2, 
                    slotSize - padding, 
                    slotSize - padding
                ).setRectangleDropZone(slotSize - padding, slotSize - padding)
                .setScrollFactor(0).setDepth(2000);
                
                // Setup drop interactions for inventory slot
                this.setupInventorySlotInteractions(dropZone, slot, slotIndex, slotX, slotY, slotSize, padding);
                
                // Add item representation if slot contains item
                const item = this.player.inventory.items[slotIndex];
                if (item) {
                    // Create item icon using the new icon system
                    const itemIcon = this.scene.add.graphics();
                    itemIcon.x = slotX + (slotSize - padding)/2;
                    itemIcon.y = slotY + (slotSize - padding)/2;
                    itemIcon.setScrollFactor(0).setDepth(2002);
                    this.drawItemIcon(itemIcon, item);
                    this.inventoryElements.push(itemIcon);
                    
                    // Add stack size indicator if stackable and > 1
                    if (item.stackable && item.stackSize > 1) {
                        const stackText = this.scene.add.text(
                            slotX + (slotSize - padding) - 2,
                            slotY + (slotSize - padding) - 2,
                            item.stackSize.toString(),
                            {
                                fontSize: '10px',
                                fill: '#ffffff',
                                fontWeight: 'bold',
                                stroke: '#000000',
                                strokeThickness: 2
                            }
                        ).setOrigin(1, 1).setScrollFactor(0).setDepth(2003);
                        this.inventoryElements.push(stackText);
                    }
                    
                    // Add hover tooltip and click interactions for inventory items
                    slot.setInteractive(new Phaser.Geom.Rectangle(slotX, slotY, slotSize - padding, slotSize - padding), Phaser.Geom.Rectangle.Contains);
                    slot.on('pointerover', () => {
                        this.showInventoryItemTooltip(item, slotX + (slotSize - padding)/2, slotY - 10);
                    });
                    slot.on('pointerout', () => {
                        this.hideTooltip();
                    });
                    
                    // Diablo 2 style click-to-pickup items
                    const itemContainer = this.scene.add.container(slotX + (slotSize - padding)/2, slotY + (slotSize - padding)/2);
                    itemContainer.setSize(slotSize - padding, slotSize - padding);
                    itemContainer.setInteractive();
                    itemContainer.setScrollFactor(0).setDepth(2003);
                    itemContainer.itemData = { 
                        type: 'item', 
                        item: item, 
                        display: item.name, 
                        inventorySlot: slotIndex
                    };
                    
                    // Diablo 2 style click interactions
                    itemContainer.on('pointerdown', (pointer) => {
                        if (pointer.leftButtonDown()) {
                            this.pickupItem(itemContainer.itemData);
                        } else if (pointer.rightButtonDown()) {
                            this.equipItemFromInventory(itemContainer.itemData);
                        }
                    });
                    
                    // Tooltip events (only when no item on cursor)
                    itemContainer.on('pointerover', () => {
                        if (!this.isItemOnCursor) {
                            this.showInventoryItemTooltip(item, slotX + (slotSize - padding)/2, slotY - 10);
                        }
                    });
                    itemContainer.on('pointerout', () => {
                        this.hideTooltip();
                    });
                    
                    this.inventoryElements.push(itemContainer);
                    
                    // Remove right-click equip functionality - use drag and drop only
                }
                
                this.inventoryElements.push(slot, dropZone);
            }
        }
    }
    
    setupInventorySlotInteractions(dropZone, slot, slotIndex, slotX, slotY, slotSize, padding) {
        // Diablo 2 style click to place item
        dropZone.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.isItemOnCursor && this.draggedItem && this.draggedItem.item) {
                this.placeItem(slotIndex, 'inventory');
            }
        });
        
        // Visual feedback for hover when item on cursor
        dropZone.on('pointerover', () => {
            if (this.isItemOnCursor && this.draggedItem && this.draggedItem.item) {
                slot.clear();
                slot.fillStyle(0x3a3a3a, 1);
                slot.fillRect(slotX, slotY, slotSize - padding, slotSize - padding);
                slot.lineStyle(3, 0x00ff00, 1);
                slot.strokeRect(slotX, slotY, slotSize - padding, slotSize - padding);
            }
        });
        
        dropZone.on('pointerout', () => {
            if (this.isItemOnCursor && this.draggedItem && this.draggedItem.item) {
                // Restore original appearance
                slot.clear();
                slot.fillStyle(0x1a1a1a, 1);
                slot.fillRect(slotX, slotY, slotSize - padding, slotSize - padding);
                slot.lineStyle(1, 0x666666, 1);
                slot.strokeRect(slotX, slotY, slotSize - padding, slotSize - padding);
            }
        });
    }
    
    refreshInventoryPanel() {
        if (this.inventoryOpen && this.inventoryElements) {
            // Don't clean up drag icons if we have an item on cursor (Diablo 2 style)
            // The old drag system cleanup is no longer needed
            
            // Destroy current elements and recreate panel
            this.inventoryElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.createInventoryPanel();
        }
    }
    
    showInventoryItemTooltip(item, x, y) {
        this.hideTooltip();
        
        // Get structured tooltip data with player context
        const tooltipData = item.getTooltipData(this.player);
        
        // Create Diablo 2-style tooltip container that follows mouse
        this.createMouseFollowingTooltip(tooltipData);
    }
    
    createDiablo2Tooltip(tooltipData, x, y) {
        const container = this.scene.add.container(x, y);
        container.setScrollFactor(0).setDepth(3000);
        
        // Calculate tooltip dimensions
        let maxWidth = 0;
        let totalHeight = 0;
        const lineHeight = 14;
        const sectionSpacing = 6;
        const padding = 8;
        
        // Create background graphics
        const background = this.scene.add.graphics();
        
        // Track current Y position
        let currentY = -padding;
        const elements = [];
        
        // Process each section
        tooltipData.sections.forEach((section, sectionIndex) => {
            if (sectionIndex > 0) {
                currentY -= sectionSpacing; // Add spacing between sections
            }
            
            // Add section title if present
            if (section.title) {
                const titleText = this.scene.add.text(0, currentY, section.title.text, {
                    fontSize: '11px',
                    fill: section.title.color,
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                }).setOrigin(0.5, 1);
                
                elements.push(titleText);
                maxWidth = Math.max(maxWidth, titleText.width);
                currentY -= lineHeight;
            }
            
            // Add section lines
            section.lines.forEach(line => {
                const fontSize = line.size === 'large' ? '14px' : 
                               line.size === 'small' ? '10px' : '11px';
                
                const text = this.scene.add.text(0, currentY, line.text, {
                    fontSize: fontSize,
                    fill: line.color,
                    fontFamily: 'Arial',
                    fontStyle: line.size === 'large' ? 'bold' : 'normal'
                }).setOrigin(0.5, 1);
                
                elements.push(text);
                maxWidth = Math.max(maxWidth, text.width);
                currentY -= (line.size === 'large' ? 16 : lineHeight);
            });
        });
        
        // Add padding to dimensions
        const tooltipWidth = maxWidth + (padding * 2);
        const tooltipHeight = Math.abs(currentY) + padding;
        
        // Create Diablo 2-style background with border
        background.fillStyle(0x000000, 0.95); // Dark background
        background.fillRect(-tooltipWidth/2, -tooltipHeight, tooltipWidth, tooltipHeight);
        
        // Add golden border (Diablo 2 style)
        background.lineStyle(2, 0xd4af37, 1); // Gold border
        background.strokeRect(-tooltipWidth/2, -tooltipHeight, tooltipWidth, tooltipHeight);
        
        // Add inner shadow effect
        background.lineStyle(1, 0x8b7355, 0.8); // Darker gold
        background.strokeRect(-tooltipWidth/2 + 1, -tooltipHeight + 1, tooltipWidth - 2, tooltipHeight - 2);
        
        // Add elements to container
        container.add(background);
        elements.forEach(element => {
            container.add(element);
        });
        
        // Position tooltip to avoid screen edges
        // Use screen coordinates for UI tooltips
        const screenBounds = {
            left: 0,
            right: this.scene.cameras.main.width,
            top: 0,
            bottom: this.scene.cameras.main.height
        };
        
        // Adjust position to keep tooltip on screen
        let finalX = x;
        let finalY = y;
        
        // Horizontal positioning
        if (x + tooltipWidth/2 > screenBounds.right) {
            finalX = screenBounds.right - tooltipWidth/2 - 10;
        }
        if (x - tooltipWidth/2 < screenBounds.left) {
            finalX = screenBounds.left + tooltipWidth/2 + 10;
        }
        
        // Vertical positioning - tooltip should appear above the cursor/item
        if (y - tooltipHeight < screenBounds.top) {
            // If there's no room above, show below
            finalY = y + 40;
        } else {
            // Show above the item/cursor
            finalY = y - 10;
        }
        
        container.setPosition(finalX, finalY);
        
        // Store reference for cleanup
        this.tooltipContainer = container;
    }
    
    createMouseFollowingTooltip(tooltipData) {
        const container = this.scene.add.container(0, 0);
        container.setScrollFactor(0).setDepth(3000);
        
        // Calculate tooltip dimensions
        let maxWidth = 0;
        let totalHeight = 0;
        const lineHeight = 14;
        const sectionSpacing = 6;
        const padding = 8;
        
        // Create background graphics
        const background = this.scene.add.graphics();
        
        // Track current Y position (start from top and go down)
        let currentY = padding;
        const elements = [];
        
        // Process each section
        tooltipData.sections.forEach((section, sectionIndex) => {
            if (sectionIndex > 0) {
                currentY += sectionSpacing; // Add spacing between sections
            }
            
            // Add section title if present
            if (section.title) {
                const titleText = this.scene.add.text(0, currentY, section.title.text, {
                    fontSize: '11px',
                    fill: section.title.color,
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                }).setOrigin(0.5, 0);
                
                elements.push(titleText);
                maxWidth = Math.max(maxWidth, titleText.width);
                currentY += lineHeight;
            }
            
            // Add section lines
            section.lines.forEach(line => {
                const fontSize = line.size === 'large' ? '14px' : 
                               line.size === 'small' ? '10px' : '11px';
                
                const text = this.scene.add.text(0, currentY, line.text, {
                    fontSize: fontSize,
                    fill: line.color,
                    fontFamily: 'Arial',
                    fontStyle: line.size === 'large' ? 'bold' : 'normal'
                }).setOrigin(0.5, 0);
                
                elements.push(text);
                maxWidth = Math.max(maxWidth, text.width);
                currentY += (line.size === 'large' ? 16 : lineHeight);
            });
        });
        
        // Add padding to dimensions
        const tooltipWidth = maxWidth + (padding * 2);
        const tooltipHeight = currentY + padding;
        
        // Create Diablo 2-style background with border
        background.fillStyle(0x000000, 0.95); // Dark background
        background.fillRect(-tooltipWidth/2, 0, tooltipWidth, tooltipHeight);
        
        // Add golden border (Diablo 2 style)
        background.lineStyle(2, 0xd4af37, 1); // Gold border
        background.strokeRect(-tooltipWidth/2, 0, tooltipWidth, tooltipHeight);
        
        // Add inner shadow effect
        background.lineStyle(1, 0x8b7355, 0.8); // Darker gold
        background.strokeRect(-tooltipWidth/2 + 1, 1, tooltipWidth - 2, tooltipHeight - 2);
        
        // Add elements to container
        container.add(background);
        elements.forEach(element => {
            container.add(element);
        });
        
        // Store dimensions for positioning
        this.tooltipWidth = tooltipWidth;
        this.tooltipHeight = tooltipHeight;
        
        // Set up mouse following
        this.updateTooltipPosition(container);
        
        // Add mouse move listener for following
        this.tooltipFollowCallback = (pointer) => {
            this.updateTooltipPosition(container);
        };
        
        this.scene.input.on('pointermove', this.tooltipFollowCallback);
        
        // Store reference for cleanup
        this.tooltipContainer = container;
    }
    
    updateTooltipPosition(container) {
        if (!container || !this.scene.input.activePointer) return;
        
        const pointer = this.scene.input.activePointer;
        const tooltipWidth = this.tooltipWidth || 200;
        const tooltipHeight = this.tooltipHeight || 100;
        
        // Diablo 2-style offset: tooltip appears to the right and slightly below cursor
        const offsetX = 20;
        const offsetY = 20;
        
        let x = pointer.x + offsetX;
        let y = pointer.y + offsetY;
        
        // Screen bounds
        const screenBounds = {
            left: 0,
            right: this.scene.cameras.main.width,
            top: 0,
            bottom: this.scene.cameras.main.height
        };
        
        // Adjust if tooltip would go off screen
        if (x + tooltipWidth/2 > screenBounds.right) {
            // Show to the left of cursor instead
            x = pointer.x - offsetX - tooltipWidth/2;
        }
        
        if (y + tooltipHeight > screenBounds.bottom) {
            // Show above cursor instead
            y = pointer.y - offsetY - tooltipHeight;
        }
        
        // Make sure tooltip doesn't go off the top or left
        if (y - tooltipHeight/2 < screenBounds.top) {
            y = screenBounds.top + tooltipHeight/2 + 10;
        }
        if (x - tooltipWidth/2 < screenBounds.left) {
            x = screenBounds.left + tooltipWidth/2 + 10;
        }
        
        container.setPosition(x, y);
    }
    
    toggleCharacterSheet() {
        if (this.characterSheetOpen) {
            this.closeCharacterSheet();
        } else {
            this.openCharacterSheet();
        }
    }
    
    openCharacterSheet() {
        this.closeAllPanels();
        
        // Extra tooltip cleanup when opening panels
        this.hideTooltip();
        if (this.scene && this.scene.hideGroundItemTooltip) {
            this.scene.hideGroundItemTooltip();
        }
        
        this.stopPlayerMovement();
        this.characterSheetOpen = true;
        this.createCharacterPanel();
    }
    
    closeCharacterSheet() {
        this.characterSheetOpen = false;
        
        // Clean up any active tooltips
        this.hideTooltip();
        if (this.scene && this.scene.hideGroundItemTooltip) {
            this.scene.hideGroundItemTooltip();
        }
        
        if (this.characterPanelElements) {
            this.characterPanelElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.characterPanelElements = [];
        }
    }
    
    createCharacterPanel() {
        const panelWidth = 500;  // Wider for more stats
        const panelHeight = 550; // Taller for more stats
        const panelX = 50;
        const panelY = 25;
        
        // Create character panel elements without container for better interactivity
        this.characterPanelElements = [];
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a1810, 0.95);
        bg.fillRect(panelX, panelY, panelWidth, panelHeight);
        bg.lineStyle(3, 0x8b4513, 1);
        bg.strokeRect(panelX, panelY, panelWidth, panelHeight);
        bg.setScrollFactor(0).setDepth(2000);
        
        // Title
        const title = this.scene.add.text(panelX + panelWidth/2, panelY + 20, 'CHARACTER', {
            fontSize: '18px',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        
        this.characterPanelElements.push(bg, title);
        
        // Create sections for different stat categories
        this.createBasicStatsSection(panelX + 20, panelY + 50);
        this.createCombatStatsSection(panelX + 270, panelY + 50);
        this.createResistancesSection(panelX + 20, panelY + 350);
        this.createOtherStatsSection(panelX + 270, panelY + 350);
        
        // Stat allocation buttons are now integrated into the basic stats section
    }
    
    createBasicStatsSection(startX, startY) {
        // Basic Stats Section
        const sectionTitle = this.scene.add.text(startX, startY, 'BASIC STATS', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontWeight: 'bold'
        }).setScrollFactor(0).setDepth(2001);
        
        const equipmentBonuses = this.player.calculateEquipmentBonuses();
        
        // Create stats text without the core stats (we'll add them individually)
        const generalStats = [
            `Level: ${this.player.level}`,
            `Experience: ${this.player.experience}/${this.player.experienceToNext}`,
            ''
        ];
        
        const generalStatsText = this.scene.add.text(startX, startY + 25, generalStats.join('\n'), {
            fontSize: '11px',
            fill: '#ffffff',
            lineSpacing: 4
        }).setScrollFactor(0).setDepth(2001);
        
        // Create individual stat lines with buttons
        const statNames = ['strength', 'dexterity', 'vitality', 'energy'];
        const statLabels = ['Strength', 'Dexterity', 'Vitality', 'Energy'];
        const baseStatsY = startY + 25 + (3 * 15); // After general stats + empty line
        
        statNames.forEach((stat, index) => {
            const y = baseStatsY + (index * 15);
            const baseValue = this.player.baseStats[stat] + this.player.allocatedStats[stat];
            const equipBonus = equipmentBonuses[stat];
            const statText = `${statLabels[index]}: ${baseValue}${equipBonus > 0 ? ' (+' + equipBonus + ')' : ''}`;
            
            // Stat text
            const statLabel = this.scene.add.text(startX, y, statText, {
                fontSize: '11px',
                fill: '#ffffff'
            }).setScrollFactor(0).setDepth(2001);
            
            this.characterPanelElements.push(statLabel);
            
            // Add plus button if player has stat points
            if (this.player.statPoints > 0) {
                const button = this.scene.add.text(startX + 170, y - 1, '+', {
                    fontSize: '12px',
                    fill: '#00ff00',
                    backgroundColor: '#2a1810',
                    padding: { x: 6, y: 2 }
                }).setInteractive().setScrollFactor(0).setDepth(2002);
                
                button.on('pointerdown', () => {
                    if (this.player.allocateStat(stat)) {
                        this.closeCharacterSheet();
                        this.openCharacterSheet(); // Refresh the panel
                    }
                });
                
                // Add hover effects
                button.on('pointerover', () => {
                    button.setStyle({ fill: '#00ff88', backgroundColor: '#3a2820' });
                });
                
                button.on('pointerout', () => {
                    button.setStyle({ fill: '#00ff00', backgroundColor: '#2a1810' });
                });
                
                this.characterPanelElements.push(button);
            }
        });
        
        // Add remaining stats below
        const remainingStats = [
            '',
            `Life: ${Math.floor(this.player.health)}/${this.player.maxHealth}`,
            `Mana: ${Math.floor(this.player.mana)}/${this.player.maxMana}`,
            '',
            `Stat Points: ${this.player.statPoints}`,
            `Skill Points: ${this.player.skillPoints}`
        ];
        
        const remainingStatsText = this.scene.add.text(startX, baseStatsY + (4 * 15), remainingStats.join('\n'), {
            fontSize: '11px',
            fill: '#ffffff',
            lineSpacing: 4
        }).setScrollFactor(0).setDepth(2001);
        
        this.characterPanelElements.push(sectionTitle, generalStatsText, remainingStatsText);
    }
    
    createCombatStatsSection(startX, startY) {
        // Combat Stats Section
        const sectionTitle = this.scene.add.text(startX, startY, 'COMBAT STATS', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontWeight: 'bold'
        }).setScrollFactor(0).setDepth(2001);
        
        const combatStats = [
            `Attack Rating: ${this.player.attackRating || 0}`,
            `Damage: ${this.player.minDamage || 1}-${this.player.maxDamage || 3}`,
            `Defense: ${this.player.defense || 0}`,
            '',
            `Attack Speed: ${this.player.attackSpeed || 100}%`,
            `Cast Speed: ${this.player.castSpeed || 100}%`,
            `Movement Speed: ${Math.floor(this.player.speed || 200)}`,
            '',
            `Stamina: 100/100`, // Placeholder
            `Block Chance: 25%`,  // Placeholder
            `Critical Hit: 5%`,   // Placeholder
        ];
        
        const combatText = this.scene.add.text(startX, startY + 25, combatStats.join('\n'), {
            fontSize: '11px',
            fill: '#ffffff',
            lineSpacing: 4
        }).setScrollFactor(0).setDepth(2001);
        
        this.characterPanelElements.push(sectionTitle, combatText);
    }
    
    createResistancesSection(startX, startY) {
        // Resistances Section
        const sectionTitle = this.scene.add.text(startX, startY, 'RESISTANCES', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontWeight: 'bold'
        }).setScrollFactor(0).setDepth(2001);
        
        const resistances = [
            `Fire: ${this.player.resistances?.fire || 0}%`,
            `Cold: ${this.player.resistances?.cold || 0}%`,
            `Lightning: ${this.player.resistances?.lightning || 0}%`,
            `Poison: ${this.player.resistances?.poison || 0}%`
        ];
        
        const resistanceText = this.scene.add.text(startX, startY + 25, resistances.join('\n'), {
            fontSize: '11px',
            fill: '#ffffff',
            lineSpacing: 4
        }).setScrollFactor(0).setDepth(2001);
        
        this.characterPanelElements.push(sectionTitle, resistanceText);
    }
    
    createOtherStatsSection(startX, startY) {
        // Other Stats Section
        const sectionTitle = this.scene.add.text(startX, startY, 'OTHER', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontWeight: 'bold'
        }).setScrollFactor(0).setDepth(2001);
        
        const otherStats = [
            `Magic Find: 0%`,     // Placeholder
            `Gold Find: 0%`,      // Placeholder
            `Experience: +0%`,    // Placeholder
            `Light Radius: +0`    // Placeholder
        ];
        
        const otherText = this.scene.add.text(startX, startY + 25, otherStats.join('\n'), {
            fontSize: '11px',
            fill: '#ffffff',
            lineSpacing: 4
        }).setScrollFactor(0).setDepth(2001);
        
        this.characterPanelElements.push(sectionTitle, otherText);
    }
    
    
    toggleSkillTree() {
        if (this.skillTreeOpen) {
            this.closeSkillTree();
        } else {
            this.openSkillTree();
        }
    }
    
    openSkillTree() {
        this.closeAllPanels();
        
        // Extra tooltip cleanup when opening panels
        this.hideTooltip();
        if (this.scene && this.scene.hideGroundItemTooltip) {
            this.scene.hideGroundItemTooltip();
        }
        
        this.stopPlayerMovement();
        this.skillTreeOpen = true;
        this.createSkillTreePanel();
    }
    
    closeSkillTree() {
        this.skillTreeOpen = false;
        
        // Clean up any active tooltips
        this.hideTooltip();
        if (this.scene && this.scene.hideGroundItemTooltip) {
            this.scene.hideGroundItemTooltip();
        }
        
        if (this.skillTreePanelElements) {
            this.skillTreePanelElements.forEach(element => {
                try {
                    if (element && element.destroy) {
                        element.destroy();
                    }
                } catch (error) {
                    console.warn('Error destroying skill tree element:', error);
                }
            });
            this.skillTreePanelElements = [];
        }
        
        // Additional cleanup: destroy any lingering graphics objects
        if (this.scene && this.scene.children && this.scene.children.list) {
            const lingering = this.scene.children.list.filter(child => 
                child.depth >= 2000 && child.depth <= 2010 && 
                child.scrollFactorX === 0 && child.scrollFactorY === 0
            );
            lingering.forEach(child => {
                try {
                    if (child && child.destroy) {
                        child.destroy();
                    }
                } catch (error) {
                    console.warn('Error destroying lingering element:', error);
                }
            });
        }
    }
    
    createSkillTreePanel() {
        const panelWidth = 800;
        const panelHeight = 500;
        const panelX = (this.scene.cameras.main.width - panelWidth) / 2;
        const panelY = 50;
        
        // Create skills panel elements without container for better interactivity
        this.skillTreePanelElements = [];
        this.currentSkillTab = this.currentSkillTab || 'offensive';
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a1810, 0.95);
        bg.fillRect(panelX, panelY, panelWidth, panelHeight);
        bg.lineStyle(3, 0x8b4513, 1);
        bg.strokeRect(panelX, panelY, panelWidth, panelHeight);
        bg.setScrollFactor(0).setDepth(2000);
        
        const title = this.scene.add.text(panelX + panelWidth/2, panelY + 20, 'SKILLS', {
            fontSize: '18px',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        
        this.skillTreePanelElements.push(bg, title);
        
        // Create skill tabs
        this.createSkillTabs(panelX, panelY);
        
        // Create skill grid based on current tab
        this.createSkillGrid(panelX, panelY);
    }
    
    createSkillTabs(panelX, panelY) {
        const tabWidth = 120;
        const tabHeight = 30;
        const tabY = panelY + 50;
        const tabs = [
            { id: 'offensive', name: 'Offensive', x: panelX + 50 },
            { id: 'defensive', name: 'Defensive', x: panelX + 200 },
            { id: 'passive', name: 'Passive', x: panelX + 350 }
        ];
        
        tabs.forEach(tab => {
            const isActive = this.currentSkillTab === tab.id;
            
            // Tab background
            const tabBg = this.scene.add.graphics();
            tabBg.fillStyle(isActive ? 0x4a3020 : 0x2a1810, 1);
            tabBg.fillRect(tab.x, tabY, tabWidth, tabHeight);
            tabBg.lineStyle(2, isActive ? 0xffff00 : 0x8b4513, 1);
            tabBg.strokeRect(tab.x, tabY, tabWidth, tabHeight);
            tabBg.setScrollFactor(0).setDepth(2001);
            
            // Tab text
            const tabText = this.scene.add.text(tab.x + tabWidth/2, tabY + tabHeight/2, tab.name, {
                fontSize: '12px',
                fill: isActive ? '#ffff00' : '#cccccc',
                fontWeight: isActive ? 'bold' : 'normal'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
            
            // Make tab interactive
            const tabZone = this.scene.add.zone(tab.x, tabY, tabWidth, tabHeight)
                .setOrigin(0).setScrollFactor(0).setDepth(2002).setInteractive();
            
            tabZone.on('pointerdown', () => {
                if (this.currentSkillTab !== tab.id) {
                    this.currentSkillTab = tab.id;
                    this.closeSkillTree();
                    this.openSkillTree();
                }
            });
            
            this.skillTreePanelElements.push(tabBg, tabText, tabZone);
        });
    }
    
    createSkillGrid(panelX, panelY) {
        const gridStartX = panelX + 50;
        const gridStartY = panelY + 120;
        const skillSize = 48;
        const skillSpacing = 60;
        const skillsPerRow = 10;
        
        // Dynamically get skills based on current tab from player
        const skillCategories = this.getSkillsByTab();
        const currentSkills = skillCategories[this.currentSkillTab] || [];
        
        // Display available skill points
        const skillPointsText = this.scene.add.text(gridStartX, gridStartY - 40, 
            `Skill Points: ${this.player.skillPoints}`, {
            fontSize: '14px',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setScrollFactor(0).setDepth(2001);
        this.skillTreePanelElements.push(skillPointsText);
        
        
        // Create skill grid
        currentSkills.forEach(skillData => {
            const [gridX, gridY] = skillData.gridPos;
            const x = gridStartX + (gridX * skillSpacing);
            const y = gridStartY + (gridY * skillSpacing);
            
            const skill = this.player.skills[skillData.name];
            const canUpgrade = skill && this.player.skillPoints > 0 && skill.level < skill.maxLevel;
            const isLearned = skill && skill.level > 0;
            
            // Skill background
            const skillBg = this.scene.add.graphics();
            skillBg.fillStyle(isLearned ? 0x3a2810 : 0x1a1810, 1);
            skillBg.fillRect(x - skillSize/2, y - skillSize/2, skillSize, skillSize);
            skillBg.lineStyle(2, isLearned ? 0x8b6513 : 0x4a3020, 1);
            skillBg.strokeRect(x - skillSize/2, y - skillSize/2, skillSize, skillSize);
            skillBg.setScrollFactor(0).setDepth(2001);
            
            // Skill icon
            const skillIcon = this.scene.add.graphics();
            skillIcon.x = x;
            skillIcon.y = y;
            this.drawSkillIcon(skillIcon, skillData.name, !isLearned);
            skillIcon.setScrollFactor(0).setDepth(2002);
            
            // Skill level counter (bottom-right corner)
            if (isLearned) {
                const levelCounter = this.scene.add.text(x + skillSize/2 - 8, y + skillSize/2 - 8, 
                    skill.level.toString(), {
                    fontSize: '10px',
                    fill: '#ffff00',
                    fontWeight: 'bold',
                    backgroundColor: '#000000',
                    padding: { x: 2, y: 1 }
                }).setOrigin(0.5).setScrollFactor(0).setDepth(2003);
                this.skillTreePanelElements.push(levelCounter);
            }
            
            // Make skill interactive with drag capability
            const skillZone = this.scene.add.zone(x, y, skillSize, skillSize)
                .setScrollFactor(0).setDepth(2003).setInteractive({ draggable: isLearned });
            
            // Click to upgrade skill
            skillZone.on('pointerdown', () => {
                if (canUpgrade) {
                    if (this.player.upgradeSkill(skillData.name)) {
                        this.closeSkillTree();
                        this.openSkillTree(); // Refresh the panel
                    }
                }
            });
            
            // Hover effects and tooltips
            skillZone.on('pointerover', () => {
                if (canUpgrade) {
                    skillBg.clear();
                    skillBg.fillStyle(0x5a4020, 1);
                    skillBg.fillRect(x - skillSize/2, y - skillSize/2, skillSize, skillSize);
                    skillBg.lineStyle(2, 0xffff00, 1);
                    skillBg.strokeRect(x - skillSize/2, y - skillSize/2, skillSize, skillSize);
                }
                
                // Show new Diablo 2-style skill tooltip
                this.showSkillTooltip(skillData.name, x, y - skillSize);
            });
            
            skillZone.on('pointerout', () => {
                // Restore normal appearance
                skillBg.clear();
                skillBg.fillStyle(isLearned ? 0x3a2810 : 0x1a1810, 1);
                skillBg.fillRect(x - skillSize/2, y - skillSize/2, skillSize, skillSize);
                skillBg.lineStyle(2, isLearned ? 0x8b6513 : 0x4a3020, 1);
                skillBg.strokeRect(x - skillSize/2, y - skillSize/2, skillSize, skillSize);
                
                this.hideTooltip();
            });
            
            // Drag events for learned skills only
            if (isLearned) {
                skillZone.on('dragstart', (pointer) => {
                    this.draggedItem = { type: 'skill', name: skillData.name, display: skillData.display };
                    skillIcon.setAlpha(0.5);
                    
                    // Create drag icon
                    this.dragIcon = this.scene.add.graphics();
                    this.dragIcon.setScrollFactor(0).setDepth(5000);
                    this.drawSkillIcon(this.dragIcon, skillData.name);
                });
                
                skillZone.on('drag', (pointer, dragX, dragY) => {
                    if (this.dragIcon) {
                        this.dragIcon.x = pointer.x;
                        this.dragIcon.y = pointer.y;
                    }
                });
                
                skillZone.on('dragend', (pointer) => {
                    skillIcon.setAlpha(1);
                    if (this.dragIcon) {
                        this.dragIcon.destroy();
                        this.dragIcon = null;
                    }
                    this.draggedItem = null;
                });
            }
            
            this.skillTreePanelElements.push(skillBg, skillIcon, skillZone);
        });
    }
    
    getSkillsByTab() {
        const skillCategories = {
            offensive: [],
            defensive: [],
            passive: []
        };
        
        // Dynamically organize skills by tab with grid positions
        let tabCounters = { offensive: 0, defensive: 0, passive: 0 };
        const skillsPerRow = 10;
        
        Object.keys(this.player.skills).forEach(skillName => {
            const skill = this.player.skills[skillName];
            const tab = skill.tab || 'offensive'; // Default to offensive if no tab specified
            
            if (skillCategories[tab]) {
                const counter = tabCounters[tab];
                const gridX = counter % skillsPerRow;
                const gridY = Math.floor(counter / skillsPerRow);
                
                skillCategories[tab].push({
                    name: skillName,
                    display: this.capitalizeFirst(skillName.replace(/([A-Z])/g, ' $1').trim()),
                    gridPos: [gridX, gridY]
                });
                
                tabCounters[tab]++;
            }
        });
        return skillCategories;
    }
    
    
    closeAllPanels() {
        // Always clean up tooltips when closing panels
        this.hideTooltip();
        if (this.scene && this.scene.hideGroundItemTooltip) {
            this.scene.hideGroundItemTooltip();
        }
        
        this.closeInventory();
        this.closeCharacterSheet();
        this.closeSkillTree();
    }
    
    showHotbarTooltip(slotType, slotIndex, x, y) {
        this.hideTooltip();
        
        let hotbarItem = null;
        if (slotType === 'potion' && this.player.potionHotbar) {
            hotbarItem = this.player.potionHotbar[slotIndex];
        } else if (slotType === 'mouse' && this.player.mouseHotbar) {
            hotbarItem = this.player.mouseHotbar[slotIndex];
        } else if (slotType === 'skill' && this.player.skillsHotbar) {
            hotbarItem = this.player.skillsHotbar[slotIndex];
        }
        
        if (!hotbarItem) return;
        
        // Use new Diablo 2-style tooltips based on item type
        if (hotbarItem.type === 'skill') {
            this.showSkillTooltip(hotbarItem.name, x, y);
        } else if (hotbarItem.type === 'item') {
            const item = hotbarItem.item;
            if (item) {
                this.showInventoryItemTooltip(item, x, y);
            }
        } else if (hotbarItem.type === 'action') {
            if (hotbarItem.name === 'move') {
                this.showMoveActionTooltip(x, y);
            }
        }
    }
    
    hideTooltip() {
        // Handle old text-based tooltips
        if (this.tooltipText) {
            this.tooltipText.destroy();
            this.tooltipText = null;
        }
        if (this.tooltipBg) {
            this.tooltipBg.destroy();
            this.tooltipBg = null;
        }
        // Handle new container-based tooltips
        if (this.tooltipContainer) {
            this.tooltipContainer.destroy();
            this.tooltipContainer = null;
        }
        // Clean up mouse follow callback
        if (this.tooltipFollowCallback) {
            this.scene.input.off('pointermove', this.tooltipFollowCallback);
            this.tooltipFollowCallback = null;
        }
        // Clear stored dimensions
        this.tooltipWidth = null;
        this.tooltipHeight = null;
    }
    
    showSimpleTooltip(text, x, y) {
        this.hideTooltip();
        
        // Create simple tooltip with Diablo 2 styling
        const tooltipData = {
            sections: [{
                type: 'simple',
                lines: [{ text: text, color: '#ffffff' }]
            }]
        };
        
        this.createMouseFollowingTooltip(tooltipData);
    }
    
    showSkillTooltip(skillName, x, y) {
        this.hideTooltip();
        
        // Get skill information
        const skillData = this.getSkillData(skillName);
        const currentLevel = this.player.skills[skillName] || 0;
        const skill = this.player.skills[skillName];
        
        const tooltipData = {
            sections: [
                {
                    type: 'header',
                    lines: [
                        { text: skillData.display, color: '#ffff00', size: 'large' },
                        { text: 'Sorcerer Skill', color: '#c0c0c0', size: 'small' }
                    ]
                }
            ]
        };
        
        // Add current level and stats info
        if (currentLevel > 0 && skill) {
            const levelSection = {
                type: 'level',
                lines: [
                    { text: `Current Level: ${currentLevel}/${skill.maxLevel}`, color: '#ffffff' }
                ]
            };
            
            // Add damage if applicable
            const damage = this.player.getSkillDamage(skillName);
            if (damage > 0) {
                levelSection.lines.push({ text: `Damage: ${damage}`, color: '#ffffff' });
            }
            
            // Add mana cost
            const manaCost = this.player.getSkillManaCost(skillName);
            if (manaCost > 0) {
                levelSection.lines.push({ text: `Mana Cost: ${manaCost}`, color: '#6060ff' });
            }
            
            // Add special stats based on skill type
            if (skillName === 'frostNova') {
                const radius = this.player.getSkillRadius(skillName);
                if (radius > 0) {
                    levelSection.lines.push({ text: `Radius: ${radius}`, color: '#c0c0c0' });
                }
            } else if (skillName === 'chainLightning') {
                const chains = this.player.getSkillChains(skillName);
                if (chains > 0) {
                    levelSection.lines.push({ text: `Jumps: ${chains}`, color: '#c0c0c0' });
                }
            } else if (skillName === 'iceBolt') {
                const accuracy = this.player.getSkillAccuracy(skillName);
                if (accuracy > 0) {
                    levelSection.lines.push({ text: `Accuracy: ${accuracy}%`, color: '#c0c0c0' });
                }
            }
            
            tooltipData.sections.push(levelSection);
            
            // Add next level preview if not at max level
            if (currentLevel < skill.maxLevel) {
                const nextLevelDamage = this.calculateNextLevelSkillDamage(skillName, currentLevel + 1);
                const nextLevelMana = this.calculateNextLevelSkillMana(skillName, currentLevel + 1);
                
                const nextLevelSection = {
                    type: 'nextLevel',
                    title: { text: `Next Level (${currentLevel + 1}):`, color: '#c0c0c0' },
                    lines: []
                };
                
                if (nextLevelDamage > damage) {
                    nextLevelSection.lines.push({ text: `Damage: ${nextLevelDamage} (+${nextLevelDamage - damage})`, color: '#00ff00' });
                }
                if (nextLevelMana !== manaCost) {
                    const manaChange = nextLevelMana - manaCost;
                    const changeColor = manaChange > 0 ? '#ff6060' : '#00ff00';
                    const changeText = manaChange > 0 ? `+${manaChange}` : `${manaChange}`;
                    nextLevelSection.lines.push({ text: `Mana Cost: ${nextLevelMana} (${changeText})`, color: changeColor });
                }
                
                if (nextLevelSection.lines.length > 0) {
                    tooltipData.sections.push(nextLevelSection);
                }
            }
        } else {
            // Skill not learned yet - show what it would do at level 1
            const levelSection = {
                type: 'preview',
                title: { text: 'At Level 1:', color: '#c0c0c0' },
                lines: []
            };
            
            const damage = this.calculateNextLevelSkillDamage(skillName, 1);
            const manaCost = this.calculateNextLevelSkillMana(skillName, 1);
            
            if (damage > 0) {
                levelSection.lines.push({ text: `Damage: ${damage}`, color: '#ffffff' });
            }
            if (manaCost > 0) {
                levelSection.lines.push({ text: `Mana Cost: ${manaCost}`, color: '#6060ff' });
            }
            
            if (levelSection.lines.length > 0) {
                tooltipData.sections.push(levelSection);
            }
        }
        
        // Add skill description
        const description = this.getSkillDescription(skillName, currentLevel);
        if (description) {
            tooltipData.sections.push({
                type: 'description',
                lines: [{ text: description, color: '#c0c0c0' }]
            });
        }
        
        // Add requirements
        const requirements = [];
        if (currentLevel === 0) {
            requirements.push({ text: 'Requires: 1 Skill Point', color: '#ffff00' });
        } else if (skill && currentLevel < skill.maxLevel) {
            requirements.push({ text: 'Next Level Cost: 1 Skill Point', color: '#ffff00' });
        }
        
        if (requirements.length > 0) {
            tooltipData.sections.push({
                type: 'requirements',
                lines: requirements
            });
        }
        
        this.createMouseFollowingTooltip(tooltipData);
    }
    
    showMoveActionTooltip(x, y) {
        this.hideTooltip();
        
        const tooltipData = {
            sections: [
                {
                    type: 'header',
                    lines: [
                        { text: 'Move', color: '#ffff00', size: 'large' },
                        { text: 'Basic Action', color: '#c0c0c0', size: 'small' }
                    ]
                },
                {
                    type: 'description',
                    lines: [
                        { text: 'Click to move to target location', color: '#c0c0c0' },
                        { text: 'Move speed based on Dexterity', color: '#c0c0c0' }
                    ]
                },
                {
                    type: 'requirements',
                    lines: [
                        { text: 'No requirements', color: '#ffffff' }
                    ]
                }
            ]
        };
        
        this.createMouseFollowingTooltip(tooltipData);
    }
    
    getSkillData(skillName) {
        // Get all skills from all tabs and find the one with matching name
        const skillCategories = this.getSkillsByTab();
        for (const tabSkills of Object.values(skillCategories)) {
            const skillData = tabSkills.find(skill => skill.name === skillName);
            if (skillData) {
                return skillData;
            }
        }
        
        // Fallback - create basic skill data if not found
        return {
            name: skillName,
            display: this.capitalizeFirst(skillName)
        };
    }
    
    getSkillDescription(skillName, level) {
        const descriptions = {
            'fireball': `Launches a fiery projectile that explodes on impact${level > 0 ? `\nDamage: ${20 + level * 5}` : ''}`,
            'iceBolt': `Fires a piercing ice projectile${level > 0 ? `\nDamage: ${15 + level * 3}\nPierces through enemies` : ''}`,
            'chainLightning': `Releases lightning that jumps between enemies${level > 0 ? `\nDamage: ${25 + level * 7}\nJumps: ${Math.min(3 + level, 8)} times` : ''}`,
            'meteor': `Calls down a devastating meteor after a delay${level > 0 ? `\nDamage: ${40 + level * 10}\nDelay: 1.5 seconds` : ''}`,
            'lightningBolt': `Fires a fast piercing lightning bolt${level > 0 ? `\nDamage: ${18 + level * 4}\nFast casting` : ''}`,
            'blizzard': `Creates a blizzard that damages enemies over time${level > 0 ? `\nDamage per second: ${10 + level * 3}\nDuration: ${3 + level} seconds` : ''}`,
            'hydra': `Summons a fire-breathing hydra${level > 0 ? `\nDamage per fireball: ${12 + level * 3}\nDuration: ${8 + level * 2} seconds` : ''}`,
            'frostNova': `Releases a ring of ice around the caster${level > 0 ? `\nDamage: ${15 + level * 4}\nFreezes enemies` : ''}`,
            'teleport': `Instantly teleports to target location${level > 0 ? `\nMana Cost: ${15 - Math.min(level, 10)}` : ''}`,
            'energyShield': `Absorbs damage using mana instead of life${level > 0 ? `\nAbsorption: ${20 + level * 5}%\nMana per damage: ${Math.max(1, 3 - level/5)}` : ''}`,
            'thunderStorm': `Creates lightning strikes around you${level > 0 ? `\nDamage: ${20 + level * 6}\nDuration: ${5 + level} seconds` : ''}`,
            'chillingArmor': `Ice armor that damages attackers${level > 0 ? `\nDefense: +${10 + level * 3}\nRetaliation: ${8 + level * 2}` : ''}`
        };
        
        return descriptions[skillName] || 'Unknown skill';
    }
    
    calculateNextLevelSkillDamage(skillName, level) {
        // Simulate what the damage would be at a specific level
        // This uses the same formulas as the player's getSkillDamage method
        const baseDamage = {
            'fireball': 20,
            'iceBolt': 15,
            'chainLightning': 25,
            'meteor': 40,
            'lightningBolt': 18,
            'blizzard': 10, // per second
            'hydra': 12, // per fireball
            'frostNova': 15
        };
        
        const damagePerLevel = {
            'fireball': 5,
            'iceBolt': 3,
            'chainLightning': 7,
            'meteor': 10,
            'lightningBolt': 4,
            'blizzard': 3,
            'hydra': 3,
            'frostNova': 4
        };
        
        const base = baseDamage[skillName] || 0;
        const perLevel = damagePerLevel[skillName] || 0;
        
        return base + (level * perLevel);
    }
    
    calculateNextLevelSkillMana(skillName, level) {
        // Simulate what the mana cost would be at a specific level
        const baseMana = {
            'fireball': 8,
            'iceBolt': 6,
            'chainLightning': 15,
            'meteor': 25,
            'lightningBolt': 10,
            'blizzard': 20,
            'hydra': 30,
            'frostNova': 12,
            'teleport': 15,
            'energyShield': 25,
            'thunderStorm': 20,
            'chillingArmor': 18
        };
        
        const manaPerLevel = {
            'teleport': -1, // Gets cheaper
            'energyShield': 1,
            'thunderStorm': 2,
            'chillingArmor': 1
        };
        
        const base = baseMana[skillName] || 0;
        const perLevel = manaPerLevel[skillName] || 0;
        
        return Math.max(1, base + (level * perLevel));
    }
    
    showFeedbackMessage(text, x, y, color = '#ffffff') {
        const feedbackText = this.scene.add.text(x, y, text, {
            fontSize: '12px',
            fill: color,
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(4000);
        
        // Animate the feedback message
        this.scene.tweens.add({
            targets: feedbackText,
            y: feedbackText.y - 20,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                feedbackText.destroy();
            }
        });
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    pickupItemFromHotbar(slotType, slotIndex) {
        // Don't pickup if already have an item on cursor
        if (this.isItemOnCursor) {
            return;
        }
        
        let hotbarItem = null;
        
        if (slotType === 'potion' && this.player.potionHotbar) {
            hotbarItem = this.player.potionHotbar[slotIndex];
            if (hotbarItem && hotbarItem.type === 'item') {
                // Remove from hotbar
                this.player.potionHotbar[slotIndex] = null;
                this.updatePotionHotbar();
                
                // Start dragging the item
                this.pickupItem({ 
                    type: 'item', 
                    item: hotbarItem.item,
                    hotbarSlot: { type: slotType, index: slotIndex }
                });
            }
        } else if (slotType === 'mouse' && this.player.mouseHotbar) {
            hotbarItem = this.player.mouseHotbar[slotIndex];
            if (hotbarItem && hotbarItem.type === 'skill') {
                // Remove from hotbar
                this.player.mouseHotbar[slotIndex] = null;
                this.updateMouseHotbar();
                
                // Start dragging the skill
                this.pickupItem({ 
                    type: 'skill', 
                    name: hotbarItem.name,
                    display: hotbarItem.display,
                    hotbarSlot: { type: slotType, index: slotIndex }
                });
            }
        } else if (slotType === 'skill' && this.player.skillsHotbar) {
            hotbarItem = this.player.skillsHotbar[slotIndex];
            if (hotbarItem && hotbarItem.type === 'skill') {
                // Remove from hotbar
                this.player.skillsHotbar[slotIndex] = null;
                this.updateSkillsHotbar();
                
                // Start dragging the skill
                this.pickupItem({ 
                    type: 'skill', 
                    name: hotbarItem.name,
                    display: hotbarItem.display,
                    hotbarSlot: { type: slotType, index: slotIndex }
                });
            }
        }
    }
    
    removeFromHotbar(slotType, slotIndex) {
        let hotbarItem = null;
        
        if (slotType === 'potion' && this.player.potionHotbar) {
            hotbarItem = this.player.potionHotbar[slotIndex];
            if (hotbarItem && hotbarItem.type === 'item') {
                // Try to add the potion back to inventory
                const success = this.addItemToInventory(hotbarItem.item);
                if (success) {
                    this.player.potionHotbar[slotIndex] = null;
                    this.updatePotionHotbar();
                    this.showFeedbackMessage(`${hotbarItem.item.name} returned to inventory`, 
                        this.getSlotByType(slotType, slotIndex).x, 
                        this.getSlotByType(slotType, slotIndex).y - 40, 
                        '#00ff88');
                } else {
                    this.showFeedbackMessage('Inventory full!', 
                        this.getSlotByType(slotType, slotIndex).x, 
                        this.getSlotByType(slotType, slotIndex).y - 40, 
                        '#ff0000');
                }
                return; // Exit early for potions
            }
        } else if (slotType === 'mouse' && this.player.mouseHotbar) {
            hotbarItem = this.player.mouseHotbar[slotIndex];
            if (hotbarItem && hotbarItem.type !== 'action') { // Don't remove move action
                this.player.mouseHotbar[slotIndex] = null;
                this.updateMouseHotbar();
            }
        } else if (slotType === 'skill' && this.player.skillsHotbar) {
            hotbarItem = this.player.skillsHotbar[slotIndex];
            if (hotbarItem) {
                this.player.skillsHotbar[slotIndex] = null;
                this.updateSkillsHotbar();
            }
        }
        
        if (hotbarItem) {
            const itemName = hotbarItem.type === 'skill' ? 
                this.capitalizeFirst(hotbarItem.name) : 
                hotbarItem.item ? hotbarItem.item.name : 'Item';
            this.showFeedbackMessage(`${itemName} removed`, 
                this.getSlotByType(slotType, slotIndex).x, 
                this.getSlotByType(slotType, slotIndex).y - 40, 
                '#ff8800');
        }
    }
    
    handleDrop(slotType, slotIndex) {
        if (!this.draggedItem) return;
        
        // Check if item type is compatible with slot type
        if (slotType === 'potion' && this.draggedItem.type !== 'item') {
            this.showFeedbackMessage('Only potions allowed here', 
                this.getSlotByType(slotType, slotIndex).x, 
                this.getSlotByType(slotType, slotIndex).y - 40, 
                '#ff0000');
            this.restoreSlotAppearance(slotType, slotIndex);
            return;
        }
        
        if ((slotType === 'mouse' || slotType === 'skill') && 
            this.draggedItem.type === 'item') {
            this.showFeedbackMessage('Only skills allowed here', 
                this.getSlotByType(slotType, slotIndex).x, 
                this.getSlotByType(slotType, slotIndex).y - 40, 
                '#ff0000');
            this.restoreSlotAppearance(slotType, slotIndex);
            return;
        }
        
        // Special handling for potion stacks
        if (slotType === 'potion' && this.draggedItem.type === 'item' && this.draggedItem.item) {
            const existingItem = this.player.potionHotbar[slotIndex];
            
            // If there's already a potion in this slot, try to stack them
            if (existingItem && existingItem.type === 'item' && 
                existingItem.item.canStackWith(this.draggedItem.item)) {
                
                const spaceAvailable = existingItem.item.maxStackSize - existingItem.item.stackSize;
                const amountToAdd = Math.min(spaceAvailable, this.draggedItem.item.stackSize);
                
                existingItem.item.stackSize += amountToAdd;
                this.draggedItem.item.stackSize -= amountToAdd;
                
                // Update inventory - either remove completely or update the remaining stack
                if (this.draggedItem.inventorySlot !== undefined) {
                    if (this.draggedItem.item.stackSize <= 0) {
                        // Remove completely if all items were moved
                        this.player.inventory.items[this.draggedItem.inventorySlot] = null;
                    }
                    // Note: If stackSize > 0, the remaining items stay in inventory
                }
                
                this.updatePotionHotbar();
                if (this.inventoryOpen) {
                    this.refreshInventoryPanel();
                }
                
                this.showFeedbackMessage(`Stacked ${amountToAdd} potions`, 
                    this.getSlotByType(slotType, slotIndex).x, 
                    this.getSlotByType(slotType, slotIndex).y - 40, 
                    '#00ff00');
                this.restoreSlotAppearance(slotType, slotIndex);
                return;
            }
            
            // Handle placing item with potential swapping (reuse existing variable)
            this.player.potionHotbar[slotIndex] = { ...this.draggedItem };
            
            // If there was an existing item, swap it back to where the dragged item came from
            if (existingItem) {
                if (this.draggedItem.inventorySlot !== undefined) {
                    // Swap: put existing item back in inventory slot
                    this.player.inventory.items[this.draggedItem.inventorySlot] = existingItem.item;
                    this.showFeedbackMessage('Items swapped', 
                        this.getSlotByType(slotType, slotIndex).x, 
                        this.getSlotByType(slotType, slotIndex).y - 40, 
                        '#00ff88');
                } else if (this.draggedItem.hotbarSlot) {
                    // Swap: put existing item back in original hotbar slot
                    if (this.draggedItem.hotbarSlot.type === 'potion') {
                        this.player.potionHotbar[this.draggedItem.hotbarSlot.index] = existingItem;
                    }
                    this.showFeedbackMessage('Items swapped', 
                        this.getSlotByType(slotType, slotIndex).x, 
                        this.getSlotByType(slotType, slotIndex).y - 40, 
                        '#00ff88');
                }
            } else {
                // Remove from original location only if no swap occurred
                if (this.draggedItem.inventorySlot !== undefined) {
                    this.player.inventory.items[this.draggedItem.inventorySlot] = null;
                }
                this.showFeedbackMessage(`${this.draggedItem.item.name} assigned`, 
                    this.getSlotByType(slotType, slotIndex).x, 
                    this.getSlotByType(slotType, slotIndex).y - 40, 
                    '#00ff00');
            }
            
            // Refresh inventory if needed
            if (this.inventoryOpen) {
                this.refreshInventoryPanel();
            }
            
            this.updatePotionHotbar();
            this.restoreSlotAppearance(slotType, slotIndex);
        } else if (slotType === 'mouse' && this.player.mouseHotbar) {
            // Handle skill swapping for mouse hotbar
            const existingSkill = this.player.mouseHotbar[slotIndex];
            this.player.mouseHotbar[slotIndex] = { ...this.draggedItem };
            
            // Swap if there was an existing skill
            if (existingSkill && this.draggedItem.hotbarSlot) {
                if (this.draggedItem.hotbarSlot.type === 'mouse') {
                    this.player.mouseHotbar[this.draggedItem.hotbarSlot.index] = existingSkill;
                } else if (this.draggedItem.hotbarSlot.type === 'skill') {
                    this.player.skillsHotbar[this.draggedItem.hotbarSlot.index] = existingSkill;
                }
                this.showFeedbackMessage('Skills swapped', 
                    this.getSlotByType(slotType, slotIndex).x, 
                    this.getSlotByType(slotType, slotIndex).y - 40, 
                    '#00ff88');
            } else {
                this.showFeedbackMessage(`${this.draggedItem.display || this.draggedItem.name} assigned`, 
                    this.getSlotByType(slotType, slotIndex).x, 
                    this.getSlotByType(slotType, slotIndex).y - 40, 
                    '#00ff00');
            }
            
            this.updateMouseHotbar();
            if (this.draggedItem.hotbarSlot && this.draggedItem.hotbarSlot.type === 'skill') {
                this.updateSkillsHotbar();
            }
        } else if (slotType === 'skill' && this.player.skillsHotbar) {
            // Handle skill swapping for skills hotbar
            const existingSkill = this.player.skillsHotbar[slotIndex];
            this.player.skillsHotbar[slotIndex] = { ...this.draggedItem };
            
            // Swap if there was an existing skill
            if (existingSkill && this.draggedItem.hotbarSlot) {
                if (this.draggedItem.hotbarSlot.type === 'skill') {
                    this.player.skillsHotbar[this.draggedItem.hotbarSlot.index] = existingSkill;
                } else if (this.draggedItem.hotbarSlot.type === 'mouse') {
                    this.player.mouseHotbar[this.draggedItem.hotbarSlot.index] = existingSkill;
                }
                this.showFeedbackMessage('Skills swapped', 
                    this.getSlotByType(slotType, slotIndex).x, 
                    this.getSlotByType(slotType, slotIndex).y - 40, 
                    '#00ff88');
            } else {
                this.showFeedbackMessage(`${this.draggedItem.display || this.draggedItem.name} assigned`, 
                    this.getSlotByType(slotType, slotIndex).x, 
                    this.getSlotByType(slotType, slotIndex).y - 40, 
                    '#00ff00');
            }
            
            this.updateSkillsHotbar();
            if (this.draggedItem.hotbarSlot && this.draggedItem.hotbarSlot.type === 'mouse') {
                this.updateMouseHotbar();
            }
        }
        
        // Restore slot appearance after successful drop
        this.restoreSlotAppearance(slotType, slotIndex);
        
        // Clear drag state since item was successfully dropped
        this.cleanupCursorVisuals();
    }
    
    handleInventoryDrop(targetSlotIndex) {
        if (!this.draggedItem) return;
        
        // Only handle item drops in inventory
        if (this.draggedItem.type !== 'item') {
            this.showFeedbackMessage('Only items can be placed in inventory', 
                400, 300, '#ff0000');
            this.restoreInventorySlotAppearance(targetSlotIndex);
            return;
        }
        
        const draggedItem = this.draggedItem.item;
        const existingItem = this.player.inventory.items[targetSlotIndex];
        
        // If target slot has an item, try to stack or swap
        if (existingItem) {
            // Try to stack if items are compatible
            if (draggedItem.canStackWith && draggedItem.canStackWith(existingItem)) {
                const spaceAvailable = existingItem.maxStackSize - existingItem.stackSize;
                const amountToAdd = Math.min(spaceAvailable, draggedItem.stackSize);
                
                existingItem.stackSize += amountToAdd;
                draggedItem.stackSize -= amountToAdd;
                
                // If all items were stacked, remove from source
                if (draggedItem.stackSize <= 0) {
                    this.removeItemFromSource();
                } else {
                    // Update source inventory slot with remaining items
                    if (this.draggedItem.inventorySlot !== undefined) {
                        // Source is inventory - item already updated
                    }
                }
                
                this.showFeedbackMessage(`Stacked ${amountToAdd} items`, 
                    400, 300, '#00ff00');
            } else {
                // Swap items
                this.swapInventoryItems(targetSlotIndex);
            }
        } else {
            // Target slot is empty - place item there
            this.player.inventory.items[targetSlotIndex] = draggedItem;
            this.removeItemFromSource();
            
            this.showFeedbackMessage(`${draggedItem.name} moved`, 
                400, 300, '#00ff00');
        }
        
        // Refresh inventory UI
        this.refreshInventoryPanel();
        this.restoreInventorySlotAppearance(targetSlotIndex);
    }
    
    removeItemFromSource() {
        if (this.draggedItem.inventorySlot !== undefined) {
            // Source is inventory
            this.player.inventory.items[this.draggedItem.inventorySlot] = null;
        } else if (this.draggedItem.equipmentSlot) {
            // Source is equipment
            this.player.equipment[this.draggedItem.equipmentSlot] = null;
            this.player.updateDerivedStats();
        }
    }
    
    swapInventoryItems(targetSlotIndex) {
        const draggedItem = this.draggedItem.item;
        const targetItem = this.player.inventory.items[targetSlotIndex];
        
        // Place dragged item in target slot
        this.player.inventory.items[targetSlotIndex] = draggedItem;
        
        // Move target item to source location
        if (this.draggedItem.inventorySlot !== undefined) {
            // Source was inventory - place target item there
            this.player.inventory.items[this.draggedItem.inventorySlot] = targetItem;
        } else if (this.draggedItem.equipmentSlot) {
            // Source was equipment - try to equip target item or place in inventory
            if (targetItem.canEquip && targetItem.canEquip(this.draggedItem.equipmentSlot)) {
                this.player.equipment[this.draggedItem.equipmentSlot] = targetItem;
                this.player.updateDerivedStats();
            } else {
                // Find empty inventory slot for displaced equipment item
                const emptySlot = this.player.inventory.items.findIndex(slot => slot === null);
                if (emptySlot !== -1) {
                    this.player.inventory.items[emptySlot] = targetItem;
                } else {
                    // No space - cancel the operation
                    this.showFeedbackMessage('No space to swap items', 400, 300, '#ff0000');
                    return;
                }
            }
        }
        
        this.showFeedbackMessage(`Items swapped`, 400, 300, '#00ff00');
        
        // Clear drag state since item was successfully dropped
        this.cleanupCursorVisuals();
    }
    
    restoreInventorySlotAppearance(slotIndex) {
        // This will be handled by refreshInventoryPanel, but we can add specific logic if needed
        // For now, the refresh handles restoring all slot appearances
    }
    
    getSlotByType(slotType, slotIndex) {
        if (slotType === 'potion') return this.potionHotbarSlots[slotIndex];
        if (slotType === 'mouse') return this.mouseHotbarSlots[slotIndex];
        if (slotType === 'skill') return this.skillsHotbarSlots[slotIndex];
        return null;
    }
    
    restoreSlotAppearance(slotType, slotIndex) {
        const slotData = this.getSlotByType(slotType, slotIndex);
        if (!slotData) return;
        
        const { slot, x, y, size } = slotData;
        const slotColor = slotType === 'mouse' ? 0x2a2a2a : 0x1a1a1a;
        const borderColor = slotType === 'mouse' ? 0xa0522d : 0x8b4513;
        
        slot.clear();
        slot.fillStyle(slotColor, 1);
        slot.fillRect(x - size/2, y - size/2, size, size);
        slot.lineStyle(2, borderColor, 1);
        slot.strokeRect(x - size/2, y - size/2, size, size);
    }
    
    pickupItem(itemData) {
        if (this.isItemOnCursor) {
            // We already have an item, ignore this click
            return;
        }
        
        // Pick up the item (Diablo 2 style)
        this.draggedItem = itemData;
        this.isItemOnCursor = true;
        
        // Create the cursor icon that follows the mouse
        this.dragIcon = this.scene.add.graphics();
        this.dragIcon.setScrollFactor(0).setDepth(5000);
        
        // Draw appropriate icon based on type
        if (itemData.type === 'item' && itemData.item) {
            this.drawItemIcon(this.dragIcon, itemData.item);
        } else if (itemData.type === 'skill' && itemData.name) {
            this.drawSkillIcon(this.dragIcon, itemData.name);
        }
        
        // Position the icon at current mouse position
        const pointer = this.scene.input.activePointer;
        if (pointer) {
            this.dragIcon.x = pointer.x;
            this.dragIcon.y = pointer.y;
        }
        
        // Remove item from its source location
        if (itemData.inventorySlot !== undefined) {
            this.player.inventory.items[itemData.inventorySlot] = null;
        } else if (itemData.equipmentSlot !== undefined) {
            this.player.equipment[itemData.equipmentSlot] = null;
            this.player.updateDerivedStats();
        }
        
        // Refresh inventory display
        if (this.inventoryOpen) {
            this.refreshInventoryPanel();
        }
        
        // Start following mouse cursor
        this.startFollowingCursor();
    }
    
    startFollowingCursor() {
        // Remove any existing cursor follower
        if (this.cursorFollowCallback) {
            this.scene.input.off('pointermove', this.cursorFollowCallback);
        }
        
        // Create the callback function
        this.cursorFollowCallback = (pointer) => {
            if (this.dragIcon && this.isItemOnCursor) {
                this.dragIcon.x = pointer.x;
                this.dragIcon.y = pointer.y;
            }
        };
        
        // Start following the cursor
        this.scene.input.on('pointermove', this.cursorFollowCallback);
    }
    
    placeItem(targetSlot, targetType) {
        if (!this.isItemOnCursor || !this.draggedItem) {
            return false;
        }
        
        const item = this.draggedItem.item;
        
        // Handle different target types
        if (targetType === 'inventory') {
            // Place in inventory slot
            const existingItem = this.player.inventory.items[targetSlot];
            this.player.inventory.items[targetSlot] = item;
            
            // If there was an item there, put it back where this came from
            if (existingItem) {
                if (this.draggedItem.inventorySlot !== undefined) {
                    this.player.inventory.items[this.draggedItem.inventorySlot] = existingItem;
                } else if (this.draggedItem.equipmentSlot !== undefined) {
                    this.player.equipment[this.draggedItem.equipmentSlot] = existingItem;
                    this.player.updateDerivedStats();
                } else if (this.draggedItem.hotbarSlot) {
                    // Put item back in original hotbar slot
                    if (this.draggedItem.hotbarSlot.type === 'potion') {
                        this.player.potionHotbar[this.draggedItem.hotbarSlot.index] = { type: 'item', item: existingItem };
                        this.updatePotionHotbar();
                    }
                }
            } else {
                // Remove from original hotbar location if no swap occurred
                if (this.draggedItem.hotbarSlot && this.draggedItem.hotbarSlot.type === 'potion') {
                    // Item already removed in pickupItemFromHotbar, no need to remove again
                }
            }
            
        } else if (targetType === 'equipment') {
            // Place in equipment slot
            if (!this.canEquipInSlot(item, targetSlot)) {
                return false; // Can't equip here
            }
            
            const existingItem = this.player.equipment[targetSlot];
            this.player.equipment[targetSlot] = item;
            this.player.updateDerivedStats();
            
            // If there was an item there, put it back where this came from
            if (existingItem) {
                if (this.draggedItem.inventorySlot !== undefined) {
                    this.player.inventory.items[this.draggedItem.inventorySlot] = existingItem;
                } else if (this.draggedItem.equipmentSlot !== undefined) {
                    this.player.equipment[this.draggedItem.equipmentSlot] = existingItem;
                }
            }
            
        } else if (targetType === 'world') {
            // Drop to world - item is already removed from inventory in pickupItem
            this.createPlayerItemDropAtPosition(item, targetSlot.x, targetSlot.y);
        }
        
        // Clean up cursor state without returning item to origin (item was successfully placed)
        this.cleanupCursorVisuals();
        
        // Refresh inventory to show changes
        if (this.inventoryOpen) {
            this.refreshInventoryPanel();
        }
        
        return true;
    }
    
    returnItemToOrigin() {
        if (!this.draggedItem || this.draggedItem.type !== 'item') return;
        
        const item = this.draggedItem.item;
        
        // Try to return item to its original location
        if (this.draggedItem.inventorySlot !== undefined) {
            // Return to inventory slot
            this.player.inventory.items[this.draggedItem.inventorySlot] = item;
            if (this.inventoryOpen) {
                this.refreshInventoryPanel();
            }
        } else if (this.draggedItem.equipmentSlot !== undefined) {
            // Return to equipment slot
            this.player.equipment[this.draggedItem.equipmentSlot] = item;
            this.player.updateDerivedStats();
            if (this.inventoryOpen) {
                this.refreshInventoryPanel();
            }
        } else if (this.draggedItem.hotbarSlot && this.draggedItem.hotbarSlot.type === 'potion') {
            // Return to potion hotbar slot
            this.player.potionHotbar[this.draggedItem.hotbarSlot.index] = { type: 'item', item: item };
            this.updatePotionHotbar();
        } else {
            // If we can't determine origin, try to find an empty inventory slot
            const emptySlot = this.player.inventory.items.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
                this.player.inventory.items[emptySlot] = item;
                if (this.inventoryOpen) {
                    this.refreshInventoryPanel();
                }
            } else {
                // No space in inventory - drop to ground at player position
                if (this.scene && this.scene.uiManager) {
                    this.scene.uiManager.createPlayerItemDropAtPosition(item, this.scene.player.x, this.scene.player.y);
                }
            }
        }
    }
    
    cleanupCursor() {
        // Handle cleanup based on what was being dragged
        if (this.isItemOnCursor && this.draggedItem) {
            if (this.draggedItem.type === 'item') {
                // Items should be returned to inventory if possible
                this.returnItemToOrigin();
            } else if (this.draggedItem.type === 'skill') {
                // Skills are just removed (can be re-added from skills panel)
                // No action needed - they're already removed from hotbar
            }
        }
        
        // Clean up cursor following
        if (this.cursorFollowCallback) {
            this.scene.input.off('pointermove', this.cursorFollowCallback);
            this.cursorFollowCallback = null;
        }
        
        // Clean up drag icon
        if (this.dragIcon) {
            this.dragIcon.destroy();
            this.dragIcon = null;
        }
        
        // Clear state
        this.draggedItem = null;
        this.isItemOnCursor = false;
    }
    
    cleanupCursorVisuals() {
        // Clean up cursor following
        if (this.cursorFollowCallback) {
            this.scene.input.off('pointermove', this.cursorFollowCallback);
            this.cursorFollowCallback = null;
        }
        
        // Clean up drag icon
        if (this.dragIcon) {
            this.dragIcon.destroy();
            this.dragIcon = null;
        }
        
        // Clear state
        this.draggedItem = null;
        this.isItemOnCursor = false;
    }
    
    equipItemFromInventory(itemData) {
        if (this.isItemOnCursor) {
            // Ignore right-click if we have an item on cursor
            return;
        }
        
        const item = itemData.item;
        const inventorySlot = itemData.inventorySlot;
        
        // Determine which equipment slot this item goes to
        const equipSlot = this.getEquipmentSlotForItem(item);
        if (!equipSlot) {
            this.showFeedbackMessage('Item cannot be equipped', 400, 300, '#ff0000');
            return;
        }
        
        // Check what's currently equipped in that slot
        const currentlyEquipped = this.player.equipment[equipSlot];
        
        // Equip the new item
        this.player.equipment[equipSlot] = item;
        this.player.inventory.items[inventorySlot] = currentlyEquipped; // Put old item (or null) in inventory
        
        // Update player stats
        this.player.updateDerivedStats();
        
        // Show feedback message
        if (currentlyEquipped) {
            this.showFeedbackMessage(`${item.name} equipped, ${currentlyEquipped.name} moved to inventory`, 400, 300, '#ffff00');
        } else {
            this.showFeedbackMessage(`${item.name} equipped`, 400, 300, '#00ff00');
        }
        
        // Refresh inventory display
        if (this.inventoryOpen) {
            this.refreshInventoryPanel();
        }
    }
    
    unequipItemToInventory(itemData) {
        if (this.isItemOnCursor) {
            // Ignore right-click if we have an item on cursor
            return;
        }
        
        const item = itemData.item;
        const equipmentSlot = itemData.equipmentSlot;
        
        // Find an empty inventory slot
        const emptySlot = this.player.inventory.items.findIndex(slot => slot === null);
        if (emptySlot === -1) {
            // No space in inventory
            this.showFeedbackMessage('Inventory is full!', 400, 300, '#ff0000');
            return;
        }
        
        // Move item from equipment to inventory
        this.player.equipment[equipmentSlot] = null;
        this.player.inventory.items[emptySlot] = item;
        
        // Update player stats
        this.player.updateDerivedStats();
        
        // Show feedback message
        this.showFeedbackMessage(`${item.name} unequipped`, 400, 300, '#00ff00');
        
        // Refresh inventory display
        if (this.inventoryOpen) {
            this.refreshInventoryPanel();
        }
    }
    
    getEquipmentSlotForItem(item) {
        // Return the equipment slot name for this item type
        switch (item.type) {
            case 'weapon':
                return 'weapon';
            case 'armor':
                return 'armor';
            case 'helmet':
                return 'helmet';
            case 'boots':
                return 'boots';
            case 'gloves':
                return 'gloves';
            case 'belt':
                return 'belt';
            case 'shield':
                return 'shield';
            case 'ring':
                // Try ring1 first, then ring2
                if (!this.player.equipment.ring1) {
                    return 'ring1';
                } else {
                    return 'ring2'; // Will swap with ring2
                }
            case 'amulet':
                return 'amulet';
            default:
                return null; // Cannot be equipped
        }
    }
    
    
    createPlayerItemDropAtPosition(item, x, y) {
        // Create visual representation of the dropped item
        const itemSprite = this.scene.add.graphics();
        
        // Position at specified coordinates with slight randomization to avoid stacking
        const offsetX = Phaser.Math.Between(-10, 10);
        const offsetY = Phaser.Math.Between(-10, 10);
        itemSprite.x = x + offsetX;
        itemSprite.y = y + offsetY;
        itemSprite.setDepth(50);
        
        // Draw the proper item icon
        this.drawDroppedItemIcon(itemSprite, item);
        
        // Store item data with the sprite
        itemSprite.itemData = item;
        itemSprite.isItemDrop = true;
        
        // Prevent immediate pickup for player-dropped items (Diablo 2 behavior)
        itemSprite.playerDropped = true;
        itemSprite.dropTime = this.scene.time.now;
        
        // Add to scene's item drops group
        if (!this.scene.itemDrops) {
            this.scene.itemDrops = this.scene.add.group();
        }
        this.scene.itemDrops.add(itemSprite);
        
        // Add physics for pickup interaction
        this.scene.physics.add.existing(itemSprite);
        itemSprite.body.setSize(24, 24);
        
        // Make item glow with animated tween
        this.scene.tweens.add({
            targets: itemSprite,
            alpha: { from: 1.0, to: 0.6 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    
    createPlayerItemDrop(item) {
        // Create visual representation of the dropped item
        const itemSprite = this.scene.add.graphics();
        
        // Position near player but with slight randomization to avoid stacking
        const offsetX = Phaser.Math.Between(-20, 20);
        const offsetY = Phaser.Math.Between(-20, 20);
        itemSprite.x = this.player.x + offsetX;
        itemSprite.y = this.player.y + offsetY;
        itemSprite.setDepth(50);
        
        // Draw the proper item icon (reuse the enemy drop system)
        this.drawDroppedItemIcon(itemSprite, item);
        
        // Store item data with the sprite
        itemSprite.itemData = item;
        itemSprite.isItemDrop = true;
        
        // Add to scene's item drops group
        if (!this.scene.itemDrops) {
            this.scene.itemDrops = this.scene.add.group();
        }
        this.scene.itemDrops.add(itemSprite);
        
        // Add physics for pickup interaction
        this.scene.physics.add.existing(itemSprite);
        itemSprite.body.setSize(24, 24);
        
        // Make item glow with animated tween
        this.scene.tweens.add({
            targets: itemSprite,
            alpha: { from: 1.0, to: 0.6 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    drawDroppedItemIcon(graphics, item) {
        // Use the same icon drawing logic as inventory items
        this.drawItemIcon(graphics, item);
    }
    
    
    addItemToInventory(item) {
        // First try to stack with existing items if stackable
        if (item.stackable) {
            for (let i = 0; i < this.player.inventory.items.length; i++) {
                const existingItem = this.player.inventory.items[i];
                if (existingItem && existingItem.canStackWith(item)) {
                    const spaceAvailable = existingItem.maxStackSize - existingItem.stackSize;
                    const amountToAdd = Math.min(spaceAvailable, item.stackSize);
                    
                    existingItem.stackSize += amountToAdd;
                    item.stackSize -= amountToAdd;
                    
                    // If all items were stacked, we're done
                    if (item.stackSize <= 0) {
                        if (this.inventoryOpen) {
                            this.refreshInventoryPanel();
                        }
                        return true;
                    }
                }
            }
        }
        
        // If we still have items left, find an empty slot
        for (let i = 0; i < this.player.inventory.items.length; i++) {
            if (this.player.inventory.items[i] === null) {
                this.player.inventory.items[i] = item;
                
                // Always refresh inventory UI if it's open
                if (this.inventoryOpen) {
                    this.refreshInventoryPanel();
                }
                
                return true;
            }
        }
        
        return false; // Inventory full
    }
    
    useItem(item) {
        if (item.use(this.player)) {
            // Remove item from inventory if it was consumed
            const index = this.player.inventory.items.indexOf(item);
            if (index !== -1) {
                if (item.stackable && item.stackSize > 1) {
                    item.stackSize--;
                } else {
                    this.player.inventory.items[index] = null;
                    
                    // Remove from hotbars if it was the last one
                    if (this.player.potionHotbar) {
                        for (let i = 0; i < this.player.potionHotbar.length; i++) {
                            if (this.player.potionHotbar[i] && this.player.potionHotbar[i].type === 'item' && this.player.potionHotbar[i].item === item) {
                                this.player.potionHotbar[i] = null;
                            }
                        }
                    }
                }
            }
            
            // Update hotbars and inventory UI
            this.updateAllHotbars();
            if (this.inventoryOpen) {
                this.refreshInventoryPanel();
            }
            
            return true;
        }
        return false;
    }
    
    addItemToHotbar(item) {
        // Find first empty potion hotbar slot
        if (!this.player.potionHotbar) {
            this.player.potionHotbar = new Array(2).fill(null);
        }
        
        for (let i = 0; i < 2; i++) {
            if (!this.player.potionHotbar[i]) {
                this.player.potionHotbar[i] = { type: 'item', item: item };
                this.updatePotionHotbar();
                this.showFeedbackMessage(`${item.name} added to potion hotbar`, 400, 300, '#00ff00');
                return true;
            }
        }
        this.showFeedbackMessage('Potion hotbar is full!', 400, 300, '#ff0000');
        return false;
    }
    
    equipItem(item, inventorySlot) {
        if (!item.equipSlot) return false;
        
        const equipSlot = item.equipSlot;
        
        // Handle ring special case (can go to ring1 or ring2)
        if (equipSlot === 'ring1') {
            if (this.player.equipment.ring1 === null) {
                this.player.equipment.ring1 = item;
                this.player.inventory.items[inventorySlot] = null;
                this.showFeedbackMessage(`${item.name} equipped in ring slot 1`, 400, 300, '#00ff00');
            } else if (this.player.equipment.ring2 === null) {
                this.player.equipment.ring2 = item;
                this.player.inventory.items[inventorySlot] = null;
                this.showFeedbackMessage(`${item.name} equipped in ring slot 2`, 400, 300, '#00ff00');
            } else {
                // Replace ring1 and move old ring to inventory
                const oldRing = this.player.equipment.ring1;
                this.player.equipment.ring1 = item;
                this.player.inventory.items[inventorySlot] = oldRing;
                this.showFeedbackMessage(`${item.name} equipped, ${oldRing.name} moved to inventory`, 400, 300, '#ffff00');
            }
            this.player.updateDerivedStats();
            this.refreshInventoryPanel();
            return true;
        } else {
            // Handle other equipment slots
            const oldItem = this.player.equipment[equipSlot];
            this.player.equipment[equipSlot] = item;
            
            if (oldItem) {
                // Move old item back to inventory
                this.player.inventory.items[inventorySlot] = oldItem;
                this.showFeedbackMessage(`${item.name} equipped, ${oldItem.name} moved to inventory`, 400, 300, '#ffff00');
            } else {
                // Remove item from inventory
                this.player.inventory.items[inventorySlot] = null;
                this.showFeedbackMessage(`${item.name} equipped`, 400, 300, '#00ff00');
            }
        }
        
        // Update player stats based on equipment
        this.player.updateDerivedStats();
        this.refreshInventoryPanel();
        
        // Clear drag state since item was successfully dropped
        this.cleanupCursorVisuals();
        return true;
    }
    
    unequipItem(equipSlot) {
        const item = this.player.equipment[equipSlot];
        if (!item) return false;
        
        // Find empty inventory slot
        for (let i = 0; i < this.player.inventory.items.length; i++) {
            if (this.player.inventory.items[i] === null) {
                // Move item to inventory
                this.player.inventory.items[i] = item;
                this.player.equipment[equipSlot] = null;
                
                // Update player stats
                this.player.updateDerivedStats();
                
                // Refresh inventory panel
                this.refreshInventoryPanel();
                
                this.showFeedbackMessage(`${item.name} unequipped`, 400, 300, '#ffff00');
                return true;
            }
        }
        
        this.showFeedbackMessage('Inventory full! Cannot unequip item.', 400, 300, '#ff0000');
        return false;
    }
    
    // New methods for equipment slot interactions and highlighting
    setupEquipmentSlotInteractions(equipSlot, slot, dropZone, slotSize) {
        // Diablo 2 style click to place item
        dropZone.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.isItemOnCursor && this.draggedItem && this.draggedItem.item) {
                this.placeItem(equipSlot.slot, 'equipment');
            }
        });
        
        // Visual feedback for hover when item on cursor
        dropZone.on('pointerover', () => {
            if (this.isItemOnCursor && this.draggedItem && this.draggedItem.item) {
                // Check if item can be equipped in this slot
                if (this.canEquipInSlot(this.draggedItem.item, equipSlot.slot)) {
                    slot.clear();
                    slot.fillStyle(0x2a4a2a, 1);
                    slot.fillRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
                    slot.lineStyle(3, 0x00ff00, 1);
                    slot.strokeRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
                } else {
                    slot.clear();
                    slot.fillStyle(0x4a2a2a, 1);
                    slot.fillRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
                    slot.lineStyle(3, 0xff0000, 1);
                    slot.strokeRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
                }
            }
        });
        
        dropZone.on('pointerout', () => {
            if (this.isItemOnCursor && this.draggedItem && this.draggedItem.item) {
                this.restoreEquipmentSlotAppearance(slot, equipSlot, slotSize);
            }
        });
    }
    
    
    highlightCompatibleSlots(item) {
        if (!this.inventoryElements) return;
        
        // Store highlighted slots for later clearing
        this.highlightedSlots = [];
        
        // Find equipment slots in the current inventory panel
        const equipmentSlots = [
            { slot: 'helmet', x: 120, y: 85 },
            { slot: 'amulet', x: 180, y: 125 },
            { slot: 'armor', x: 120, y: 185 },
            { slot: 'weapon', x: 60, y: 185 },
            { slot: 'shield', x: 180, y: 185 },
            { slot: 'ring1', x: 60, y: 245 },
            { slot: 'belt', x: 120, y: 245 },
            { slot: 'ring2', x: 180, y: 245 },
            { slot: 'gloves', x: 60, y: 305 },
            { slot: 'boots', x: 120, y: 305 }
        ];
        
        // Highlight compatible equipment slots
        equipmentSlots.forEach(equipSlot => {
            if (this.canEquipInSlot(item, equipSlot.slot)) {
                // Find the graphics object for this slot and highlight it
                this.inventoryElements.forEach(element => {
                    if (element.getData && element.getData('equipSlot') === equipSlot.slot) {
                        this.highlightSlot(element, equipSlot, true);
                        this.highlightedSlots.push({ element, equipSlot });
                    }
                });
            }
        });
    }
    
    clearSlotHighlighting() {
        if (this.highlightedSlots) {
            this.highlightedSlots.forEach(({ element, equipSlot }) => {
                this.restoreEquipmentSlotAppearance(element, equipSlot, 40);
            });
            this.highlightedSlots = [];
        }
    }
    
    highlightSlot(slot, equipSlot, compatible) {
        const slotSize = 40;
        const color = compatible ? 0x00ff00 : 0xff0000;
        const bgColor = compatible ? 0x2a4a2a : 0x4a2a2a;
        
        slot.clear();
        slot.fillStyle(bgColor, 1);
        slot.fillRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
        slot.lineStyle(3, color, 1);
        slot.strokeRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
    }
    
    restoreEquipmentSlotAppearance(slot, equipSlot, slotSize) {
        slot.clear();
        slot.fillStyle(0x1a1a1a, 1);
        slot.fillRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
        slot.lineStyle(2, 0x8b4513, 1);
        slot.strokeRect(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize);
    }
    
    canEquipInSlot(item, targetSlot) {
        if (!item.equipSlot) return false;
        
        // Handle ring special case
        if (item.equipSlot === 'ring1' && (targetSlot === 'ring1' || targetSlot === 'ring2')) {
            return true;
        }
        
        return item.equipSlot === targetSlot;
    }
    
    handleEquipmentDrop(targetSlot) {
        if (!this.draggedItem || this.draggedItem.type !== 'item') return;
        
        const item = this.draggedItem.item;
        
        // Check if item can be equipped in this slot
        if (!this.canEquipInSlot(item, targetSlot)) {
            this.showFeedbackMessage('Cannot equip item in this slot', 400, 300, '#ff0000');
            return;
        }
        
        // Handle equipping from inventory
        if (this.draggedItem.inventorySlot !== undefined) {
            // Use the existing equipItem method which handles rings properly
            this.equipItem(item, this.draggedItem.inventorySlot);
        }
        // Handle moving between equipment slots
        else if (this.draggedItem.equipmentSlot !== undefined) {
            const sourceSlot = this.draggedItem.equipmentSlot;
            const oldItem = this.player.equipment[targetSlot];
            
            // Swap items
            this.player.equipment[targetSlot] = item;
            this.player.equipment[sourceSlot] = oldItem;
            
            this.showFeedbackMessage(`${item.name} moved to ${targetSlot}`, 400, 300, '#00ff00');
            
            // Update player stats and refresh UI
            this.player.updateDerivedStats();
            this.refreshInventoryPanel();
        }
    }
}