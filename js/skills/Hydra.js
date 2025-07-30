class Hydra extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, damage, duration, fireRate) {
        super(scene, x, y, 'fireball');
        
        scene.add.existing(this);
        
        this.damage = damage;
        this.duration = duration;
        this.fireRate = fireRate;
        this.lastShot = 0;
        this.range = 250;
        
        this.setScale(2);
        this.setTint(0xff4400);
        this.setDepth(10);
        this.setPosition(x, y);
        
        // Create hydra visual
        this.createHydraVisual();
        
        // Start attacking
        this.startAttacking();
        
        // Auto-destroy after duration
        scene.time.delayedCall(duration, () => {
            this.destroy();
        });
    }
    
    createHydraVisual() {
        // Hide the default sprite
        this.setVisible(false);
        
        // Create custom hydra graphics
        this.hydraGraphics = this.scene.add.graphics();
        this.hydraGraphics.setPosition(this.x, this.y);
        this.hydraGraphics.setDepth(10);
        
        // Draw hydra body and heads
        this.drawHydraShape();
        
        // Animate the hydra
        this.animateHydra();
        
        // Continuous fire particles from heads
        this.createHeadParticles();
    }
    
    drawHydraShape() {
        this.hydraGraphics.clear();
        
        // Hydra body (large oval base)
        this.hydraGraphics.fillStyle(0x663300, 1); // Dark brown body
        this.hydraGraphics.fillEllipse(0, 10, 40, 30);
        
        // Body scales/texture
        this.hydraGraphics.fillStyle(0x884400, 0.8);
        this.hydraGraphics.fillEllipse(-8, 8, 12, 8);
        this.hydraGraphics.fillEllipse(8, 12, 10, 6);
        this.hydraGraphics.fillEllipse(0, 15, 14, 10);
        
        // Three hydra heads on long necks
        const headPositions = [
            { x: -15, y: -20, angle: -0.3 }, // Left head
            { x: 0, y: -25, angle: 0 },      // Center head  
            { x: 15, y: -20, angle: 0.3 }    // Right head
        ];
        
        headPositions.forEach((head, index) => {
            // Draw neck
            this.hydraGraphics.lineStyle(6, 0x554400, 1);
            this.hydraGraphics.lineBetween(0, 0, head.x, head.y);
            
            // Draw head (dragon-like)
            this.hydraGraphics.fillStyle(0x774400, 1);
            this.hydraGraphics.fillEllipse(head.x, head.y, 16, 12);
            
            // Head details
            this.hydraGraphics.fillStyle(0x995500, 1);
            this.hydraGraphics.fillEllipse(head.x - 2, head.y - 2, 10, 8);
            
            // Eyes (glowing red)
            this.hydraGraphics.fillStyle(0xff0000, 1);
            this.hydraGraphics.fillCircle(head.x - 4, head.y - 2, 2);
            this.hydraGraphics.fillCircle(head.x + 4, head.y - 2, 2);
            
            // Nostril/snout
            this.hydraGraphics.fillStyle(0x442200, 1);
            this.hydraGraphics.fillEllipse(head.x, head.y + 3, 8, 4);
            
            // Small horns/spikes
            this.hydraGraphics.fillStyle(0x332211, 1);
            this.hydraGraphics.fillTriangle(
                head.x - 6, head.y - 6,
                head.x - 8, head.y - 10,
                head.x - 4, head.y - 8
            );
            this.hydraGraphics.fillTriangle(
                head.x + 6, head.y - 6,
                head.x + 8, head.y - 10,
                head.x + 4, head.y - 8
            );
        });
        
        // Store head positions for particle effects
        this.headPositions = headPositions;
    }
    
    animateHydra() {
        // Subtle breathing/pulsing animation
        this.scene.tweens.add({
            targets: this.hydraGraphics,
            scaleX: 1.1,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Head swaying animation
        this.headSwayTimer = this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                this.redrawWithHeadSway();
            },
            loop: true
        });
    }
    
    redrawWithHeadSway() {
        // Randomly adjust head positions slightly for natural movement
        if (this.headPositions) {
            this.headPositions.forEach(head => {
                head.x += Phaser.Math.Between(-3, 3);
                head.y += Phaser.Math.Between(-2, 2);
                head.angle += Phaser.Math.FloatBetween(-0.1, 0.1);
            });
            this.drawHydraShape();
        }
    }
    
    createHeadParticles() {
        // Create particles for each head
        this.headParticles = [];
        
        if (this.headPositions) {
            this.headPositions.forEach((head, index) => {
                const particles = this.scene.add.particles(this.x + head.x, this.y + head.y, 'fireball', {
                    tint: [0xff0000, 0xff4400, 0xff8800],
                    speed: { min: 20, max: 50 },
                    scale: { start: 0.2, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 600,
                    quantity: 1,
                    frequency: 300 + (index * 100), // Stagger the particle timing
                    emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 6), quantity: 1 }
                });
                
                this.headParticles.push(particles);
            });
        }
    
    startAttacking() {
        this.attackTimer = this.scene.time.addEvent({
            delay: this.fireRate,
            callback: this.attack,
            callbackScope: this,
            loop: true
        });
    }
    
    attack() {
        // Find closest enemy within range
        const enemies = this.scene.enemies.getChildren();
        let closestEnemy = null;
        let closestDistance = this.range;
        
        enemies.forEach(enemy => {
            if (!enemy || !enemy.active || !enemy.scene) {
                return;
            }
            
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (closestEnemy) {
            // Shoot fireball at enemy
            new HydraFireball(this.scene, this.x, this.y - 10, closestEnemy.x, closestEnemy.y, this.damage);
        }
    }
    
    destroy() {
        if (this.attackTimer) {
            this.attackTimer.destroy();
        }
        if (this.headSwayTimer) {
            this.headSwayTimer.destroy();
        }
        if (this.hydraGraphics) {
            this.hydraGraphics.destroy();
        }
        if (this.headParticles) {
            this.headParticles.forEach(particles => {
                if (particles && particles.destroy) {
                    particles.destroy();
                }
            });
        }
        if (this.fireParticles) {
            this.fireParticles.destroy();
        }
        super.destroy();
    }
}

class HydraFireball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'fireball');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.speed = 300;
        this.setScale(0.8);
        this.setTint(0xff6600);
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        this.setRotation(angle);
        
        // Auto-destroy after 3 seconds
        scene.time.delayedCall(3000, () => {
            this.destroy();
        });
        
        // Small trail
        this.trail = scene.add.particles(0, 0, 'fireball', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.3, end: 0 },
            tint: 0xff6600,
            blendMode: 'ADD',
            lifespan: 200,
            quantity: 1,
            frequency: 100
        });
        
        this.trail.startFollow(this);
        
        // Collision with enemies
        scene.physics.add.overlap(this, scene.enemies, (fireball, enemy) => {
            if (!enemy || !enemy.active || !enemy.scene) {
                return;
            }
            
            enemy.takeDamage(this.damage);
            this.explode();
        });
    }
    
    explode() {
        const explosion = this.scene.add.particles(this.x, this.y, 'fireball', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.6, end: 0 },
            tint: 0xff6600,
            blendMode: 'ADD',
            lifespan: 150,
            quantity: 4
        });
        
        this.scene.time.delayedCall(150, () => {
            if (explosion && explosion.destroy) {
                explosion.destroy();
            }
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