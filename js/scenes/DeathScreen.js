class DeathScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'DeathScreen' });
    }

    init(data) {
        // Receive data about XP loss and current stats
        this.playerData = data || {
            level: 1,
            experienceLost: 0,
            currentExperience: 0,
            worldLevel: 1
        };
    }

    create() {
        // Create dark overlay background
        this.createBackground();
        
        // Create death message and UI
        this.createDeathUI();
        
        // Setup input handlers
        this.setupInput();
        
        // Fade in the death screen smoothly
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    createBackground() {
        // Dark red overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add some red tint for death atmosphere
        const redTint = this.add.graphics();
        redTint.fillStyle(0x660000, 0.3);
        redTint.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    }

    createDeathUI() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Death title
        const deathTitle = this.add.text(centerX, centerY - 150, 'YOU HAVE DIED', {
            fontSize: '48px',
            fill: '#ff4444',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        // Experience penalty message with safety checks
        let penaltyText = '';
        const safeExperienceLost = this.playerData.experienceLost || 0;
        if (safeExperienceLost > 0) {
            penaltyText = `You have lost ${safeExperienceLost.toLocaleString()} experience.`;
        } else {
            penaltyText = 'Fortunately, you lost no experience this time.';
        }

        const penaltyMessage = this.add.text(centerX, centerY - 50, penaltyText, {
            fontSize: '18px',
            fill: '#ffaaaa',
            fontFamily: 'serif',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Current status with safety checks
        const safeLevel = this.playerData.level || 1;
        const safeExperience = this.playerData.currentExperience || 0;
        const safeWorldLevel = this.playerData.worldLevel || 1;
        
        const statusText = `Level: ${safeLevel}\nExperience: ${safeExperience.toLocaleString()}\nWorld: ${safeWorldLevel}`;
        
        const statusDisplay = this.add.text(centerX, centerY + 20, statusText, {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'serif',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);

        // Return to town button
        this.returnButton = this.add.text(centerX, centerY + 120, 'RETURN TO TOWN', {
            fontSize: '24px',
            fill: '#ffdd44',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#4a3020',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        // Button hover effects
        this.setupButtonEffects(this.returnButton);

        // Instructions
        const instructions = this.add.text(centerX, centerY + 180, 'Press ENTER or click to return to town', {
            fontSize: '14px',
            fill: '#888888',
            fontFamily: 'serif'
        }).setOrigin(0.5);
    }

    setupButtonEffects(button) {
        button.on('pointerover', () => {
            button.setScale(1.1);
            button.setFill('#ffffff');
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            button.setFill('#ffdd44');
        });
        
        button.on('pointerdown', () => {
            button.setScale(0.95);
        });
        
        button.on('pointerup', () => {
            button.setScale(1.1);
            this.returnToTown();
        });
    }

    setupInput() {
        // Enter key to return to town
        this.input.keyboard.on('keydown-ENTER', () => {
            this.returnToTown();
        });
    }

    returnToTown() {
        // Fade out and return to game scene
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.time.delayedCall(800, () => {
            // Resume the GameScene instead of restarting it
            this.scene.resume('GameScene');
            this.scene.stop('DeathScreen');
            
            // Get the GameScene instance and respawn player
            const gameScene = this.scene.get('GameScene');
            if (gameScene && gameScene.player) {
                gameScene.respawnPlayer();
            }
        });
    }
}