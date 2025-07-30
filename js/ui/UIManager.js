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
        
        // Hotbar elements
        this.potionHotbarSlots = [];
        this.mouseHotbarSlots = [];
        this.skillsHotbarSlots = [];
        
        // Drag-and-drop support
        this.draggedItem = null;
        this.dragIcon = null;
        
        this.setupUI();
        this.setupControls();
    }
    
    setupUI() {
        this.createExperienceBar();
        this.createHealthManaGlobes();
        this.createPotionHotbar();
        this.createSkillsHotbar();
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
        const globeSize = 60;
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        // Health globe (bottom left)
        const healthGlobeX = 50;
        const healthGlobeY = screenHeight - 80;
        
        // Mana globe (bottom right)  
        const manaGlobeX = screenWidth - 50;
        const manaGlobeY = screenHeight - 80;
        
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
        const hotbarX = 150; // Moved right to avoid overlapping health orb
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
        const hotbarX = this.scene.cameras.main.width - 200;
        const mouseHotbarY = this.scene.cameras.main.height - 130;
        const skillsHotbarY = this.scene.cameras.main.height - 70;
        
        // Background for mouse hotbar
        const mouseBgWidth = 3 * slotSpacing + 30;
        this.mouseHotbarBg = this.scene.add.graphics();
        this.mouseHotbarBg.fillStyle(0x2a1810, 0.9);
        this.mouseHotbarBg.fillRect(hotbarX - mouseBgWidth/2, mouseHotbarY - 30, mouseBgWidth, 60);
        this.mouseHotbarBg.lineStyle(2, 0x8b4513, 1);
        this.mouseHotbarBg.strokeRect(hotbarX - mouseBgWidth/2, mouseHotbarY - 30, mouseBgWidth, 60);
        this.mouseHotbarBg.setScrollFactor(0).setDepth(1000);
        
        // Create 3 mouse button slots
        const mouseLabels = ['LMB', 'MMB', 'RMB'];
        for (let i = 0; i < 3; i++) {
            const slotX = hotbarX - slotSpacing + (i * slotSpacing);
            
            const slot = this.createHotbarSlot(slotX, mouseHotbarY, mouseSlotSize, mouseLabels[i], 'mouse', i);
            this.mouseHotbarSlots.push(slot);
        }
        
        // Background for skills hotbar
        const skillsBgWidth = 4 * slotSpacing + 20;
        this.skillsHotbarBg = this.scene.add.graphics();
        this.skillsHotbarBg.fillStyle(0x2a1810, 0.9);
        this.skillsHotbarBg.fillRect(hotbarX - skillsBgWidth/2, skillsHotbarY - 25, skillsBgWidth, 50);
        this.skillsHotbarBg.lineStyle(2, 0x8b4513, 1);
        this.skillsHotbarBg.strokeRect(hotbarX - skillsBgWidth/2, skillsHotbarY - 25, skillsBgWidth, 50);
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
        
        // Hover events for tooltips
        slot.on('pointerover', () => {
            this.showHotbarTooltip(slotType, slotIndex, x, y - 60);
        });
        slot.on('pointerout', () => {
            this.hideTooltip();
        });
        
        // Right-click to remove
        slot.on('pointerdown', (pointer, localX, localY, event) => {
            if (pointer.rightButtonDown()) {
                this.removeFromHotbar(slotType, slotIndex);
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
            'I - Inventory\nC - Character\nS - Skills\n1-4 - Skills\nQ/E - Potions\nLMB/MMB/RMB - Mouse Actions', {
            fontSize: '10px',
            fill: '#cccccc',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 5, y: 3 }
        }).setScrollFactor(0).setDepth(1000);
    }
    
    updateUI() {
        this.updateExperienceBar();
        this.updateHealthManaGlobes();
        this.updateCharacterInfo();
        this.updateAllHotbars();
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
    
    useMouseHotbarSlot(index, worldPoint) {
        const hotbarItem = this.player.mouseHotbar ? this.player.mouseHotbar[index] : null;
        if (!hotbarItem) return;
        
        if (hotbarItem.type === 'action' && hotbarItem.name === 'move') {
            // Handle movement
            this.scene.playerTarget = worldPoint;
            this.scene.createMoveMarker(worldPoint.x, worldPoint.y);
        } else if (hotbarItem.type === 'skill') {
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
        this.inventoryOpen = true;
        this.createInventoryPanel();
    }
    
    closeInventory() {
        this.inventoryOpen = false;
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
                
                // Add tooltip and drag functionality for equipped items
                const equippedContainer = this.scene.add.container(equipSlot.x, equipSlot.y);
                equippedContainer.setSize(slotSize, slotSize);
                equippedContainer.setInteractive({ draggable: true });
                equippedContainer.setScrollFactor(0).setDepth(2003);
                equippedContainer.itemData = {
                    type: 'item',
                    item: equippedItem,
                    display: equippedItem.name,
                    equipmentSlot: equipSlot.slot
                };
                
                // Drag events for equipped items
                this.setupEquippedItemDrag(equippedContainer, equippedItem);
                
                // Tooltip events
                equippedContainer.on('pointerover', () => {
                    if (!this.draggedItem) {
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
                    
                    // Make all items draggable
                    const itemContainer = this.scene.add.container(slotX + (slotSize - padding)/2, slotY + (slotSize - padding)/2);
                    itemContainer.setSize(slotSize - padding, slotSize - padding);
                    itemContainer.setInteractive({ draggable: true });
                    itemContainer.setScrollFactor(0).setDepth(2003);
                    itemContainer.itemData = { 
                        type: 'item', 
                        item: item, 
                        display: item.name, 
                        inventorySlot: slotIndex
                    };
                    
                    // Drag events
                    itemContainer.on('dragstart', (pointer) => {
                        this.draggedItem = itemContainer.itemData;
                        itemContainer.setAlpha(0.5);
                        
                        // Create drag icon
                        this.dragIcon = this.scene.add.graphics();
                        this.dragIcon.setScrollFactor(0).setDepth(5000);
                        this.drawItemIcon(this.dragIcon, item);
                        
                        // Highlight compatible equipment slots
                        this.highlightCompatibleSlots(item);
                    });
                    
                    itemContainer.on('drag', (pointer, dragX, dragY) => {
                        if (this.dragIcon) {
                            this.dragIcon.x = pointer.x;
                            this.dragIcon.y = pointer.y;
                        }
                    });
                    
                    itemContainer.on('dragend', (pointer) => {
                        itemContainer.setAlpha(1);
                        if (this.dragIcon) {
                            this.dragIcon.destroy();
                            this.dragIcon = null;
                        }
                        this.draggedItem = null;
                        
                        // Remove slot highlighting
                        this.clearSlotHighlighting();
                    });
                    
                    // Add tooltip events to the draggable container since it's on top
                    itemContainer.on('pointerover', () => {
                        if (!this.draggedItem) {
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
        // Drop events
        this.scene.input.on('drop', (pointer, gameObject, targetDropZone) => {
            if (targetDropZone === dropZone && this.draggedItem) {
                this.handleInventoryDrop(slotIndex);
            }
        });
        
        // Visual feedback for drag over
        this.scene.input.on('dragenter', (pointer, gameObject, targetDropZone) => {
            if (targetDropZone === dropZone) {
                slot.clear();
                slot.fillStyle(0x3a3a3a, 1);
                slot.fillRect(slotX, slotY, slotSize - padding, slotSize - padding);
                slot.lineStyle(3, 0x00ff00, 1);
                slot.strokeRect(slotX, slotY, slotSize - padding, slotSize - padding);
            }
        });
        
        this.scene.input.on('dragleave', (pointer, gameObject, targetDropZone) => {
            if (targetDropZone === dropZone) {
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
            // Clean up any drag icons that might be left over
            if (this.dragIcon) {
                this.dragIcon.destroy();
                this.dragIcon = null;
            }
            this.draggedItem = null;
            
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
        
        const tooltipText = item.getTooltipText().join('\n');
        
        this.tooltipText = this.scene.add.text(x, y, tooltipText, {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: { x: 8, y: 6 },
            align: 'left'
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(3000);
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
        this.characterSheetOpen = true;
        this.createCharacterPanel();
    }
    
    closeCharacterSheet() {
        this.characterSheetOpen = false;
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
        this.skillTreeOpen = true;
        this.createSkillTreePanel();
    }
    
    closeSkillTree() {
        this.skillTreeOpen = false;
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
                
                // Show tooltip
                let tooltipText = skillData.display;
                if (skill) {
                    // Add skill description
                    if (skill.description) {
                        tooltipText += `\n"${skill.description}"`;
                    }
                    tooltipText += `\n\nLevel: ${skill.level}/${skill.maxLevel}`;
                    if (skill.level > 0) {
                        const damage = this.player.getSkillDamage(skillData.name);
                        const manaCost = this.player.getSkillManaCost(skillData.name);
                        if (damage > 0) tooltipText += `\nDamage: ${damage}`;
                        if (manaCost > 0) tooltipText += `\nMana Cost: ${manaCost}`;
                    }
                    if (canUpgrade) {
                        tooltipText += '\nClick to upgrade';
                    }
                    if (isLearned) {
                        tooltipText += '\nDrag to hotbar';
                    }
                } else {
                    tooltipText += '\nNot available';
                }
                this.showSimpleTooltip(tooltipText, x, y - skillSize);
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
        
        let tooltipText = '';
        
        if (hotbarItem.type === 'skill') {
            const skill = this.player.skills[hotbarItem.name];
            if (skill && skill.level > 0) {
                const damage = this.player.getSkillDamage(hotbarItem.name);
                const manaCost = this.player.getSkillManaCost(hotbarItem.name);
                
                tooltipText = `${this.capitalizeFirst(hotbarItem.name)}`;
                if (skill.description) {
                    tooltipText += `\n"${skill.description}"`;
                }
                tooltipText += `\n\nLevel: ${skill.level}/${skill.maxLevel}`;
                if (damage > 0) tooltipText += `\nDamage: ${damage}`;
                if (manaCost > 0) tooltipText += `\nMana Cost: ${manaCost}`;
                if (hotbarItem.name === 'frostNova') {
                    const radius = this.player.getSkillRadius(hotbarItem.name);
                    tooltipText += `\nRadius: ${radius}`;
                }
            } else {
                tooltipText = `${this.capitalizeFirst(hotbarItem.name)}`;
                if (skill && skill.description) {
                    tooltipText += `\n"${skill.description}"`;
                }
                tooltipText += `\nNot learned`;
            }
        } else if (hotbarItem.type === 'item') {
            const item = hotbarItem.item;
            if (item) {
                tooltipText = item.getTooltipText().join('\n');
            }
        } else if (hotbarItem.type === 'action') {
            if (hotbarItem.name === 'move') {
                tooltipText = 'Move\nClick to move to target location';
            }
        }
        
        if (tooltipText) {
            this.tooltipText = this.scene.add.text(x, y, tooltipText, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: { x: 8, y: 6 },
                align: 'left'
            }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(3000);
        }
    }
    
    hideTooltip() {
        if (this.tooltipText) {
            this.tooltipText.destroy();
            this.tooltipText = null;
        }
        if (this.tooltipBg) {
            this.tooltipBg.destroy();
            this.tooltipBg = null;
        }
    }
    
    showSimpleTooltip(text, x, y) {
        this.hideTooltip();
        
        this.tooltipText = this.scene.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: { x: 8, y: 6 },
            align: 'left'
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(3000);
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
            
            // Otherwise, place the item normally and remove from inventory
            this.player.potionHotbar[slotIndex] = { ...this.draggedItem };
            
            // Remove from inventory only if it came from inventory (not from another hotbar slot)
            if (this.draggedItem.inventorySlot !== undefined) {
                this.player.inventory.items[this.draggedItem.inventorySlot] = null;
                if (this.inventoryOpen) {
                    this.refreshInventoryPanel();
                }
            }
            
            this.updatePotionHotbar();
            this.restoreSlotAppearance(slotType, slotIndex);
        } else if (slotType === 'mouse' && this.player.mouseHotbar) {
            this.player.mouseHotbar[slotIndex] = { ...this.draggedItem };
            this.updateMouseHotbar();
        } else if (slotType === 'skill' && this.player.skillsHotbar) {
            this.player.skillsHotbar[slotIndex] = { ...this.draggedItem };
            this.updateSkillsHotbar();
        }
        
        this.showFeedbackMessage(`${this.draggedItem.display || this.draggedItem.name} assigned`, 
            this.getSlotByType(slotType, slotIndex).x, 
            this.getSlotByType(slotType, slotIndex).y - 40, 
            '#00ff00');
        
        // Restore slot appearance after successful drop
        this.restoreSlotAppearance(slotType, slotIndex);
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
        // Drop events for equipment slots
        this.scene.input.on('drop', (pointer, gameObject, targetDropZone) => {
            if (targetDropZone === dropZone && this.draggedItem) {
                this.handleEquipmentDrop(equipSlot.slot);
            }
        });
        
        // Visual feedback for drag over equipment slots
        this.scene.input.on('dragenter', (pointer, gameObject, targetDropZone) => {
            if (targetDropZone === dropZone && this.draggedItem && this.draggedItem.type === 'item') {
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
        
        this.scene.input.on('dragleave', (pointer, gameObject, targetDropZone) => {
            if (targetDropZone === dropZone) {
                this.restoreEquipmentSlotAppearance(slot, equipSlot, slotSize);
            }
        });
    }
    
    setupEquippedItemDrag(container, item) {
        container.on('dragstart', (pointer) => {
            this.draggedItem = container.itemData;
            container.setAlpha(0.5);
            
            // Create drag icon
            this.dragIcon = this.scene.add.graphics();
            this.dragIcon.setScrollFactor(0).setDepth(5000);
            this.drawItemIcon(this.dragIcon, item);
            
            // Highlight compatible slots
            this.highlightCompatibleSlots(item);
        });
        
        container.on('drag', (pointer, dragX, dragY) => {
            if (this.dragIcon) {
                this.dragIcon.x = pointer.x;
                this.dragIcon.y = pointer.y;
            }
        });
        
        container.on('dragend', (pointer) => {
            container.setAlpha(1);
            if (this.dragIcon) {
                this.dragIcon.destroy();
                this.dragIcon = null;
            }
            this.draggedItem = null;
            
            // Remove slot highlighting
            this.clearSlotHighlighting();
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