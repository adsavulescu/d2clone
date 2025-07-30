class Meteor extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, targetX, targetY, damage, impact) {
        super(scene, x, y, 'meteor');
        
        scene.add.existing(this);
        
        this.damage = damage;
        this.impact = impact; // Strength-based impact area
        this.targetX = targetX;
        this.targetY = targetY;
        this.fallDuration = 1500; // 1.5 seconds fall time
        
        // Set initial position high above target
        this.setPosition(targetX, targetY - 400);
        this.setScale(0.5);
        this.setAlpha(0.8);
        this.setDepth(1000);
        
        // Create targeting indicator on ground
        this.targetIndicator = scene.add.graphics();
        this.targetIndicator.fillStyle(0xff6600, 0.3);
        this.targetIndicator.fillCircle(targetX, targetY, this.impact);
        this.targetIndicator.lineStyle(2, 0xff6600, 0.8);
        this.targetIndicator.strokeCircle(targetX, targetY, this.impact);
        this.targetIndicator.setDepth(5);
        
        // Animate targeting indicator
        scene.tweens.add({
            targets: this.targetIndicator,
            alpha: 0.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Create falling meteor animation
        scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: this.fallDuration,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.explodeOnImpact();
            }
        });
        
        // Fire trail particles during fall
        const fireTrail = scene.add.particles(0, 0, 'fireball', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.6, end: 0 },
            tint: [0xff6600, 0xff3300, 0xffaa00],
            lifespan: 400,
            quantity: 2,
            frequency: 80
        });
        
        fireTrail.startFollow(this);
        this.fireTrail = fireTrail;
    }
    
    explodeOnImpact() {
        // Remove targeting indicator
        if (this.targetIndicator) {
            this.targetIndicator.destroy();
        }
        
        // Stop fire trail
        if (this.fireTrail) {
            this.fireTrail.destroy();
        }
        
        // Create massive explosion effect
        const explosion = this.scene.add.particles(this.targetX, this.targetY, 'fireball', {
            speed: { min: 100, max: 300 },
            scale: { start: 1.2, end: 0 },
            tint: [0xff6600, 0xff3300, 0xffaa00, 0xff0000],
            blendMode: 'ADD',
            lifespan: 600,
            quantity: 15
        });
        
        // Screen shake effect based on impact (strength) - much more moderate
        const shakeIntensity = Math.min(0.02, this.impact * 0.0002);
        this.scene.cameras.main.shake(200, shakeIntensity);
        
        // Damage all enemies in impact radius
        this.scene.enemies.getChildren().forEach(enemy => {
            // Check if enemy is still valid before interacting with it
            if (!enemy || !enemy.active || !enemy.scene) {
                return;
            }
            
            const distance = Phaser.Math.Distance.Between(this.targetX, this.targetY, enemy.x, enemy.y);
            if (distance <= this.impact) {
                // Damage decreases with distance from center
                const distanceFactor = 1 - (distance / this.impact);
                const adjustedDamage = Math.floor(this.damage * (0.5 + distanceFactor * 0.5));
                enemy.takeDamage(adjustedDamage);
                
                // Knockback effect
                const angle = Phaser.Math.Angle.Between(this.targetX, this.targetY, enemy.x, enemy.y);
                const knockbackForce = this.impact * 2;
                enemy.setVelocity(
                    Math.cos(angle) * knockbackForce,
                    Math.sin(angle) * knockbackForce
                );
            }
        });
        
        // Create burn effect on ground
        const burnMark = this.scene.add.graphics();
        burnMark.fillStyle(0x331100, 0.6);
        burnMark.fillCircle(this.targetX, this.targetY, this.impact * 0.8);
        burnMark.setDepth(1);
        
        // Fade out burn mark over time
        this.scene.tweens.add({
            targets: burnMark,
            alpha: 0,
            duration: 10000,
            onComplete: () => {
                burnMark.destroy();
            }
        });
        
        // Clean up explosion particles
        this.scene.time.delayedCall(600, () => {
            explosion.destroy();
        });
        
        this.destroy();
    }
    
    destroy() {
        if (this.targetIndicator) {
            this.targetIndicator.destroy();
        }
        if (this.fireTrail) {
            this.fireTrail.destroy();
        }
        super.destroy();
    }
}