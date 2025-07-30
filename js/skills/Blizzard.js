class Blizzard extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, targetX, targetY, damage, duration, radius) {
        super(scene, x, y, 'frost');
        
        scene.add.existing(this);
        
        this.damage = damage;
        this.duration = duration;
        this.radius = radius;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damageInterval = 200; // Damage every 200ms
        this.lastDamage = 0;
        
        this.setAlpha(0.6);
        this.setScale(0.1);
        this.setDepth(50);
        this.setPosition(targetX, targetY);
        
        // Create blizzard visual effect
        this.createBlizzardEffect();
        
        // Start the blizzard
        this.startBlizzard();
        
        // Auto-destroy after duration
        scene.time.delayedCall(duration, () => {
            this.destroy();
        });
    }
    
    createBlizzardEffect() {
        // Growing circle effect
        this.scene.tweens.add({
            targets: this,
            scale: this.radius * 2 / 128,
            duration: 500,
            ease: 'Power2'
        });
        
        // Continuous ice particles falling from above
        this.particles = this.scene.add.particles(this.targetX, this.targetY - 100, 'fireball', {
            tint: 0xaaeeff,
            speedY: { min: 100, max: 200 },
            speedX: { min: -50, max: 50 },
            scale: { start: 0.3, end: 0.1 },
            alpha: { start: 0.8, end: 0.2 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 3,
            frequency: 100,
            emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, this.radius) }
        });
    }
    
    startBlizzard() {
        this.blizzardTimer = this.scene.time.addEvent({
            delay: this.damageInterval,
            callback: this.dealDamage,
            callbackScope: this,
            loop: true
        });
    }
    
    dealDamage() {
        const enemies = this.scene.enemies.getChildren();
        enemies.forEach(enemy => {
            if (!enemy || !enemy.active || !enemy.scene) {
                return;
            }
            
            const distance = Phaser.Math.Distance.Between(this.targetX, this.targetY, enemy.x, enemy.y);
            if (distance <= this.radius) {
                enemy.takeDamage(this.damage * 0.3); // 30% of full damage per tick
                enemy.freeze(500); // Brief freeze each tick
                
                // Ice damage visual
                const iceHit = this.scene.add.particles(enemy.x, enemy.y, 'fireball', {
                    tint: 0x88ddff,
                    speed: { min: 30, max: 60 },
                    scale: { start: 0.2, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 200,
                    quantity: 2
                });
                
                this.scene.time.delayedCall(200, () => {
                    if (iceHit && iceHit.destroy) {
                        iceHit.destroy();
                    }
                });
            }
        });
    }
    
    destroy() {
        if (this.blizzardTimer) {
            this.blizzardTimer.destroy();
        }
        if (this.particles) {
            this.particles.destroy();
        }
        super.destroy();
    }
}