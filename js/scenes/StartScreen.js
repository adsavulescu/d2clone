class StartScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScreen' });
    }
    
    create() {
        // Create dark fantasy background
        this.createBackground();
        
        // Create title and UI elements
        this.createTitle();
        this.createMenu();
        this.createInstructions();
        
        // Setup input handlers
        this.setupInput();
        
        // Add atmospheric effects
        this.createAtmosphericEffects();
    }
    
    createBackground() {
        // Create a dark gradient background
        const graphics = this.add.graphics();
        
        // Create gradient from dark brown to black
        graphics.fillGradientStyle(0x2a1810, 0x2a1810, 0x000000, 0x000000);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add some texture with stone-like pattern
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(2, 8);
            
            graphics.fillStyle(0x1a1a1a, 0.3);
            graphics.fillCircle(x, y, size);
        }
    }
    
    createTitle() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Main title
        this.gameTitle = this.add.text(centerX, centerY - 200, 'DIABLO CHRONICLES', {
            fontSize: '72px',
            fill: '#ff6600',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Subtitle
        this.subtitle = this.add.text(centerX, centerY - 140, 'A Diablo 2 Inspired Action RPG', {
            fontSize: '24px',
            fill: '#cccccc',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add glowing effect to title
        this.tweens.add({
            targets: this.gameTitle,
            alpha: 0.8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createMenu() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Start button
        this.startButton = this.add.text(centerX, centerY - 20, 'START GAME', {
            fontSize: '36px',
            fill: '#ffdd44',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#2a1810',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        // Instructions button
        this.instructionsButton = this.add.text(centerX, centerY + 40, 'INSTRUCTIONS', {
            fontSize: '28px',
            fill: '#cccccc',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#2a1810',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        // Credits
        this.add.text(centerX, this.cameras.main.height - 50, 'Built with Phaser.js • Inspired by Diablo 2', {
            fontSize: '16px',
            fill: '#666666',
            fontFamily: 'serif'
        }).setOrigin(0.5);
        
        // Button hover effects
        this.setupButtonEffects(this.startButton);
        this.setupButtonEffects(this.instructionsButton);
    }
    
    setupButtonEffects(button) {
        button.on('pointerover', () => {
            button.setScale(1.1);
            button.setFill('#ffffff');
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            button.setFill(button === this.startButton ? '#ffdd44' : '#cccccc');
        });
        
        button.on('pointerdown', () => {
            button.setScale(0.95);
        });
        
        button.on('pointerup', () => {
            button.setScale(1.1);
        });
    }
    
    createInstructions() {
        const centerX = this.cameras.main.centerX;
        
        this.instructionsPanel = this.add.container(centerX, this.cameras.main.centerY);
        this.instructionsPanel.setVisible(false);
        
        // Background panel (larger to fit all text)
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x000000, 0.9);
        panelBg.fillRoundedRect(-350, -280, 700, 560, 10);
        panelBg.lineStyle(3, 0x8b4513, 1);
        panelBg.strokeRoundedRect(-350, -280, 700, 560, 10);
        
        // Left column text
        const leftColumnText = `MOVEMENT:
Left Click - Move to location
Hold Left Click - Continuous movement
T - Toggle Walk/Run

COMBAT:
Right Click - Cast spell (default: Fireball)
Q/W/E/R - Use assigned skills
1/2 - Use potions

INTERFACE:
I - Toggle Inventory
C - Toggle Character Sheet
S - Toggle Skills Tree
ESC - Close all panels`;

        // Right column text
        const rightColumnText = `GAMEPLAY:
• Kill enemies to gain experience
• Level up to earn stat points
• Collect and equip better items
• Manage stamina while running
• Explore worlds through portals
• Survive as long as possible!

TIPS:
• Open Character (C) to spend points
• Open Skills (S) to upgrade abilities
• Use potions (1/2) to heal
• Walk to conserve stamina`;

        // Create left column (moved down for padding after title)
        const leftInstructions = this.add.text(-280, -30, leftColumnText, {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'serif',
            align: 'left',
            lineSpacing: 3
        }).setOrigin(0, 0.5);

        // Create right column (moved down for padding after title)
        const rightInstructions = this.add.text(80, -30, rightColumnText, {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'serif',
            align: 'left',
            lineSpacing: 4
        }).setOrigin(0, 0.5);

        // Title
        const title = this.add.text(0, -220, 'CONTROLS & GAMEPLAY', {
            fontSize: '24px',
            fill: '#d4af37',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Close instruction
        const closeText = this.add.text(0, 220, 'Press ESC to close', {
            fontSize: '16px',
            fill: '#ffaa66',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        this.instructionsPanel.add([panelBg, leftInstructions, rightInstructions, title, closeText]);
    }
    
    createAtmosphericEffects() {
        // Add floating particles for atmosphere
        const particles = this.add.particles(0, 0, 'fireball', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height },
            speed: { min: 10, max: 30 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.3, end: 0 },
            lifespan: 8000,
            quantity: 1,
            frequency: 3000,
            blendMode: 'ADD'
        });
        
        particles.setDepth(-1);
    }
    
    setupInput() {
        // Start game button
        this.startButton.on('pointerup', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('Preloader');
            });
        });
        
        // Instructions button
        this.instructionsButton.on('pointerup', () => {
            this.instructionsPanel.setVisible(!this.instructionsPanel.visible);
        });
        
        // ESC key to close instructions
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.instructionsPanel.visible) {
                this.instructionsPanel.setVisible(false);
            }
        });
        
        // Enter key to start game
        this.input.keyboard.on('keydown-ENTER', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('Preloader');
            });
        });
    }
}