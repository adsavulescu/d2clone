class EndGameScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'EndGameScreen' });
    }
    
    init(data) {
        // Receive data from GameScene about the player's final stats
        this.playerData = data || {
            level: 1,
            experience: 0,
            worldLevel: 1,
            enemiesKilled: 0,
            itemsCollected: 0,
            playTime: 0
        };
    }
    
    create() {
        // Create dark background
        this.createBackground();
        
        // Create game over UI
        this.createGameOverTitle();
        this.createStatsDisplay();
        this.createMenu();
        
        // Setup input handlers
        this.setupInput();
        
        // Add atmospheric effects
        this.createDeathEffects();
        
    }
    
    createBackground() {
        // Create a dark, ominous background
        const graphics = this.add.graphics();
        
        // Dark red to black gradient (death theme)
        graphics.fillGradientStyle(0x4a0000, 0x4a0000, 0x000000, 0x000000);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add some darker texture
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 4);
            
            graphics.fillStyle(0x000000, 0.5);
            graphics.fillCircle(x, y, size);
        }
        
        // Add red vignette effect
        const vignette = this.add.graphics();
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const maxRadius = Math.max(this.cameras.main.width, this.cameras.main.height);
        
        vignette.fillGradientStyle(0x000000, 0x000000, 0x660000, 0x660000, 0.8);
        vignette.fillCircle(centerX, centerY, maxRadius);
        vignette.setBlendMode('MULTIPLY');
    }
    
    createGameOverTitle() {
        const centerX = this.cameras.main.centerX;
        
        // Main game over text
        this.gameOverTitle = this.add.text(centerX, 150, 'YOU HAVE DIED', {
            fontSize: '64px',
            fill: '#ff0000',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Subtitle
        this.subtitle = this.add.text(centerX, 210, 'Your journey ends here, but legends never die...', {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'serif',
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Flickering effect for dramatic impact
        this.tweens.add({
            targets: this.gameOverTitle,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createStatsDisplay() {
        const centerX = this.cameras.main.centerX;
        const startY = 280;
        
        // Stats panel background
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x000000, 0.8);
        panelBg.fillRoundedRect(centerX - 250, startY - 20, 500, 250, 10);
        panelBg.lineStyle(3, 0x8b4513, 1);
        panelBg.strokeRoundedRect(centerX - 250, startY - 20, 500, 250, 10);
        
        // Stats title
        this.add.text(centerX, startY + 10, 'FINAL STATISTICS', {
            fontSize: '24px',
            fill: '#ffdd44',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Format play time
        const playTimeText = this.formatPlayTime(this.playerData.playTime);
        
        // Stats display
        const statsText = `Level Reached: ${this.playerData.level}
Total Experience: ${this.playerData.experience.toLocaleString()}
Worlds Explored: ${this.playerData.worldLevel}
Enemies Slain: ${this.playerData.enemiesKilled}
Items Collected: ${this.playerData.itemsCollected}
Time Survived: ${playTimeText}`;
        
        this.add.text(centerX, startY + 80, statsText, {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'monospace',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);
        
        // Calculate and display score
        const score = this.calculateScore();
        this.add.text(centerX, startY + 180, `FINAL SCORE: ${score.toLocaleString()}`, {
            fontSize: '22px',
            fill: '#00ff00',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }
    
    createMenu() {
        const centerX = this.cameras.main.centerX;
        const startY = 600;
        
        // Restart button
        this.restartButton = this.add.text(centerX - 100, startY, 'PLAY AGAIN', {
            fontSize: '28px',
            fill: '#ffdd44',
            fontWeight: 'bold',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#2a1810',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        // Main menu button
        this.mainMenuButton = this.add.text(centerX + 100, startY, 'MAIN MENU', {
            fontSize: '28px',
            fill: '#cccccc',
            fontFamily: 'serif',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#2a1810',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        // Setup button effects
        this.setupButtonEffects(this.restartButton);
        this.setupButtonEffects(this.mainMenuButton);
        
        // Instructions
        this.add.text(centerX, startY + 80, 'Press R to restart or M for main menu', {
            fontSize: '16px',
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
            button.setFill(button === this.restartButton ? '#ffdd44' : '#cccccc');
        });
        
        button.on('pointerdown', () => {
            button.setScale(0.95);
        });
        
        button.on('pointerup', () => {
            button.setScale(1.1);
        });
    }
    
    createDeathEffects() {
        // Add blood-red particles falling from top
        const particles = this.add.particles(0, 0, 'fireball', {
            x: { min: 0, max: this.cameras.main.width },
            y: -50,
            speedY: { min: 20, max: 60 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.3, end: 0.1 },
            alpha: { start: 0.6, end: 0 },
            tint: 0x660000,
            lifespan: 5000,
            quantity: 2,
            frequency: 500,
            blendMode: 'ADD'
        });
        
        particles.setDepth(-1);
    }
    
    setupInput() {
        // Restart button
        this.restartButton.on('pointerup', () => {
            this.restartGame();
        });
        
        // Main menu button
        this.mainMenuButton.on('pointerup', () => {
            this.goToMainMenu();
        });
        
        // Keyboard shortcuts
        this.input.keyboard.on('keydown-R', () => {
            this.restartGame();
        });
        
        this.input.keyboard.on('keydown-M', () => {
            this.goToMainMenu();
        });
        
        this.input.keyboard.on('keydown-ENTER', () => {
            this.restartGame();
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.goToMainMenu();
        });
    }
    
    restartGame() {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('Preloader');
        });
    }
    
    goToMainMenu() {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('StartScreen');
        });
    }
    
    formatPlayTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    calculateScore() {
        // Calculate score based on various factors
        const levelBonus = this.playerData.level * 1000;
        const expBonus = Math.floor(this.playerData.experience / 10);
        const worldBonus = this.playerData.worldLevel * 2000;
        const enemyBonus = this.playerData.enemiesKilled * 100;
        const itemBonus = this.playerData.itemsCollected * 50;
        const timeBonus = Math.floor(this.playerData.playTime / 1000) * 10; // 10 points per second survived
        
        return levelBonus + expBonus + worldBonus + enemyBonus + itemBonus + timeBonus;
    }
    
}