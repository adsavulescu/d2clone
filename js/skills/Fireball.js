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
        
        scene.time.delayedCall(3000, () => {
            this.destroy();
        });
        
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
        
        this.destroy();
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
    
    destroy() {
        if (this.particles) {
            this.particles.destroy();
        }
        super.destroy();
    }
}