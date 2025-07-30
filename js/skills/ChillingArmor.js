class ChillingArmor extends Phaser.GameObjects.Sprite {
    constructor(scene, player, chillDamage, chillDuration, armorDuration) {
        super(scene, player.x, player.y, 'frost');
        
        scene.add.existing(this);
        
        this.player = player;
        this.chillDamage = chillDamage;
        this.chillDuration = chillDuration;
        this.armorDuration = armorDuration;
        this.chillRadius = 80;
        
        this.setAlpha(0.5);
        this.setScale(0.4); // Reduced scale since frost sprite is 3x larger
        this.setTint(0x88ddff);
        this.setDepth(player.depth - 1);
        
        // Store original takeDamage method
        this.originalTakeDamage = player.takeDamage.bind(player);
        
        // Override player's takeDamage method
        player.takeDamage = this.armoredTakeDamage.bind(this);
        
        // Create armor visual effect
        this.createArmorEffect();
        
        // Follow player
        this.followPlayer();
        
        // Auto-destroy after duration
        scene.time.delayedCall(armorDuration, () => {
            this.destroy();
        });
    }
    
    createArmorEffect() {
        // Icy armor glow
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            scale: 0.47, // Reduced scale since frost sprite is 3x larger
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Frost particles around player
        this.frostParticles = this.scene.add.particles(0, 0, 'fireball', {
            tint: 0x88ddff,
            speed: { min: 10, max: 30 },
            scale: { start: 0.15, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 1500,
            quantity: 1,
            frequency: 200,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 35), quantity: 1 }
        });
        
        this.frostParticles.startFollow(this);
    }
    
    followPlayer() {
        this.followTimer = this.scene.time.addEvent({
            delay: 16, // ~60 FPS
            callback: () => {
                if (this.player && this.player.active) {
                    this.setPosition(this.player.x, this.player.y);
                }
            },
            loop: true
        });
    }
    
    armoredTakeDamage(amount) {
        // Apply damage normally
        this.originalTakeDamage(amount);
        
        // Trigger chilling retaliation
        this.chillAttackers();
        
        // Create retaliation visual effect
        this.createRetaliationEffect();
    }
    
    chillAttackers() {
        // Find all enemies within chill radius
        const enemies = this.scene.enemies.getChildren();
        
        enemies.forEach(enemy => {
            if (!enemy || !enemy.active || !enemy.scene) {
                return;
            }
            
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (distance <= this.chillRadius) {
                // Damage and freeze nearby enemies
                enemy.takeDamage(this.chillDamage);
                enemy.freeze(this.chillDuration);
                
                // Individual enemy chill effect
                const enemyChillEffect = this.scene.add.particles(enemy.x, enemy.y, 'fireball', {
                    tint: 0x88ddff,
                    speed: { min: 30, max: 60 },
                    scale: { start: 0.3, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 400,
                    quantity: 3
                });
                
                this.scene.time.delayedCall(400, () => {
                    if (enemyChillEffect && enemyChillEffect.destroy) {
                        enemyChillEffect.destroy();
                    }
                });
            }
        });
    }
    
    createRetaliationEffect() {
        // Expanding ice burst from player
        const iceBurst = this.scene.add.graphics();
        iceBurst.lineStyle(3, 0x88ddff, 0.8);
        iceBurst.strokeCircle(this.player.x, this.player.y, 10);
        iceBurst.setDepth(100);
        
        // Expand the burst
        this.scene.tweens.add({
            targets: iceBurst,
            alpha: 0,
            duration: 600,
            onUpdate: (tween) => {
                const progress = tween.progress;
                const currentRadius = 10 + (this.chillRadius * progress);
                iceBurst.clear();
                iceBurst.lineStyle(3, 0x88ddff, 0.8 * (1 - progress));
                iceBurst.strokeCircle(this.player.x, this.player.y, currentRadius);
            },
            onComplete: () => {
                iceBurst.destroy();
            }
        });
        
        // Frost nova particles
        const retaliationParticles = this.scene.add.particles(this.player.x, this.player.y, 'fireball', {
            tint: 0x88ddff,
            speed: { min: 80, max: 120 },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            quantity: 8,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, this.chillRadius), quantity: 8 }
        });
        
        this.scene.time.delayedCall(600, () => {
            if (retaliationParticles && retaliationParticles.destroy) {
                retaliationParticles.destroy();
            }
        });
    }
    
    destroy() {
        // Restore original takeDamage method
        if (this.player && this.player.active) {
            this.player.takeDamage = this.originalTakeDamage;
        }
        
        if (this.followTimer) {
            this.followTimer.destroy();
        }
        if (this.frostParticles) {
            this.frostParticles.destroy();
        }
        
        super.destroy();
    }
}