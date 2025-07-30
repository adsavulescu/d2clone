class IceBolt extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY, damage, accuracy) {
        super(scene, x, y, 'iceBolt');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.speed = 300;
        this.accuracy = accuracy;
        
        // Scale down the ice bolt sprite since it's 3x larger
        this.setScale(0.5);
        
        // Apply accuracy - higher dexterity means better accuracy
        const accuracyFactor = Math.min(accuracy / 100, 1.0); // Cap at 100% accuracy
        const maxDeviation = (1 - accuracyFactor) * 50; // Max 50 pixel deviation at 0 accuracy
        
        const deviationX = (Math.random() - 0.5) * maxDeviation * 2;
        const deviationY = (Math.random() - 0.5) * maxDeviation * 2;
        
        const adjustedTargetX = targetX + deviationX;
        const adjustedTargetY = targetY + deviationY;
        
        const angle = Phaser.Math.Angle.Between(x, y, adjustedTargetX, adjustedTargetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        this.setRotation(angle);
        
        // Auto-destroy after 4 seconds
        scene.time.delayedCall(4000, () => {
            this.destroy();
        });
        
        // Ice trail particles
        const trail = scene.add.particles(0, 0, 'frost', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.1, end: 0 }, // Reduced scale since frost sprite is 3x larger
            tint: 0xccffff,
            lifespan: 300,
            quantity: 1,
            frequency: 80
        });
        
        trail.startFollow(this);
        this.trail = trail;
        
        // Collision with enemies
        scene.physics.add.overlap(this, scene.enemies, (bolt, enemy) => {
            // Check if enemy is still valid before interacting with it
            if (!enemy || !enemy.active || !enemy.scene) {
                return;
            }
            
            enemy.takeDamage(this.damage);
            enemy.freeze(1500); // Shorter freeze than Frost Nova
            this.shatter();
        });
        
        // Add wall collision
        if (scene.worldWalls) {
            scene.physics.add.collider(this, scene.worldWalls, () => {
                this.shatter();
            });
        }
    }
    
    shatter() {
        // Ice shatter effect
        const shatter = this.scene.add.particles(this.x, this.y, 'frost', {
            speed: { min: 80, max: 150 },
            scale: { start: 0.5, end: 0 },
            tint: 0xaaffff,
            lifespan: 250,
            quantity: 6
        });
        
        this.scene.time.delayedCall(250, () => {
            shatter.destroy();
        });
        
        this.destroy();
    }
    
    destroy() {
        if (this.trail) {
            this.trail.destroy();
        }
        super.destroy();
    }
}