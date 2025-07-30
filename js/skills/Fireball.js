class Fireball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'fireball');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.speed = 400;
        
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
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            quantity: 1,
            frequency: 100
        });
        
        particles.startFollow(this);
        
        this.particles = particles;
        
        scene.physics.add.overlap(this, scene.enemies, (fireball, enemy) => {
            enemy.takeDamage(this.damage);
            this.explode();
        });
    }
    
    explode() {
        const explosion = this.scene.add.particles(this.x, this.y, 'fireball', {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            quantity: 6
        });
        
        this.scene.time.delayedCall(200, () => {
            explosion.destroy();
        });
        
        this.destroy();
    }
    
    destroy() {
        if (this.particles) {
            this.particles.destroy();
        }
        super.destroy();
    }
}