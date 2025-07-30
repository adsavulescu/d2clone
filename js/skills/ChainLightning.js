class ChainLightning extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, targets, damage, chains) {
        super(scene, x, y, 'chainLightning');
        
        scene.add.existing(this);
        
        this.damage = damage;
        this.chains = chains;
        this.hitTargets = new Set();
        
        this.setAlpha(0);
        this.setDepth(100);
        
        this.chainTargets(x, y, targets, 0);
    }
    
    chainTargets(startX, startY, availableTargets, chainCount) {
        if (chainCount >= this.chains || availableTargets.length === 0) {
            this.scene.time.delayedCall(500, () => {
                this.destroy();
            });
            return;
        }
        
        // Find closest unhit target
        let closestTarget = null;
        let closestDistance = Infinity;
        
        availableTargets.forEach(target => {
            if (!this.hitTargets.has(target)) {
                const distance = Phaser.Math.Distance.Between(startX, startY, target.x, target.y);
                if (distance < 200 && distance < closestDistance) {
                    closestDistance = distance;
                    closestTarget = target;
                }
            }
        });
        
        if (closestTarget) {
            this.hitTargets.add(closestTarget);
            
            // Create lightning bolt visual effect
            const lightning = this.scene.add.graphics();
            lightning.lineStyle(3, 0x88ddff, 1);
            lightning.lineBetween(startX, startY, closestTarget.x, closestTarget.y);
            lightning.setDepth(100);
            
            // Add crackling effect - optimized
            const crackle = this.scene.add.particles(closestTarget.x, closestTarget.y, 'fireball', {
                tint: 0xaaffff,
                speed: { min: 80, max: 120 },
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD',
                lifespan: 120,
                quantity: 3
            });
            
            // Damage the target
            closestTarget.takeDamage(this.damage);
            
            // Remove visual after short time
            this.scene.time.delayedCall(120, () => {
                lightning.destroy();
                crackle.destroy();
            });
            
            // Chain to next target after delay
            this.scene.time.delayedCall(100, () => {
                this.chainTargets(closestTarget.x, closestTarget.y, availableTargets, chainCount + 1);
            });
        } else {
            // No more valid targets, end chain
            this.scene.time.delayedCall(500, () => {
                this.destroy();
            });
        }
    }
}