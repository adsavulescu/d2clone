class Fireball extends Collidable {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'fireball');
        
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
        this.speed = 400;
        
        // Scale down the fireball sprite since it's 3x larger
        this.setScale(0.5);
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        this.setRotation(angle);
        
        // Store destroy timer for cleanup
        this.destroyTimer = scene.time.delayedCall(3000, () => {
            if (this.scene && this.scene.poolManager) {
                this.scene.poolManager.despawnProjectile(this);
            } else {
                this.destroy();
            }
        });
        
        // Only create particles if they don't exist (first time creation)
        if (!this.particles) {
            const particles = scene.add.particles(0, 0, 'fireball', {
                speed: { min: 50, max: 150 },
                scale: { start: 0.3, end: 0 }, // Reduced scale since fireball sprite is 3x larger
                blendMode: 'ADD',
                lifespan: 300,
                quantity: 1,
                frequency: 100
            });
            
            particles.startFollow(this);
            this.particles = particles;
        } else {
            // Restart particles if reusing from pool
            this.particles.startFollow(this);
            this.particles.start();
        }
    }
    
    explode() {
        const explosion = this.scene.add.particles(this.x, this.y, 'fireball', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 }, // Reduced scale since fireball sprite is 3x larger
            blendMode: 'ADD',
            lifespan: 200,
            quantity: 6
        });
        
        this.scene.time.delayedCall(200, () => {
            explosion.destroy();
        });
        
        // Use pool manager if available
        if (this.scene && this.scene.poolManager) {
            this.scene.poolManager.despawnProjectile(this);
        } else {
            this.destroy();
        }
    }
    
    setupCollisionHandlers() {
        this.onCollisionEnter = (other, data) => {
            if (data.group === Collidable.Groups.ENEMY) {
                // Check if enemy is still valid before interacting with it
                if (other && other.active && other.takeDamage) {
                    other.takeDamage(this.damage);
                }
                this.explode();
            }
        };
        
        // Handle wall collision separately
        if (this.scene.worldWalls) {
            this.scene.physics.add.collider(this, this.scene.worldWalls, () => {
                this.explode();
            });
        }
        
        // Emit collision event
        const eventBus = CollisionEventBus.getInstance();
        this.on('destroy', () => {
            eventBus.emit(CollisionEventBus.Events.PROJECTILE_ENEMY, {
                projectile: this,
                type: 'projectile_destroyed'
            });
        });
    }
    
    // Reset method for object pooling
    reset(x, y, targetX, targetY, damage) {
        // Reset position and movement
        this.setPosition(x, y);
        this.damage = damage;
        
        // Recalculate velocity
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        this.setRotation(angle);
        
        // Clear any existing timer
        if (this.destroyTimer) {
            this.destroyTimer.remove();
            this.destroyTimer = null;
        }
        
        // Set new destroy timer
        this.destroyTimer = this.scene.time.delayedCall(3000, () => {
            if (this.scene && this.scene.poolManager) {
                this.scene.poolManager.despawnProjectile(this);
            } else {
                this.destroy();
            }
        });
        
        // Re-enable
        this.setActive(true);
        this.setVisible(true);
        
        // Restart particle effect
        if (this.particles) {
            this.particles.startFollow(this);
            this.particles.start();
        }
    }
    
    destroy() {
        // Stop particles but don't destroy if we're pooling
        if (this.particles) {
            this.particles.stop();
            this.particles.stopFollow();
            
            // Only destroy particles if this is a real destroy (not pooling)
            if (!this.scene || !this.scene.poolManager) {
                this.particles.destroy();
                this.particles = null;
            }
        }
        
        if (this.destroyTimer) {
            this.destroyTimer.remove();
            this.destroyTimer = null;
        }
        
        super.destroy();
    }
}