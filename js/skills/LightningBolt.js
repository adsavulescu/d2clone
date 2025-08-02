class LightningBolt extends Collidable {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'chainLightning');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        
        // Set collision group and mask
        this.setCollisionGroup(Collidable.Groups.PLAYER_PROJECTILE);
        this.setCollisionMask([
            Collidable.Groups.ENEMY
        ]);
        
        // Setup collision handlers
        this.setupCollisionHandlers();
        
        // Add to collision registry
        if (scene.collisionRegistry) {
            scene.collisionRegistry.addToGroup(this, Collidable.Groups.PLAYER_PROJECTILE);
        }
        this.speed = 800; // Very fast projectile
        this.pierceCount = 0;
        this.maxPierce = 3; // Can hit up to 4 enemies
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        this.setRotation(angle);
        this.setScale(1.2);
        this.setTint(0xffffaa);
        
        // Create lightning trail
        this.createLightningTrail();
        
        // Auto-destroy after 2 seconds
        scene.time.delayedCall(2000, () => {
            this.destroy();
        });
    }
    
    createLightningTrail() {
        this.trail = this.scene.add.particles(0, 0, 'chainLightning', {
            speed: { min: 20, max: 80 },
            scale: { start: 0.8, end: 0 },
            tint: 0xffffaa,
            blendMode: 'ADD',
            lifespan: 150,
            quantity: 1,
            frequency: 50
        });
        
        this.trail.startFollow(this);
    }
    
    hitEnemy(enemy) {
        // Deal damage
        enemy.takeDamage(this.damage);
        
        // Create lightning hit effect
        const lightningHit = this.scene.add.particles(enemy.x, enemy.y, 'chainLightning', {
            tint: 0xffffaa,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            quantity: 5
        });
        
        this.scene.time.delayedCall(200, () => {
            if (lightningHit && lightningHit.destroy) {
                lightningHit.destroy();
            }
        });
        
        // Check if can pierce more enemies
        this.pierceCount++;
        if (this.pierceCount >= this.maxPierce) {
            this.destroy();
        }
    }
    
    setupCollisionHandlers() {
        this.onCollisionEnter = (other, data) => {
            if (data.group === Collidable.Groups.ENEMY) {
                // Check if enemy is still valid before interacting with it
                if (other && other.active && other.takeDamage) {
                    this.hitEnemy(other);
                }
            }
        };
        
        // Handle wall collision separately
        if (this.scene.worldWalls) {
            this.scene.physics.add.collider(this, this.scene.worldWalls, () => {
                this.destroy();
            });
        }
    }
    
    destroy() {
        if (this.trail) {
            this.trail.destroy();
        }
        super.destroy();
    }
}