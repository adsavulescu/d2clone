class EnergyShield extends Phaser.GameObjects.Sprite {
    constructor(scene, player, absorptionPercent, duration) {
        super(scene, player.x, player.y, 'frost');
        
        scene.add.existing(this);
        
        this.player = player;
        this.absorptionPercent = absorptionPercent; // Percentage of damage absorbed
        this.duration = duration;
        this.startTime = scene.time.now;
        
        this.setAlpha(0.4);
        this.setScale(1.5);
        this.setTint(0x4488ff);
        this.setDepth(player.depth + 1);
        
        // Store original takeDamage method
        this.originalTakeDamage = player.takeDamage.bind(player);
        
        // Override player's takeDamage method
        player.takeDamage = this.shieldedTakeDamage.bind(this);
        
        // Create shield visual effect
        this.createShieldEffect();
        
        // Follow player
        this.followPlayer();
        
        // Auto-destroy after duration
        scene.time.delayedCall(duration, () => {
            this.destroy();
        });
    }
    
    createShieldEffect() {
        // Rotating shield effect
        this.scene.tweens.add({
            targets: this,
            rotation: Math.PI * 2,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Pulsing effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.2,
            scale: 1.3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Shield particles
        this.shieldParticles = this.scene.add.particles(0, 0, 'fireball', {
            tint: 0x4488ff,
            speed: { min: 20, max: 40 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 1,
            frequency: 300,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 40), quantity: 1 }
        });
        
        this.shieldParticles.startFollow(this);
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
    
    shieldedTakeDamage(amount) {
        const currentTime = this.scene.time.now;
        
        // Check if shield is still active
        if (currentTime - this.startTime > this.duration) {
            // Shield expired, use original damage method
            this.originalTakeDamage(amount);
            return;
        }
        
        // Calculate damage absorption
        const absorbedDamage = Math.floor(amount * (this.absorptionPercent / 100));
        const remainingDamage = amount - absorbedDamage;
        
        // Convert absorbed damage to mana cost (2 mana per 1 absorbed damage)
        const manaCost = absorbedDamage * 2;
        
        if (this.player.mana >= manaCost) {
            // Shield absorbs damage, costs mana
            this.player.mana -= manaCost;
            
            // Apply only remaining damage
            if (remainingDamage > 0) {
                this.originalTakeDamage(remainingDamage);
            }
            
            // Shield absorption visual effect
            this.createAbsorptionEffect(absorbedDamage);
        } else {
            // Not enough mana, shield fails - take full damage
            this.originalTakeDamage(amount);
            this.createShieldBreakEffect();
        }
    }
    
    createAbsorptionEffect(absorbedDamage) {
        // Blue flash on shield
        this.scene.tweens.add({
            targets: this,
            alpha: 0.8,
            scale: 1.8,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
        
        // Absorption particles
        const absorptionEffect = this.scene.add.particles(this.x, this.y, 'fireball', {
            tint: 0x88aaff,
            speed: { min: 80, max: 120 },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            quantity: Math.max(3, Math.floor(absorbedDamage / 3))
        });
        
        this.scene.time.delayedCall(200, () => {
            if (absorptionEffect && absorptionEffect.destroy) {
                absorptionEffect.destroy();
            }
        });
    }
    
    createShieldBreakEffect() {
        // Shield breaking visual
        const breakEffect = this.scene.add.particles(this.x, this.y, 'fireball', {
            tint: 0xff4444,
            speed: { min: 100, max: 200 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            quantity: 8
        });
        
        this.scene.time.delayedCall(300, () => {
            if (breakEffect && breakEffect.destroy) {
                breakEffect.destroy();
            }
        });
        
        // Destroy shield early
        this.destroy();
    }
    
    destroy() {
        // Restore original takeDamage method
        if (this.player && this.player.active) {
            this.player.takeDamage = this.originalTakeDamage;
        }
        
        if (this.followTimer) {
            this.followTimer.destroy();
        }
        if (this.shieldParticles) {
            this.shieldParticles.destroy();
        }
        
        super.destroy();
    }
}