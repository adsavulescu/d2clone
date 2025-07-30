class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, level = 1) {
        super(scene, x, y, 'enemy');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        
        // Scale enemy stats with level
        this.level = level;
        this.baseHealth = 30 + (level * 10);
        this.health = this.baseHealth;
        this.maxHealth = this.baseHealth;
        this.speed = 60 + (level * 5);
        this.damage = 5 + (level * 2);
        this.attackRange = 50;
        this.detectionRange = 200;
        this.attackCooldown = 1000;
        this.lastAttack = 0;
        
        // Experience reward
        this.experienceReward = 10 + (level * 5);
        
        this.state = 'wandering';
        this.frozen = false;
        this.freezeEndTime = 0;
        
        this.wanderTarget = { x: x, y: y };
        this.nextWanderTime = 0;
        
        this.lastAIUpdate = 0;
        this.aiUpdateInterval = 100; // Update AI every 100ms instead of every frame
        
        // Movement direction tracking
        this.currentDirection = 'down';
        this.lastVelocity = { x: 0, y: 0 };
        
        // Aggro system - stays aggressive after taking damage
        this.isAggro = false;
        this.aggroRange = 1200; // Will chase player within this range when aggro (very large range)
        this.aggroTime = 0; // Time when aggro was triggered
        
        // Setup directional animations
        this.setupAnimations();
        
        this.createHealthBar();
    }
    
    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }
    
    updateHealthBar() {
        this.healthBar.clear();
        
        this.healthBar.fillStyle(0x000000, 1);
        this.healthBar.fillRect(this.x - 15, this.y - 20, 30, 4);
        
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(this.x - 15, this.y - 20, 30 * healthPercent, 4);
    }
    
    setupAnimations() {
        // Create animations for different directions
        if (!this.scene.anims.exists('skeleton_walk_down')) {
            this.scene.anims.create({
                key: 'skeleton_walk_down',
                frames: [{ key: 'skeleton_down' }],
                frameRate: 6,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('skeleton_walk_up')) {
            this.scene.anims.create({
                key: 'skeleton_walk_up',
                frames: [{ key: 'skeleton_up' }],
                frameRate: 6,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('skeleton_walk_left')) {
            this.scene.anims.create({
                key: 'skeleton_walk_left',
                frames: [{ key: 'skeleton_left' }],
                frameRate: 6,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('skeleton_walk_right')) {
            this.scene.anims.create({
                key: 'skeleton_walk_right',
                frames: [{ key: 'skeleton_right' }],
                frameRate: 6,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('skeleton_idle')) {
            this.scene.anims.create({
                key: 'skeleton_idle',
                frames: [{ key: 'skeleton_down' }],
                frameRate: 1,
                repeat: 0
            });
        }
        
        // Start with idle animation
        this.play('skeleton_idle');
    }
    
    updateDirectionAndAnimation() {
        const velocityX = this.body.velocity.x;
        const velocityY = this.body.velocity.y;
        const isMoving = Math.abs(velocityX) > 5 || Math.abs(velocityY) > 5;
        
        if (isMoving) {
            let newDirection = this.currentDirection;
            
            // Determine primary direction based on velocity
            if (Math.abs(velocityX) > Math.abs(velocityY)) {
                // Horizontal movement is primary
                newDirection = velocityX > 0 ? 'right' : 'left';
            } else {
                // Vertical movement is primary  
                newDirection = velocityY > 0 ? 'down' : 'up';
            }
            
            // Update direction and animation if changed
            if (newDirection !== this.currentDirection) {
                this.currentDirection = newDirection;
                this.play(`skeleton_walk_${newDirection}`);
            } else if (!this.anims.isPlaying) {
                // Resume walking animation if it stopped
                this.play(`skeleton_walk_${newDirection}`);
            }
        } else {
            // Enemy stopped moving - play idle animation
            if (this.anims.currentAnim && this.anims.currentAnim.key !== 'skeleton_idle') {
                this.play('skeleton_idle');
            }
        }
        
        // Store velocity for next frame
        this.lastVelocity.x = velocityX;
        this.lastVelocity.y = velocityY;
    }
    
    update(time, delta) {
        if (this.frozen) {
            if (time > this.freezeEndTime) {
                this.frozen = false;
                this.clearTint();
            } else {
                this.setVelocity(0);
                this.updateHealthBar();
                return;
            }
        }
        
        // Always update health bar for fluid movement
        this.updateHealthBar();
        
        // Update direction and animation every frame for smooth visuals
        this.updateDirectionAndAnimation();
        
        // Throttle AI updates for performance
        if (time - this.lastAIUpdate < this.aiUpdateInterval) {
            return; // Skip AI processing this frame
        }
        this.lastAIUpdate = time;
        
        const player = this.playerRef;
        
        // Cull enemies that are too far from player (performance optimization)
        // BUT always update aggro enemies even if far away
        if (player && player.active && !this.isAggro) {
            const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (distanceToPlayer > 800) { // Only update enemies within 800 pixels
                this.setVelocity(0);
                return; // Skip expensive AI calculations for distant enemies
            }
        }
        
        if (!player || !player.active) {
            this.state = 'wandering';
            this.isAggro = false; // Reset aggro if player is gone
        } else {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y, player.x, player.y
            );
            
            if (distanceToPlayer <= this.attackRange) {
                this.state = 'attacking';
            } else if (distanceToPlayer <= this.detectionRange || (this.isAggro && distanceToPlayer <= this.aggroRange)) {
                // Chase if within normal detection range OR if aggro and within aggro range
                this.state = 'chasing';
            } else if (this.isAggro && distanceToPlayer > this.aggroRange && (time - this.aggroTime > 2000)) {
                // Lost the player while aggro - but only after being aggro for at least 2 seconds
                this.isAggro = false;
                this.state = 'wandering';
            } else {
                this.state = 'wandering';
            }
        }
        
        switch (this.state) {
            case 'wandering':
                this.wander(time);
                break;
            case 'chasing':
                this.chase(player);
                break;
            case 'attacking':
                this.attack(time, player);
                break;
        }
    }
    
    wander(time) {
        if (time > this.nextWanderTime) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.FloatBetween(50, 150);
            
            this.wanderTarget = {
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance
            };
            
            this.wanderTarget.x = Phaser.Math.Clamp(this.wanderTarget.x, 50, this.scene.physics.world.bounds.width - 50);
            this.wanderTarget.y = Phaser.Math.Clamp(this.wanderTarget.y, 50, this.scene.physics.world.bounds.height - 50);
            
            this.nextWanderTime = time + Phaser.Math.FloatBetween(2000, 4000);
        }
        
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.wanderTarget.x, this.wanderTarget.y
        );
        
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.wanderTarget.x, this.wanderTarget.y
        );
        
        if (distance > 10) {
            this.setVelocity(
                Math.cos(angle) * this.speed * 0.5,
                Math.sin(angle) * this.speed * 0.5
            );
        } else {
            this.setVelocity(0);
        }
    }
    
    chase(player) {
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            player.x, player.y
        );
        
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }
    
    attack(time, player) {
        this.setVelocity(0);
        
        if (time - this.lastAttack > this.attackCooldown) {
            player.takeDamage(this.damage);
            this.lastAttack = time;
            
            // Visual attack effect
            this.scene.tweens.add({
                targets: this,
                scale: 1.3,
                duration: 150,
                yoyo: true,
                ease: 'Power2'
            });
            
            // Flash red when attacking
            this.setTint(0xff4444);
            this.scene.time.delayedCall(200, () => {
                if (this.active) {
                    this.clearTint();
                }
            });
            
            // Attack particles (optimized)
            const attackEffect = this.scene.add.particles(this.x, this.y, 'enemy', {
                speed: { min: 80, max: 120 },
                scale: { start: 0.8, end: 0 },
                tint: 0xff4444,
                lifespan: 200,
                quantity: 3
            });
            
            this.scene.time.delayedCall(200, () => {
                attackEffect.destroy();
            });
        }
    }
    
    takeDamage(amount) {
        // Check if enemy is still active and has a valid scene
        if (!this.scene || !this.scene.time || !this.active) {
            return;
        }
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        // Immediately switch to attacking the player when taking damage
        if (this.scene.player && this.scene.player.active) {
            this.playerRef = this.scene.player;
            this.state = 'chasing'; // Start chasing the player immediately
            this.isAggro = true; // Mark as aggressive - won't return to wandering easily
            this.aggroTime = this.scene.time.now; // Record when aggro was triggered
            
            // Cancel any wandering behavior
            this.nextWanderTime = 0;
            
            // Force immediate AI update to bypass throttling
            this.lastAIUpdate = 0;
            
            // Show aggro indicator - make the skeleton flash red briefly
            this.setTint(0xffaaaa);
            this.scene.time.delayedCall(300, () => {
                if (this.active) {
                    this.clearTint();
                }
            });
            
        }
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
        
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    freeze(duration) {
        // Check if enemy is still active and has a valid scene
        if (!this.scene || !this.scene.time || !this.active) {
            return;
        }
        
        this.frozen = true;
        this.freezeEndTime = this.scene.time.now + duration;
        this.setTint(0x88ddff);
    }
    
    destroy() {
        // Drop experience and possibly items only if not during world transition
        if (this.scene.player && this.scene.player.active && !this.scene.isTransitioning) {
            this.scene.player.gainExperience(this.experienceReward);
            
            // Show experience gain
            const expText = this.scene.add.text(this.x, this.y - 30, `+${this.experienceReward} XP`, {
                fontSize: '12px',
                fill: '#00ff00',
                fontWeight: 'bold'
            }).setOrigin(0.5).setDepth(1000);
            
            this.scene.tweens.add({
                targets: expText,
                y: expText.y - 30,
                alpha: 0,
                duration: 1500,
                onComplete: () => expText.destroy()
            });
            
            // Chance to drop item (25% base chance + 3% per enemy level + world bonus)
            const worldLevel = this.scene.currentWorldLevel || 1;
            const worldDropBonus = Math.min(0.08, (worldLevel - 1) * 0.01); // Max 8% bonus
            const dropChance = 0.25 + (this.level * 0.03) + worldDropBonus;
            if (Math.random() < dropChance) {
                this.dropItem();
            }
        }
        
        if (this.healthBar) this.healthBar.destroy();
        super.destroy();
    }
    
    dropItem() {
        // Get world level from scene for scaling
        const worldLevel = this.scene.currentWorldLevel || 1;
        
        // Generate item level based on enemy level and world level
        const baseItemLevel = Math.max(1, this.level + Phaser.Math.Between(-1, 2));
        const worldScaledLevel = baseItemLevel + Math.floor((worldLevel - 1) * 0.3);
        
        // Drop chances - make potions rare luxury items
        const potionChance = 0.15; // Only 15% chance for potions
        const worldBonus = Math.min(0.05, (worldLevel - 1) * 0.01); // Small world bonus for potions
        const finalPotionChance = Math.min(0.25, potionChance + worldBonus); // Max 25% even in high worlds
        
        let item;
        if (Math.random() < finalPotionChance) {
            // Rare potion drop
            const potionType = Math.random() < 0.6 ? 'health' : 'mana';
            const potionLevel = Math.min(3, Math.max(1, worldScaledLevel)); // Lower level cap for potions
            item = Item.createPotion(potionType, potionLevel);
            
            // Much smaller stack sizes - potions are precious
            item.stackSize = Phaser.Math.Between(1, 2); // Only 1-2 potions per drop
        } else {
            // Equipment drop (85% of drops are equipment)
            const qualityBonus = Math.min(0.2, (worldLevel - 1) * 0.03);
            item = Item.generateRandomItem(worldScaledLevel, qualityBonus);
        }
        
        // Create visual item drop
        this.createItemDrop(item);
    }
    
    createItemDrop(item) {
        // Create visual representation of the dropped item using proper icons
        const itemSprite = this.scene.add.graphics();
        itemSprite.x = this.x;
        itemSprite.y = this.y;
        itemSprite.setDepth(50);
        
        // Draw the proper item icon
        this.drawDroppedItemIcon(itemSprite, item);
        
        // Store item data with the sprite
        itemSprite.itemData = item;
        itemSprite.isItemDrop = true;
        
        // Add to scene's item drops group
        if (!this.scene.itemDrops) {
            this.scene.itemDrops = this.scene.add.group();
        }
        this.scene.itemDrops.add(itemSprite);
        
        // Pickup interaction
        this.scene.physics.add.existing(itemSprite);
        itemSprite.body.setSize(24, 24);
        
        // Make item glow
        this.scene.tweens.add({
            targets: itemSprite,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    drawDroppedItemIcon(graphics, item) {
        graphics.clear();
        
        const rarityColors = {
            'normal': 0xffffff,
            'magic': 0x4444ff,
            'rare': 0xffff44,
            'unique': 0x8b4513
        };
        const baseColor = rarityColors[item.rarity] || 0xffffff;
        
        // Scale icons slightly smaller for ground drops
        const scale = 0.8;
        
        switch (item.type) {
            case 'potion':
                if (item.name.includes('Healing')) {
                    // Red bottle shape
                    graphics.fillStyle(0xcc0000, 1);
                    graphics.fillRoundedRect(-6*scale, -8*scale, 12*scale, 16*scale, 2*scale);
                    graphics.fillStyle(0xff4444, 1);
                    graphics.fillRoundedRect(-5*scale, -7*scale, 10*scale, 14*scale, 1*scale);
                    // Cork/cap
                    graphics.fillStyle(0x8b4513, 1);
                    graphics.fillRect(-3*scale, -9*scale, 6*scale, 3*scale);
                } else if (item.name.includes('Mana')) {
                    // Blue bottle shape
                    graphics.fillStyle(0x0000cc, 1);
                    graphics.fillRoundedRect(-6*scale, -8*scale, 12*scale, 16*scale, 2*scale);
                    graphics.fillStyle(0x4444ff, 1);
                    graphics.fillRoundedRect(-5*scale, -7*scale, 10*scale, 14*scale, 1*scale);
                    // Cork/cap
                    graphics.fillStyle(0x8b4513, 1);
                    graphics.fillRect(-3*scale, -9*scale, 6*scale, 3*scale);
                }
                break;
                
            case 'weapon':
                // Sword icon
                graphics.fillStyle(baseColor, 1);
                // Blade
                graphics.fillRect(-2*scale, -10*scale, 4*scale, 14*scale);
                // Crossguard
                graphics.fillRect(-5*scale, -3*scale, 10*scale, 2*scale);
                // Handle
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(-1*scale, 3*scale, 2*scale, 5*scale);
                // Pommel
                graphics.fillCircle(0, 9*scale, 2*scale);
                break;
                
            case 'armor':
                // Chestplate icon
                graphics.fillStyle(baseColor, 1);
                // Main body
                graphics.fillRoundedRect(-6*scale, -6*scale, 12*scale, 12*scale, 2*scale);
                // Shoulder plates
                graphics.fillRect(-8*scale, -5*scale, 3*scale, 5*scale);
                graphics.fillRect(5*scale, -5*scale, 3*scale, 5*scale);
                // Center detail
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-1*scale, -5*scale, 2*scale, 10*scale);
                break;
                
            case 'helmet':
                // Helmet icon
                graphics.fillStyle(baseColor, 1);
                // Main helmet shape
                graphics.fillEllipse(0, -2*scale, 12*scale, 9*scale);
                // Visor/face guard
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-5*scale, -3*scale, 10*scale, 5*scale);
                // Plume/crest
                graphics.fillStyle(0xaa0000, 1);
                graphics.fillRect(-1*scale, -8*scale, 2*scale, 5*scale);
                break;
                
            case 'boots':
                // Boot icon
                graphics.fillStyle(baseColor, 1);
                // Boot body
                graphics.fillRoundedRect(-5*scale, -3*scale, 10*scale, 10*scale, 2*scale);
                // Sole
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(-6*scale, 5*scale, 12*scale, 2*scale);
                // Laces
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-2*scale, -2*scale, 4*scale, 5*scale);
                break;
                
            case 'gloves':
                // Glove icon
                graphics.fillStyle(baseColor, 1);
                // Palm
                graphics.fillRoundedRect(-5*scale, -2*scale, 10*scale, 6*scale, 2*scale);
                // Fingers
                graphics.fillRect(-4*scale, -6*scale, 2*scale, 4*scale);
                graphics.fillRect(-1*scale, -8*scale, 2*scale, 6*scale);
                graphics.fillRect(3*scale, -6*scale, 2*scale, 4*scale);
                // Thumb
                graphics.fillRect(-6*scale, 0, 3*scale, 3*scale);
                break;
                
            case 'belt':
                // Belt icon
                graphics.fillStyle(baseColor, 1);
                // Belt strap
                graphics.fillRect(-8*scale, -2*scale, 16*scale, 3*scale);
                // Buckle
                graphics.fillStyle(0xffd700, 1);
                graphics.fillRect(-3*scale, -3*scale, 6*scale, 6*scale);
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-2*scale, -2*scale, 4*scale, 4*scale);
                break;
                
            case 'ring':
                // Ring icon
                graphics.fillStyle(baseColor, 1);
                // Ring band
                graphics.lineStyle(3*scale, baseColor, 1);
                graphics.strokeCircle(0, 0, 5*scale);
                // Gem
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(0, -5*scale, 2*scale);
                break;
                
            case 'amulet':
                // Amulet icon
                graphics.fillStyle(baseColor, 1);
                // Chain
                graphics.lineStyle(2*scale, 0x888888, 1);
                graphics.strokeCircle(0, -6*scale, 6*scale);
                // Pendant
                graphics.fillStyle(baseColor, 1);
                graphics.fillEllipse(0, 2*scale, 6*scale, 10*scale);
                // Gem in center
                graphics.fillStyle(0xff00ff, 1);
                graphics.fillCircle(0, 2*scale, 2*scale);
                break;
                
            case 'shield':
                // Shield icon
                graphics.fillStyle(baseColor, 1);
                // Shield shape
                graphics.fillRoundedRect(-6*scale, -8*scale, 12*scale, 16*scale, 6*scale);
                // Boss (center)
                graphics.fillStyle(0xffd700, 1);
                graphics.fillCircle(0, 0, 3*scale);
                // Cross design
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-1*scale, -6*scale, 2*scale, 12*scale);
                graphics.fillRect(-5*scale, -1*scale, 10*scale, 2*scale);
                break;
                
            default:
                // Generic item icon
                graphics.fillStyle(baseColor, 1);
                graphics.fillRect(-6*scale, -6*scale, 12*scale, 12*scale);
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(-5*scale, -5*scale, 10*scale, 10*scale);
                break;
        }
    }
}