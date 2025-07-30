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
        this.hotbarSlots = [];
        
        
        this.setupUI();
        this.setupControls();
    }
    
    setupUI() {
        this.createExperienceBar();
        this.createExtendedHotbar();
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
        
        // Hotbar keys 1-6 for keyboard skills
        for (let i = 1; i <= 6; i++) {
            this.scene.input.keyboard.on(`keydown-DIGIT${i}`, () => {
                this.useHotbarSlot(i - 1);
            });
        }
        
        // ESC to close all panels
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.closeAllPanels();
        });
    }
    
    createExperienceBar() {
        const barWidth = 400;
        const barHeight = 20;
        const barX = (this.scene.cameras.main.width - barWidth) / 2;
        const barY = 10;
        
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
        
        // Level text
        this.levelText = this.scene.add.text(barX - 50, barY + barHeight/2, '', {
            fontSize: '14px',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    }
    
    createExtendedHotbar() {
        const hotbarY = this.scene.cameras.main.height - 60;
        const centerX = this.scene.cameras.main.width / 2;
        const slotSize = 40;
        const slotSpacing = 50;
        const startX = centerX - (4 * slotSpacing);
        
        // Background for hotbar
        this.hotbarBg = this.scene.add.graphics();
        this.hotbarBg.fillStyle(0x2a1810, 0.9);
        this.hotbarBg.fillRect(startX - 30, hotbarY - 30, 8 * slotSpacing + 20, 70);
        this.hotbarBg.lineStyle(2, 0x8b4513, 1);
        this.hotbarBg.strokeRect(startX - 30, hotbarY - 30, 8 * slotSpacing + 20, 70);
        this.hotbarBg.setScrollFactor(0).setDepth(1000);
        
        // Slot labels (keys 1-6, then LMB, RMB)
        const slotLabels = ['1', '2', '3', '4', '5', '6', 'LMB', 'RMB'];
        
        // Create hotbar slots
        for (let i = 0; i < 8; i++) {
            const slotX = startX + (i * slotSpacing);
            
            // Different styling for mouse button slots
            const isMouseSlot = i >= 6;
            const slotColor = isMouseSlot ? 0x2a2a2a : 0x1a1a1a;
            const borderColor = isMouseSlot ? 0xa0522d : 0x8b4513;
            
            // Slot background
            const slot = this.scene.add.graphics();
            slot.fillStyle(slotColor, 1);
            slot.fillRect(slotX - slotSize/2, hotbarY - slotSize/2, slotSize, slotSize);
            slot.lineStyle(2, borderColor, 1);
            slot.strokeRect(slotX - slotSize/2, hotbarY - slotSize/2, slotSize, slotSize);
            slot.setScrollFactor(0).setDepth(1001);
            
            // Slot label
            const labelText = this.scene.add.text(slotX, hotbarY + 25, slotLabels[i], {
                fontSize: '10px',
                fill: isMouseSlot ? '#ffff88' : '#cccccc',
                fontWeight: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);
            
            // Icon placeholder
            const icon = this.scene.add.graphics();
            icon.setScrollFactor(0).setDepth(1002);
            icon.x = slotX;
            icon.y = hotbarY;
            
            // Make slots interactive for tooltips and right-click removal
            slot.setInteractive(new Phaser.Geom.Rectangle(slotX - slotSize/2, hotbarY - slotSize/2, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
            
            // Add hover events for tooltips
            slot.on('pointerover', () => {
                this.showTooltip(i, slotX, hotbarY - 60);
            });
            slot.on('pointerout', () => {
                this.hideTooltip();
            });
            
            // Add right-click to remove (except for move skill)
            slot.on('pointerdown', (pointer, localX, localY, event) => {
                if (pointer.rightButtonDown()) {
                    const hotbarItem = this.player.hotbar[i];
                    if (hotbarItem && hotbarItem.type !== 'action') { // Don't remove move skill
                        const itemName = hotbarItem.type === 'skill' ? 
                            this.capitalizeFirst(hotbarItem.name) : 
                            hotbarItem.item ? hotbarItem.item.name : 'Item';
                        
                        this.player.hotbar[i] = null;
                        this.updateHotbar();
                        this.showFeedbackMessage(`${itemName} removed`, slotX, hotbarY - 40, '#ff8800');
                        event.stopPropagation();
                    }
                }
            });
            
            this.hotbarSlots.push({
                slot: slot,
                icon: icon,
                label: labelText,
                x: slotX,
                y: hotbarY,
                cooldownOverlay: null,
                isMouseSlot: isMouseSlot,
                slotIndex: i
            });
        }
        
        this.updateHotbar();
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
            'I - Inventory\nC - Character\nS - Skills\n1-6 - Hotbar\nLMB/RMB - Mouse Skills', {
            fontSize: '10px',
            fill: '#cccccc',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 5, y: 3 }
        }).setScrollFactor(0).setDepth(1000);
    }
    
    updateUI() {
        this.updateExperienceBar();
        this.updateCharacterInfo();
        this.updateHotbar();
    }
    
    updateExperienceBar() {
        const barWidth = 400;
        const barHeight = 20;
        const barX = (this.scene.cameras.main.width - barWidth) / 2;
        const barY = 10;
        
        const expPercent = this.player.experience / this.player.experienceToNext;
        
        this.expBar.clear();
        this.expBar.fillStyle(0x0088ff, 0.8);
        this.expBar.fillRect(barX + 2, barY + 2, (barWidth - 4) * expPercent, barHeight - 4);
        
        this.expText.setText(`${this.player.experience} / ${this.player.experienceToNext}`);
        this.levelText.setText(`Level ${this.player.level}`);
    }
    
    updateCharacterInfo() {
        const info = [
            `Level: ${this.player.level}`,
            `Health: ${Math.floor(this.player.health)}/${this.player.maxHealth}`,
            `Mana: ${Math.floor(this.player.mana)}/${this.player.maxMana}`,
            `Stat Points: ${this.player.statPoints}`,
            `Skill Points: ${this.player.skillPoints}`
        ];
        
        this.characterInfo.setText(info.join('\n'));
    }
    
    updateHotbar() {
        for (let i = 0; i < this.hotbarSlots.length; i++) {
            const slot = this.hotbarSlots[i];
            const hotbarItem = this.player.hotbar[i];
            
            slot.icon.clear();
            
            if (hotbarItem) {
                if (hotbarItem.type === 'skill') {
                    const skill = this.player.skills[hotbarItem.name];
                    if (skill && skill.level > 0) {
                        // Draw skill icon based on skill type
                        this.drawSkillIcon(slot.icon, hotbarItem.name);
                        
                        // Update cooldown overlay
                        this.updateSkillCooldown(i, hotbarItem.name);
                    } else {
                        // Draw grayed out icon for unlearned skills
                        this.drawSkillIcon(slot.icon, hotbarItem.name, true);
                    }
                } else if (hotbarItem.type === 'item') {
                    // Draw item icon based on item type
                    this.drawItemIcon(slot.icon, hotbarItem.item);
                } else if (hotbarItem.type === 'action') {
                    // Draw action icon
                    this.drawActionIcon(slot.icon, hotbarItem.name);
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
                if (item.name === 'Health Potion') {
                    // Red bottle shape
                    graphics.fillStyle(0xcc0000, 1);
                    graphics.fillRoundedRect(-8, -10, 16, 20, 3);
                    graphics.fillStyle(0xff4444, 1);
                    graphics.fillRoundedRect(-6, -8, 12, 16, 2);
                    // Cork/cap
                    graphics.fillStyle(0x8b4513, 1);
                    graphics.fillRect(-4, -12, 8, 4);
                } else if (item.name === 'Mana Potion') {
                    // Blue bottle shape
                    graphics.fillStyle(0x0000cc, 1);
                    graphics.fillRoundedRect(-8, -10, 16, 20, 3);
                    graphics.fillStyle(0x4444ff, 1);
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
        }
    }
    
    updateSkillCooldown(slotIndex, skillName) {
        const slot = this.hotbarSlots[slotIndex];
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
            slot.cooldownOverlay.fillRect(
                slot.x - 20, 
                slot.y - 20 + (40 * (1 - cooldownPercent)), 
                40, 
                40 * cooldownPercent
            );
        }
    }
    
    useHotbarSlot(index) {
        const hotbarItem = this.player.hotbar[index];
        if (!hotbarItem) return;
        
        if (hotbarItem.type === 'skill') {
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
                // Teleport to mouse position
                const pointer = this.scene.input.activePointer;
                const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.player.castTeleport(worldPoint.x, worldPoint.y);
            } else if (hotbarItem.name === 'fireball') {
                // Fireball needs targeting - cast toward mouse position
                const pointer = this.scene.input.activePointer;
                const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.player.castFireball(worldPoint.x, worldPoint.y);
            }
        } else if (hotbarItem.type === 'item') {
            // Use consumable item
            const success = this.useItem(hotbarItem.item);
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
        const panelWidth = 600;  // Wider to fit equipment + inventory
        const panelHeight = 400; // Taller for better layout
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
        const invLabel = this.scene.add.text(panelX + 470, panelY + 35, 'ITEMS', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
        
        this.inventoryElements.push(equipLabel, invLabel);
        
        // Create equipment slots (left side)
        this.createEquipmentSlots(panelX + 20, panelY + 65);
        
        // Create inventory grid (right side) - centered in available space
        this.createInventoryGrid(panelX + 335, panelY + 80);
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
            
            // Check if item is equipped in this slot
            const equippedItem = this.player.equipment[equipSlot.slot];
            if (equippedItem) {
                const itemIcon = this.scene.add.graphics();
                itemIcon.x = equipSlot.x;
                itemIcon.y = equipSlot.y;
                itemIcon.setScrollFactor(0).setDepth(2002);
                this.drawItemIcon(itemIcon, equippedItem);
                this.inventoryElements.push(itemIcon);
                
                // Add tooltip and unequip functionality
                slot.setInteractive(new Phaser.Geom.Rectangle(equipSlot.x - slotSize/2, equipSlot.y - slotSize/2, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
                slot.on('pointerover', () => {
                    this.showInventoryItemTooltip(equippedItem, equipSlot.x, equipSlot.y - 30);
                });
                slot.on('pointerout', () => {
                    this.hideTooltip();
                });
                slot.on('pointerdown', (pointer, localX, localY, event) => {
                    if (pointer.rightButtonDown()) {
                        this.unequipItem(equipSlot.slot);
                        event.stopPropagation();
                    }
                });
            }
            
            this.inventoryElements.push(slot, label);
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
        const slotSize = 32;    // Larger slots for better visibility
        const spacing = 34;     // Better spacing that fills available width nicely
        
        for (let row = 0; row < this.player.inventory.height; row++) {
            for (let col = 0; col < this.player.inventory.width; col++) {
                const slotX = startX + (col * spacing);
                const slotY = startY + (row * spacing);
                const slotIndex = row * this.player.inventory.width + col;
                
                const slot = this.scene.add.graphics();
                slot.fillStyle(0x1a1a1a, 1);
                slot.fillRect(slotX, slotY, slotSize, slotSize);
                slot.lineStyle(1, 0x666666, 1);
                slot.strokeRect(slotX, slotY, slotSize, slotSize);
                slot.setScrollFactor(0).setDepth(2001);
                
                // Add item representation if slot contains item
                const item = this.player.inventory.items[slotIndex];
                if (item) {
                    // Create item icon using the new icon system
                    const itemIcon = this.scene.add.graphics();
                    itemIcon.x = slotX + slotSize/2;
                    itemIcon.y = slotY + slotSize/2;
                    itemIcon.setScrollFactor(0).setDepth(2002);
                    this.drawItemIcon(itemIcon, item);
                    this.inventoryElements.push(itemIcon);
                    
                    // Add hover tooltip and click interactions for inventory items
                    slot.setInteractive(new Phaser.Geom.Rectangle(slotX, slotY, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
                    slot.on('pointerover', () => {
                        this.showInventoryItemTooltip(item, slotX + slotSize/2, slotY - 10);
                    });
                    slot.on('pointerout', () => {
                        this.hideTooltip();
                    });
                    
                    // Right-click to use/equip item or add to hotbar
                    slot.on('pointerdown', (pointer, localX, localY, event) => {
                        if (pointer.rightButtonDown()) {
                            if (item.type === 'potion') {
                                // Use potion directly or add to first empty hotbar slot
                                this.addItemToHotbar(item);
                            } else if (item.equipSlot) {
                                // Equip item
                                this.equipItem(item, slotIndex);
                            }
                            event.stopPropagation();
                        }
                    });
                }
                
                this.inventoryElements.push(slot);
            }
        }
    }
    
    refreshInventoryPanel() {
        if (this.inventoryOpen && this.inventoryElements) {
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
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.skillTreePanelElements = [];
        }
    }
    
    createSkillTreePanel() {
        const panelWidth = 700;
        const panelHeight = 400;
        const panelX = (this.scene.cameras.main.width - panelWidth) / 2;
        const panelY = 50;
        
        // Create skills panel elements without container for better interactivity
        this.skillTreePanelElements = [];
        
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
        
        // Create skill entries
        this.createSkillEntries(panelX + 20, panelY + 60);
        
        // Create draggable skill palette (moved further right to avoid overlap)
        this.createSkillPalette(panelX + 380, panelY + 60);
    }
    
    createSkillEntries(startX, startY) {
        const skillNames = Object.keys(this.player.skills);
        
        skillNames.forEach((skillName, index) => {
            const skill = this.player.skills[skillName];
            const y = startY + (index * 40);
            
            const skillText = this.scene.add.text(startX, y, 
                `${skillName.charAt(0).toUpperCase() + skillName.slice(1)}: ${skill.level}/${skill.maxLevel}`, {
                fontSize: '14px',
                fill: skill.level > 0 ? '#ffffff' : '#666666'
            }).setScrollFactor(0).setDepth(2001);
            
            this.skillTreePanelElements.push(skillText);
            
            if (this.player.skillPoints > 0 && skill.level < skill.maxLevel) {
                const upgradeButton = this.scene.add.text(startX + 220, y, '+', {
                    fontSize: '16px',
                    fill: '#00ff00',
                    backgroundColor: '#2a1810',
                    padding: { x: 8, y: 4 }
                }).setInteractive().setScrollFactor(0).setDepth(2002);
                
                upgradeButton.on('pointerdown', () => {
                    if (this.player.upgradeSkill(skillName)) {
                        this.closeSkillTree();
                        this.openSkillTree(); // Refresh the panel
                    }
                });
                
                // Add hover effects
                upgradeButton.on('pointerover', () => {
                    upgradeButton.setStyle({ fill: '#00ff88', backgroundColor: '#3a2820' });
                });
                
                upgradeButton.on('pointerout', () => {
                    upgradeButton.setStyle({ fill: '#00ff00', backgroundColor: '#2a1810' });
                });
                
                this.skillTreePanelElements.push(upgradeButton);
            }
        });
    }
    
    createSkillPalette(startX, startY) {
        // Title for palette
        const paletteTitle = this.scene.add.text(startX, startY - 20, 'Drag to Hotbar:', {
            fontSize: '14px',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setScrollFactor(0).setDepth(2001);
        this.skillTreePanelElements.push(paletteTitle);
        
        // All available skills and actions
        const availableItems = [
            { type: 'skill', name: 'fireball', display: 'Fireball' },
            { type: 'skill', name: 'frostNova', display: 'Frost Nova' },
            { type: 'skill', name: 'teleport', display: 'Teleport' },
            { type: 'skill', name: 'chainLightning', display: 'Chain Lightning' },
            { type: 'skill', name: 'iceBolt', display: 'Ice Bolt' },
            { type: 'skill', name: 'meteor', display: 'Meteor' },
            { type: 'action', name: 'move', display: 'Move Action' }
        ];
        
        availableItems.forEach((item, index) => {
            const y = startY + (index * 50);
            
            // Create draggable skill icon
            const skillSlot = this.scene.add.graphics();
            skillSlot.fillStyle(0x1a1a1a, 1);
            skillSlot.fillRect(startX - 20, y - 20, 40, 40);
            skillSlot.lineStyle(2, 0x8b4513, 1);
            skillSlot.strokeRect(startX - 20, y - 20, 40, 40);
            skillSlot.setInteractive(new Phaser.Geom.Rectangle(startX - 20, y - 20, 40, 40), Phaser.Geom.Rectangle.Contains);
            skillSlot.setScrollFactor(0).setDepth(2001);
            
            // Skill icon
            const skillIcon = this.scene.add.graphics();
            skillIcon.x = startX;
            skillIcon.y = y;
            skillIcon.setScrollFactor(0).setDepth(2002);
            
            if (item.type === 'skill') {
                const skill = this.player.skills[item.name];
                const grayed = !skill || skill.level === 0;
                this.drawSkillIcon(skillIcon, item.name, grayed);
            } else if (item.type === 'action') {
                this.drawActionIcon(skillIcon, item.name);
            }
            
            // Skill label
            const skillLabel = this.scene.add.text(startX + 30, y, item.display, {
                fontSize: '12px',
                fill: '#ffffff'
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001);
            
            // Make interactive for clicking only
            skillSlot.setInteractive(new Phaser.Geom.Rectangle(startX - 20, y - 20, 40, 40), Phaser.Geom.Rectangle.Contains);
            
            // Simple click to assign
            skillSlot.on('pointerdown', (pointer, localX, localY, event) => {
                
                // Find first empty hotbar slot
                let assigned = false;
                for (let i = 0; i < 8; i++) {
                    if (!this.player.hotbar[i]) {
                        this.player.hotbar[i] = { ...item };
                        this.updateHotbar();
                        assigned = true;
                        break;
                    }
                }
                
                // Show feedback message
                if (assigned) {
                    this.showFeedbackMessage(`${item.display} added to hotbar`, startX, y - 40, '#00ff00');
                } else {
                    this.showFeedbackMessage('Hotbar is full!', startX, y - 40, '#ff0000');
                }
                
                event.stopPropagation();
            });
            
            // Add tooltip for skill palette items
            skillSlot.on('pointerover', () => {
                let tooltipText = item.display;
                if (item.type === 'skill') {
                    const skill = this.player.skills[item.name];
                    if (skill && skill.level > 0) {
                        tooltipText += `\nLevel: ${skill.level}`;
                    } else {
                        tooltipText += '\nNot learned';
                    }
                }
                tooltipText += '\nClick to add to hotbar';
                this.showSimpleTooltip(tooltipText, startX, y - 30);
            });
            
            skillSlot.on('pointerout', () => {
                this.hideTooltip();
            });
            
            this.skillTreePanelElements.push(skillSlot, skillIcon, skillLabel);
        });
    }
    
    
    closeAllPanels() {
        this.closeInventory();
        this.closeCharacterSheet();
        this.closeSkillTree();
    }
    
    showTooltip(slotIndex, x, y) {
        this.hideTooltip(); // Hide any existing tooltip
        
        const hotbarItem = this.player.hotbar[slotIndex];
        if (!hotbarItem) return;
        
        let tooltipText = '';
        
        if (hotbarItem.type === 'skill') {
            const skill = this.player.skills[hotbarItem.name];
            if (skill && skill.level > 0) {
                const damage = this.player.getSkillDamage(hotbarItem.name);
                const manaCost = this.player.getSkillManaCost(hotbarItem.name);
                
                tooltipText = `${this.capitalizeFirst(hotbarItem.name)}\nLevel: ${skill.level}/${skill.maxLevel}`;
                if (damage > 0) tooltipText += `\nDamage: ${damage}`;
                if (manaCost > 0) tooltipText += `\nMana Cost: ${manaCost}`;
                if (hotbarItem.name === 'frostNova') {
                    const radius = this.player.getSkillRadius(hotbarItem.name);
                    tooltipText += `\nRadius: ${radius}`;
                }
            } else {
                tooltipText = `${this.capitalizeFirst(hotbarItem.name)}\nNot learned`;
            }
        } else if (hotbarItem.type === 'item') {
            const item = hotbarItem.item;
            tooltipText = item.getTooltipText().join('\n');
        } else if (hotbarItem.type === 'action') {
            if (hotbarItem.name === 'move') {
                tooltipText = 'Move\nClick to move to target location';
            }
        }
        
        if (tooltipText) {
            // Create tooltip background
            this.tooltipBg = this.scene.add.graphics();
            this.tooltipBg.fillStyle(0x000000, 0.9);
            this.tooltipBg.lineStyle(2, 0x8b4513, 1);
            
            // Create tooltip text
            this.tooltipText = this.scene.add.text(x, y, tooltipText, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: { x: 8, y: 6 },
                align: 'left'
            }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(3000);
            
            // Position and size background to match text
            const bounds = this.tooltipText.getBounds();
            this.tooltipBg.fillRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
            this.tooltipBg.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
            this.tooltipBg.setScrollFactor(0).setDepth(2999);
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
    
    
    
    addItemToInventory(item) {
        // Find first empty slot
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
                    
                    // Remove from hotbar if it was the last one
                    for (let i = 0; i < this.player.hotbar.length; i++) {
                        if (this.player.hotbar[i] && this.player.hotbar[i].type === 'item' && this.player.hotbar[i].item === item) {
                            this.player.hotbar[i] = null;
                        }
                    }
                }
            }
            
            // Update hotbar and inventory UI
            this.updateHotbar();
            if (this.inventoryOpen) {
                this.refreshInventoryPanel();
            }
            
            return true;
        }
        return false;
    }
    
    addItemToHotbar(item) {
        // Find first empty hotbar slot for consumables
        for (let i = 0; i < 6; i++) { // Only use keyboard slots (0-5)
            if (!this.player.hotbar[i]) {
                this.player.hotbar[i] = { type: 'item', item: item };
                this.updateHotbar();
                this.showFeedbackMessage(`${item.name} added to hotbar`, 400, 300, '#00ff00');
                return true;
            }
        }
        this.showFeedbackMessage('Hotbar is full!', 400, 300, '#ff0000');
        return false;
    }
    
    equipItem(item, inventorySlot) {
        if (!item.equipSlot) return false;
        
        const equipSlot = item.equipSlot;
        
        // Handle ring special case (can go to ring1 or ring2)
        if (equipSlot === 'ring1') {
            if (this.player.equipment.ring1 === null) {
                this.player.equipment.ring1 = item;
            } else if (this.player.equipment.ring2 === null) {
                this.player.equipment.ring2 = item;
            } else {
                // Replace ring1 and move old ring to inventory
                const oldRing = this.player.equipment.ring1;
                this.player.equipment.ring1 = item;
                this.player.inventory.items[inventorySlot] = oldRing;
                this.showFeedbackMessage(`${item.name} equipped, ${oldRing.name} moved to inventory`, 400, 300, '#ffff00');
                this.refreshInventoryPanel();
                return true;
            }
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
}