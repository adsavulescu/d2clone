class Teleport extends Phaser.GameObjects.Sprite {
    constructor(scene, player, targetX, targetY) {
        super(scene, player.x, player.y, 'frost');
        
        scene.add.existing(this);
        
        this.player = player;
        this.targetX = targetX;
        this.targetY = targetY;
        
        this.setAlpha(0);
        this.setDepth(200);
        
        // Create teleport effect
        this.performTeleport();
    }
    
    performTeleport() {
        // Store original position for effect
        const startX = this.player.x;
        const startY = this.player.y;
        
        // Create vanish effect at original position
        this.createVanishEffect(startX, startY);
        
        // Clear any existing movement targets when teleporting
        this.scene.playerTarget = null;
        if (this.scene.moveMarker) {
            this.scene.moveMarker.destroy();
            this.scene.moveMarker = null;
        }
        
        // Stop player movement
        this.player.setVelocity(0, 0);
        
        // Teleport delay for dramatic effect
        this.scene.time.delayedCall(200, () => {
            // Actually move the player
            this.player.setPosition(this.targetX, this.targetY);
            
            // Create appear effect at new position
            this.createAppearEffect(this.targetX, this.targetY);
            
            // Make sure player doesn't try to move after teleport
            this.player.setVelocity(0, 0);
            
            // Destroy this teleport effect
            this.scene.time.delayedCall(600, () => {
                this.destroy();
            });
        });
    }
    
    createVanishEffect(x, y) {
        // Blue teleport particles at original position
        const vanishParticles = this.scene.add.particles(x, y, 'frost', {
            tint: 0x4488ff,
            speed: { min: 80, max: 150 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 400,
            quantity: 15,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 20), quantity: 15 }
        });
        
        // Swirling portal effect
        const portalGraphics = this.scene.add.graphics();
        portalGraphics.setPosition(x, y);
        portalGraphics.setDepth(150);
        
        // Animate the portal
        let portalRadius = 5;
        const portalTimer = this.scene.time.addEvent({
            delay: 20,
            repeat: 10,
            callback: () => {
                portalGraphics.clear();
                portalGraphics.lineStyle(3, 0x4488ff, 0.8);
                
                // Draw swirling effect
                for (let i = 0; i < 3; i++) {
                    const angle = (this.scene.time.now / 200) + (i * Math.PI * 2 / 3);
                    const spiralX = Math.cos(angle) * portalRadius;
                    const spiralY = Math.sin(angle) * portalRadius;
                    portalGraphics.strokeCircle(spiralX, spiralY, 8);
                }
                
                portalRadius += 2;
            }
        });
        
        // Clean up vanish effects
        this.scene.time.delayedCall(400, () => {
            if (vanishParticles && vanishParticles.destroy) {
                vanishParticles.destroy();
            }
            if (portalGraphics && portalGraphics.destroy) {
                portalGraphics.destroy();
            }
            if (portalTimer && portalTimer.destroy) {
                portalTimer.destroy();
            }
        });
    }
    
    createAppearEffect(x, y) {
        // Blue teleport particles at new position
        const appearParticles = this.scene.add.particles(x, y, 'frost', {
            tint: 0x88ddff,
            speed: { min: 120, max: 200 },
            scale: { start: 0, end: 0.8 },
            blendMode: 'ADD',
            lifespan: 600,
            quantity: 20,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 30), quantity: 20 }
        });
        
        // Expanding ring effect
        const ringGraphics = this.scene.add.graphics();
        ringGraphics.setPosition(x, y);
        ringGraphics.setDepth(150);
        
        // Animate the ring expansion
        this.scene.tweens.add({
            targets: ringGraphics,
            alpha: 0,
            duration: 600,
            onUpdate: (tween) => {
                const progress = tween.progress;
                const currentRadius = 5 + (40 * progress);
                
                ringGraphics.clear();
                ringGraphics.lineStyle(4, 0x88ddff, 0.8 * (1 - progress));
                ringGraphics.strokeCircle(0, 0, currentRadius);
                
                // Inner ring
                ringGraphics.lineStyle(2, 0xaaffff, 0.6 * (1 - progress));
                ringGraphics.strokeCircle(0, 0, currentRadius * 0.7);
            },
            onComplete: () => {
                ringGraphics.destroy();
            }
        });
        
        // Flash effect on player
        if (this.player) {
            const originalTint = this.player.tint;
            this.player.setTint(0x88ddff);
            
            this.scene.tweens.add({
                targets: this.player,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    this.player.setAlpha(1);
                    this.player.setTint(originalTint);
                }
            });
        }
        
        // Clean up appear effects
        this.scene.time.delayedCall(600, () => {
            if (appearParticles && appearParticles.destroy) {
                appearParticles.destroy();
            }
        });
    }
    
    destroy() {
        super.destroy();
    }
}