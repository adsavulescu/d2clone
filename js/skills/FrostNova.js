class FrostNova extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, damage, radius) {
        super(scene, x, y, 'frost');
        
        scene.add.existing(this);
        
        this.setAlpha(0.7);
        this.setScale(0.1);
        
        scene.tweens.add({
            targets: this,
            scale: radius * 2 / 384, // Updated for 3x larger sprite (384px)
            alpha: 0.3,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        const enemies = scene.enemies.getChildren();
        enemies.forEach(enemy => {
            // Check if enemy is still valid before interacting with it
            if (!enemy || !enemy.active || !enemy.scene) {
                return;
            }
            
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (distance <= radius) {
                enemy.takeDamage(damage);
                enemy.freeze(2000);
            }
        });
        
        const particles = scene.add.particles(x, y, 'fireball', {
            tint: 0x88ddff,
            speed: { min: 50, max: 150 },
            scale: { start: 0.4, end: 0 }, // Reduced scale since fireball sprite is 3x larger
            blendMode: 'ADD',
            lifespan: 350,
            quantity: 10,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, radius), quantity: 10 }
        });
        
        scene.time.delayedCall(350, () => {
            particles.destroy();
        });
    }
}