class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        
        // References
        this.gameScene = null;
        this.player = null;
        this.uiManager = null;
    }

    create() {
        // Get reference to the game scene
        this.gameScene = this.scene.get('GameScene');
        
        // Set up event listeners for game scene communication
        this.setupEventListeners();
        
        // Wait for game scene to be ready before creating UI
        if (this.gameScene && this.gameScene.scene.isActive()) {
            this.initializeUI();
        }
    }

    setupEventListeners() {
        // Listen for game events
        if (!this.gameScene || !this.gameScene.events) {
            console.warn('GameScene not ready, delaying event setup');
            this.time.delayedCall(100, () => this.setupEventListeners());
            return;
        }
        
        const gameEvents = this.gameScene.events;
        
        // Player created event
        gameEvents.on('player-created', (player) => {
            this.player = player;
            if (!this.uiManager) {
                this.initializeUI();
            } else {
                this.uiManager.setPlayer(player);
            }
        });
        
        // World transition events
        gameEvents.on('world-transition-start', () => {
            // Keep UI visible during transitions
            this.uiManager.setInteractive(false);
        });
        
        gameEvents.on('world-transition-complete', () => {
            this.uiManager.setInteractive(true);
        });
        
        // Enemy hover events
        gameEvents.on('enemy-hover-start', (enemy) => {
            if (this.uiManager) {
                this.uiManager.showEnemyHealthBar(enemy);
            }
        });
        
        gameEvents.on('enemy-hover-end', () => {
            if (this.uiManager) {
                this.uiManager.hideEnemyHealthBar();
            }
        });
        
        // Item pickup events
        gameEvents.on('item-pickup', (item) => {
            if (this.uiManager) {
                this.uiManager.addItemToInventory(item);
            }
        });
        
        // Experience gain events
        gameEvents.on('experience-gained', (amount) => {
            if (this.uiManager) {
                this.uiManager.updateExperienceBar();
            }
        });
        
        // Level up events
        gameEvents.on('level-up', () => {
            if (this.uiManager) {
                this.uiManager.updateLevelDisplay();
                this.uiManager.showLevelUpButtons();
            }
        });
        
        // Clean up on scene shutdown
        this.events.on('shutdown', this.cleanup, this);
    }

    initializeUI() {
        if (!this.player) {
            this.player = this.gameScene.player;
        }
        
        if (!this.player) {
            // Wait for player to be created
            this.time.delayedCall(100, () => this.initializeUI());
            return;
        }
        
        // Create UIManager with this scene context
        this.uiManager = new UIManager(this, this.player);
        
        // Store reference in registry for global access
        this.registry.set('uiManager', this.uiManager);
        
        // Notify game scene that UI is ready
        this.gameScene.events.emit('ui-ready', this.uiManager);
    }

    update(time, delta) {
        // Update UI elements that need constant updates
        if (this.uiManager && this.player) {
            // Update health/mana displays
            this.uiManager.updateHealthManaDisplay();
            
            // Update minimap
            this.uiManager.updateMinimap();
            
            // Update buff/debuff timers
            this.uiManager.updateBuffTimers();
            
            // Update skill cooldowns
            this.uiManager.updateSkillCooldowns();
        }
    }

    // Methods to handle UI actions that affect the game
    handleInventoryDrop(item, worldPos) {
        if (this.gameScene && this.gameScene.scene.isActive()) {
            this.gameScene.dropItemAtPosition(item, worldPos);
        }
    }

    handleSkillCast(skillId, targetPos) {
        if (this.gameScene && this.gameScene.scene.isActive()) {
            this.gameScene.playerCastSkill(skillId, targetPos);
        }
    }

    handlePotionUse(potionType) {
        if (this.player) {
            if (potionType === 'health') {
                this.player.useHealthPotion();
            } else if (potionType === 'mana') {
                this.player.useManaPotion();
            }
        }
    }

    handleStatPointAllocation(stat) {
        if (this.player) {
            this.player.allocateStatPoint(stat);
            this.uiManager.updateCharacterSheet();
        }
    }

    handleSkillPointAllocation(skillId) {
        if (this.player) {
            this.player.allocateSkillPoint(skillId);
            this.uiManager.updateSkillTree();
        }
    }

    // Portal creation request
    handlePortalCreation() {
        if (this.gameScene && this.gameScene.scene.isActive()) {
            this.gameScene.createTownPortal();
        }
    }

    cleanup() {
        // Remove event listeners
        if (this.gameScene) {
            this.gameScene.events.off('player-created');
            this.gameScene.events.off('world-transition-start');
            this.gameScene.events.off('world-transition-complete');
            this.gameScene.events.off('enemy-hover-start');
            this.gameScene.events.off('enemy-hover-end');
            this.gameScene.events.off('item-pickup');
            this.gameScene.events.off('experience-gained');
            this.gameScene.events.off('level-up');
        }
        
        // Clean up UI manager
        if (this.uiManager) {
            this.uiManager.destroy();
        }
    }

    // Helper methods for scene communication
    getGameScene() {
        return this.gameScene;
    }

    getPlayer() {
        return this.player;
    }

    getUIManager() {
        return this.uiManager;
    }

    // Method to show/hide UI during certain game states
    setUIVisible(visible) {
        if (this.uiManager) {
            this.uiManager.setVisible(visible);
        }
    }

    // Method to update UI after world transition
    refreshUI() {
        if (this.uiManager) {
            this.uiManager.refreshAllPanels();
        }
    }
}