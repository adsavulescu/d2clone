class ThunderStorm extends Phaser.GameObjects.Sprite {
    constructor(scene, player, damage, duration, strikeRate) {
        super(scene, player.x, player.y, 'chainLightning');
        
        scene.add.existing(this);
        
        this.player = player;
        this.damage = damage;
        this.duration = duration;
        this.strikeRate = strikeRate;
        this.lastStrike = 0;
        this.range = 400; // Range around player
        
        this.setAlpha(0);
        this.setDepth(-10); // Behind everything
        
        // Create storm visual
        this.createStormEffect();
        
        // Start striking
        this.startStriking();
        
        // Auto-destroy after duration
        scene.time.delayedCall(duration, () => {
            this.destroy();
        });
    }
    
    createStormEffect() {
        // Dark storm clouds overhead
        this.stormClouds = this.scene.add.graphics();
        this.stormClouds.fillStyle(0x333366, 0.3);
        this.stormClouds.fillCircle(0, 0, this.range);
        this.stormClouds.setScrollFactor(0.8); // Parallax effect
        this.stormClouds.setDepth(-5);
        
        // Ambient lightning flashes
        this.ambientTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(500, 1500),
            callback: this.createAmbientFlash,
            callbackScope: this,
            loop: true
        });
    }
    
    createAmbientFlash() {
        // Random lightning flash across screen
        const flashX = this.player.x + Phaser.Math.Between(-this.range, this.range);
        const flashY = this.player.y + Phaser.Math.Between(-this.range, this.range);
        
        const flash = this.scene.add.graphics();
        flash.lineStyle(2, 0xffffaa, 0.8);
        flash.lineBetween(
            flashX, flashY - 200,
            flashX + Phaser.Math.Between(-50, 50), flashY
        );
        flash.setDepth(200);
        
        // Quick flash and fade
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 150,
            onComplete: () => flash.destroy()
        });
        
        // Schedule next flash
        this.ambientTimer.delay = Phaser.Math.Between(500, 1500);
    }
    
    startStriking() {
        this.strikeTimer = this.scene.time.addEvent({
            delay: this.strikeRate,
            callback: this.strikeLightning,
            callbackScope: this,
            loop: true
        });
        
        // Update storm position to follow player
        this.followTimer = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.player && this.player.active) {
                    this.setPosition(this.player.x, this.player.y);
                    if (this.stormClouds) {
                        this.stormClouds.setPosition(this.player.x, this.player.y - 150);
                    }
                }
            },
            loop: true
        });
    }
    
    strikeLightning() {
        // Find enemies within range
        const enemies = this.scene.enemies.getChildren();
        const validTargets = enemies.filter(enemy => {
            if (!enemy || !enemy.active || !enemy.scene) {
                return false;
            }
            
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            return distance <= this.range;
        });
        
        if (validTargets.length === 0) {
            return;
        }
        
        // Strike random enemy
        const target = Phaser.Math.RND.pick(validTargets);
        
        // Create lightning bolt from sky
        const lightning = this.scene.add.graphics();
        lightning.lineStyle(4, 0xffffaa, 1);
        
        // Jagged lightning path
        const startX = target.x + Phaser.Math.Between(-20, 20);
        const startY = target.y - 300;
        const endX = target.x;
        const endY = target.y;
        
        // Create jagged lightning path
        const segments = 5;
        let currentX = startX;
        let currentY = startY;
        
        lightning.beginPath();
        lightning.moveTo(currentX, currentY);
        
        for (let i = 1; i <= segments; i++) {
            const segmentX = startX + ((endX - startX) * (i / segments)) + Phaser.Math.Between(-15, 15);
            const segmentY = startY + ((endY - startY) * (i / segments));
            lightning.lineTo(segmentX, segmentY);
            currentX = segmentX;
            currentY = segmentY;
        }
        
        lightning.strokePath();
        lightning.setDepth(150);
        
        // Lightning strike effect at target
        const strikeEffect = this.scene.add.particles(target.x, target.y, 'chainLightning', {
            tint: 0xffffaa,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            quantity: 8
        });
        
        // Damage the target
        target.takeDamage(this.damage);
        
        // Brief screen flash
        const screenFlash = this.scene.add.graphics();
        screenFlash.fillStyle(0xffffff, 0.1);
        screenFlash.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        screenFlash.setScrollFactor(0);
        screenFlash.setDepth(1000);
        
        // Clean up effects
        this.scene.time.delayedCall(300, () => {
            if (lightning && lightning.destroy) lightning.destroy();
            if (strikeEffect && strikeEffect.destroy) strikeEffect.destroy();
            if (screenFlash && screenFlash.destroy) screenFlash.destroy();
        });
    }
    
    destroy() {
        if (this.strikeTimer) {
            this.strikeTimer.destroy();
        }
        if (this.followTimer) {
            this.followTimer.destroy();
        }
        if (this.ambientTimer) {
            this.ambientTimer.destroy();
        }
        if (this.stormClouds) {
            this.stormClouds.destroy();
        }
        
        super.destroy();
    }
}