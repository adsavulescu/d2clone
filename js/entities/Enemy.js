// Enemy type configurations
const EnemyTypes = {
    skeleton: {
        name: 'Skeleton Warrior',
        spriteKey: 'enemy',
        spritePrefix: 'skeleton',
        animationPrefix: 'skeleton',
        animationSpeed: 6,
        baseHealth: 30,
        healthPerLevel: 10,
        baseSpeed: 60,
        speedPerLevel: 5,
        baseDamage: 5,
        damagePerLevel: 2,
        attackRange: 50,
        detectionRange: 200,
        attackCooldown: 1000,
        baseExperience: 10,
        experiencePerLevel: 5,
        rarity: 1.0, // Spawn weight
        minWorldLevel: 1,
        behavior: 'melee'
    },
    
    zombie: {
        name: 'Rotting Zombie',
        spriteKey: 'zombie',
        spritePrefix: 'zombie',
        animationPrefix: 'zombie',
        animationSpeed: 4, // Slower animation
        baseHealth: 50,
        healthPerLevel: 15,
        baseSpeed: 40, // Slower but tankier
        speedPerLevel: 3,
        baseDamage: 8,
        damagePerLevel: 3,
        attackRange: 45,
        detectionRange: 150,
        attackCooldown: 1200,
        baseExperience: 15,
        experiencePerLevel: 7,
        rarity: 0.8, // Less common than skeletons
        minWorldLevel: 2,
        behavior: 'melee'
    },
    
    orc: {
        name: 'Brutal Orc',
        spriteKey: 'orc',
        spritePrefix: 'orc',
        animationPrefix: 'orc',
        animationSpeed: 8, // Aggressive animation
        baseHealth: 40,
        healthPerLevel: 12,
        baseSpeed: 80, // Fast and aggressive
        speedPerLevel: 8,
        baseDamage: 7,
        damagePerLevel: 4,
        attackRange: 55,
        detectionRange: 250, // Very alert
        attackCooldown: 800,
        baseExperience: 18,
        experiencePerLevel: 8,
        rarity: 0.6, // Rarer, stronger enemy
        minWorldLevel: 3,
        behavior: 'melee'
    },
    
    demon: {
        name: 'Lesser Demon',
        spriteKey: 'demon',
        spritePrefix: 'demon',
        animationPrefix: 'demon',
        animationSpeed: 10, // Very fast animation
        baseHealth: 25,
        healthPerLevel: 8,
        baseSpeed: 100, // Very fast, glass cannon
        speedPerLevel: 10,
        baseDamage: 12,
        damagePerLevel: 5,
        attackRange: 60,
        detectionRange: 300, // Excellent detection
        attackCooldown: 600,
        baseExperience: 25,
        experiencePerLevel: 12,
        rarity: 0.3, // Rare, dangerous enemy
        minWorldLevel: 4,
        behavior: 'melee'
    },
    
    // ARCHER ENEMIES
    fallenArcher: {
        name: 'Fallen Archer',
        spriteKey: 'fallenArcher',
        spritePrefix: 'fallenArcher',
        animationPrefix: 'fallenArcher',
        animationSpeed: 5,
        baseHealth: 20,
        healthPerLevel: 6,
        baseSpeed: 45, // Slower, keeps distance
        speedPerLevel: 3,
        baseDamage: 8,
        damagePerLevel: 3,
        attackRange: 180, // Long range
        detectionRange: 220,
        attackCooldown: 1500,
        baseExperience: 12,
        experiencePerLevel: 6,
        rarity: 0.7,
        minWorldLevel: 2,
        behavior: 'archer',
        preferredDistance: 150 // Keeps this distance from player
    },
    
    darkRanger: {
        name: 'Dark Ranger',
        spriteKey: 'darkRanger',
        spritePrefix: 'darkRanger',
        animationPrefix: 'darkRanger',
        animationSpeed: 6,
        baseHealth: 30,
        healthPerLevel: 8,
        baseSpeed: 65,
        speedPerLevel: 5,
        baseDamage: 12,
        damagePerLevel: 4,
        attackRange: 200,
        detectionRange: 280,
        attackCooldown: 1200,
        baseExperience: 20,
        experiencePerLevel: 9,
        rarity: 0.4,
        minWorldLevel: 4,
        behavior: 'archer',
        preferredDistance: 170
    },
    
    // EXPLODING ENEMIES
    explodingCorpse: {
        name: 'Exploding Corpse',
        spriteKey: 'explodingCorpse',
        spritePrefix: 'explodingCorpse',
        animationPrefix: 'explodingCorpse',
        animationSpeed: 3, // Slow shambling
        baseHealth: 15, // Low health, dies easily
        healthPerLevel: 5,
        baseSpeed: 25, // Very slow
        speedPerLevel: 2,
        baseDamage: 25, // High explosion damage
        damagePerLevel: 8,
        attackRange: 40, // Must get close
        detectionRange: 180,
        attackCooldown: 0, // Instant explosion
        baseExperience: 18,
        experiencePerLevel: 8,
        rarity: 0.5,
        minWorldLevel: 3,
        behavior: 'exploding',
        explosionRadius: 80
    },
    
    suicideBomber: {
        name: 'Suicide Bomber',
        spriteKey: 'suicideBomber',
        spritePrefix: 'suicideBomber',
        animationPrefix: 'suicideBomber',
        animationSpeed: 8, // Fast approach
        baseHealth: 35,
        healthPerLevel: 10,
        baseSpeed: 85, // Fast approach
        speedPerLevel: 8,
        baseDamage: 35,
        damagePerLevel: 12,
        attackRange: 50,
        detectionRange: 250,
        attackCooldown: 0,
        baseExperience: 25,
        experiencePerLevel: 12,
        rarity: 0.3,
        minWorldLevel: 5,
        behavior: 'exploding',
        explosionRadius: 100
    },
    
    // SPECIAL ENEMIES
    shaman: {
        name: 'Orc Shaman',
        spriteKey: 'shaman',
        spritePrefix: 'shaman',
        animationPrefix: 'shaman',
        animationSpeed: 4,
        baseHealth: 40,
        healthPerLevel: 12,
        baseSpeed: 35, // Slow, stays back
        speedPerLevel: 2,
        baseDamage: 15,
        damagePerLevel: 5,
        attackRange: 160, // Casts spells
        detectionRange: 200,
        attackCooldown: 2000,
        baseExperience: 30,
        experiencePerLevel: 15,
        rarity: 0.3,
        minWorldLevel: 4,
        behavior: 'caster',
        preferredDistance: 140
    },
    
    necromancer: {
        name: 'Dark Necromancer',
        spriteKey: 'necromancer',
        spritePrefix: 'necromancer',
        animationPrefix: 'necromancer',
        animationSpeed: 3,
        baseHealth: 50,
        healthPerLevel: 15,
        baseSpeed: 30,
        speedPerLevel: 2,
        baseDamage: 20,
        damagePerLevel: 8,
        attackRange: 180,
        detectionRange: 220,
        attackCooldown: 2500,
        baseExperience: 40,
        experiencePerLevel: 20,
        rarity: 0.2,
        minWorldLevel: 6,
        behavior: 'summoner',
        preferredDistance: 160
    },
    
    // BOSS ENEMIES
    boneLord: {
        name: 'Bone Lord',
        spriteKey: 'boneLord',
        spritePrefix: 'boneLord',
        animationPrefix: 'boneLord',
        animationSpeed: 5,
        baseHealth: 150,
        healthPerLevel: 50,
        baseSpeed: 55,
        speedPerLevel: 5,
        baseDamage: 25,
        damagePerLevel: 10,
        attackRange: 70,
        detectionRange: 300,
        attackCooldown: 800,
        baseExperience: 100,
        experiencePerLevel: 50,
        rarity: 0.05, // Very rare
        minWorldLevel: 5,
        behavior: 'boss',
        isBoss: true,
        bossType: 'melee'
    },
    
    demonLord: {
        name: 'Demon Lord',
        spriteKey: 'demonLord',
        spritePrefix: 'demonLord',
        animationPrefix: 'demonLord',
        animationSpeed: 8,
        baseHealth: 200,
        healthPerLevel: 60,
        baseSpeed: 70,
        speedPerLevel: 8,
        baseDamage: 30,
        damagePerLevel: 12,
        attackRange: 90,
        detectionRange: 350,
        attackCooldown: 600,
        baseExperience: 150,
        experiencePerLevel: 75,
        rarity: 0.03, // Extremely rare
        minWorldLevel: 7,
        behavior: 'boss',
        isBoss: true,
        bossType: 'hybrid' // Both melee and ranged attacks
    },
    
    lichKing: {
        name: 'Lich King',
        spriteKey: 'lichKing',
        spritePrefix: 'lichKing',
        animationPrefix: 'lichKing',
        animationSpeed: 4,
        baseHealth: 250,
        healthPerLevel: 70,
        baseSpeed: 40,
        speedPerLevel: 3,
        baseDamage: 35,
        damagePerLevel: 15,
        attackRange: 200,
        detectionRange: 400,
        attackCooldown: 1500,
        baseExperience: 200,
        experiencePerLevel: 100,
        rarity: 0.02, // Ultra rare
        minWorldLevel: 8,
        behavior: 'boss',
        isBoss: true,
        bossType: 'caster'
    }
};

// Base Enemy class
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, enemyType = 'skeleton', level = 1) {
        // Get enemy config based on type
        const config = EnemyTypes[enemyType] || EnemyTypes.skeleton;
        // Start with a random direction sprite as the initial texture
        const directions = ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const initialSprite = `${config.spritePrefix}_${randomDir}`;
        super(scene, x, y, initialSprite);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        
        // Update physics body for 3x larger sprites
        // Regular enemies use 72x72 sprites, bosses use 96x96
        const isBoss = enemyType.includes('Lord') || enemyType.includes('King');
        if (isBoss) {
            this.body.setSize(48, 48); // Boss collision box
            this.body.setOffset(24, 24);
        } else {
            this.body.setSize(36, 36); // Regular enemy collision box
            this.body.setOffset(18, 18);
        }
        
        // Store enemy type and config
        this.enemyType = enemyType;
        this.config = config;
        
        // Scale enemy stats with level
        this.level = level;
        this.baseHealth = config.baseHealth + (level * config.healthPerLevel);
        this.health = this.baseHealth;
        this.maxHealth = this.baseHealth;
        this.speed = config.baseSpeed + (level * config.speedPerLevel);
        this.damage = config.baseDamage + (level * config.damagePerLevel);
        this.attackRange = config.attackRange;
        this.detectionRange = config.detectionRange;
        this.attackCooldown = config.attackCooldown;
        this.lastAttack = 0;
        
        // Experience reward
        this.experienceReward = config.baseExperience + (level * config.experiencePerLevel);
        
        this.state = 'wandering';
        this.frozen = false;
        this.freezeEndTime = 0;
        
        this.wanderTarget = { x: x, y: y };
        this.nextWanderTime = 0;
        
        this.lastAIUpdate = 0;
        this.aiUpdateInterval = 100; // Update AI every 100ms instead of every frame
        
        // Movement direction tracking
        this.currentDirection = 'down';
        this.lastValidDirection = 'down'; // Store last valid direction to prevent glitches
        this.lastVelocity = { x: 0, y: 0 };
        this.isPerformingAttack = false;
        this.attackDirection = null; // Store attack direction separately
        this.framesSinceAttackStart = 0; // Debug counter
        
        // Aggro system - stays aggressive after taking damage
        this.isAggro = false;
        this.aggroRange = 1200; // Will chase player within this range when aggro (very large range)
        this.aggroTime = 0; // Time when aggro was triggered
        
        // Setup directional animations based on enemy type
        this.setupAnimations();
        
        // Health bar now handled by GameScene hover system
        // this.createHealthBar();
    }
    
    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }
    
    createBossHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.isBossHealthBar = true;
        this.updateHealthBar();
    }
    
    updateHealthBar() {
        this.healthBar.clear();
        
        if (this.isBossHealthBar) {
            // Larger, more prominent boss health bar
            const barWidth = 60;
            const barHeight = 8;
            const yOffset = -30;
            
            // Black background
            this.healthBar.fillStyle(0x000000, 1);
            this.healthBar.fillRect(this.x - barWidth/2, this.y + yOffset, barWidth, barHeight);
            
            // Gold border for bosses
            this.healthBar.lineStyle(2, 0xffd700, 1);
            this.healthBar.strokeRect(this.x - barWidth/2, this.y + yOffset, barWidth, barHeight);
            
            // Health fill
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.fillStyle(0xff0000, 1);
            this.healthBar.fillRect(this.x - barWidth/2 + 1, this.y + yOffset + 1, (barWidth - 2) * healthPercent, barHeight - 2);
            
            // Boss name above health bar
            if (!this.bossNameText) {
                this.bossNameText = this.scene.add.text(this.x, this.y + yOffset - 15, this.config.name, {
                    fontSize: '12px',
                    fill: '#ffd700',
                    fontWeight: 'bold',
                    stroke: '#000000',
                    strokeThickness: 1
                }).setOrigin(0.5).setDepth(1001);
            } else {
                this.bossNameText.setPosition(this.x, this.y + yOffset - 15);
            }
        } else {
            // Regular enemy health bar
            this.healthBar.fillStyle(0x000000, 1);
            this.healthBar.fillRect(this.x - 15, this.y - 20, 30, 4);
            
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.fillStyle(0xff0000, 1);
            this.healthBar.fillRect(this.x - 15, this.y - 20, 30 * healthPercent, 4);
        }
    }
    
    calculateDirectionToTarget(targetX, targetY) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const degreeAngle = (angle * 180 / Math.PI + 360) % 360;
        
        if (degreeAngle >= 337.5 || degreeAngle < 22.5) {
            return 'right';
        } else if (degreeAngle >= 22.5 && degreeAngle < 67.5) {
            return 'downright';
        } else if (degreeAngle >= 67.5 && degreeAngle < 112.5) {
            return 'down';
        } else if (degreeAngle >= 112.5 && degreeAngle < 157.5) {
            return 'downleft';
        } else if (degreeAngle >= 157.5 && degreeAngle < 202.5) {
            return 'left';
        } else if (degreeAngle >= 202.5 && degreeAngle < 247.5) {
            return 'upleft';
        } else if (degreeAngle >= 247.5 && degreeAngle < 292.5) {
            return 'up';
        } else if (degreeAngle >= 292.5 && degreeAngle < 337.5) {
            return 'upright';
        }
        return 'down'; // default
    }
    
    setupAnimations() {
        const animPrefix = this.config.animationPrefix;
        
        // Create animations for all 8 directions
        const directions = ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'];
        
        directions.forEach(direction => {
            const walkKey = `${animPrefix}_walk_${direction}`;
            const spriteKey = `${this.config.spritePrefix}_${direction}`;
            
            if (!this.scene.anims.exists(walkKey)) {
                this.scene.anims.create({
                    key: walkKey,
                    frames: [{ key: spriteKey }],
                    frameRate: this.config.animationSpeed || 6,
                    repeat: -1
                });
            }
        });
        
        // Create idle animations for all directions
        directions.forEach(direction => {
            const idleKey = `${animPrefix}_idle_${direction}`;
            const spriteKey = `${this.config.spritePrefix}_${direction}`;
            
            if (!this.scene.anims.exists(idleKey)) {
                this.scene.anims.create({
                    key: idleKey,
                    frames: [{ key: spriteKey }],
                    frameRate: 1,
                    repeat: 0
                });
            }
        });
        
        // Create attack animations for all directions (same as idle but we distinguish them)
        directions.forEach(direction => {
            const attackKey = `${animPrefix}_attack_${direction}`;
            const spriteKey = `${this.config.spritePrefix}_${direction}`;
            
            if (!this.scene.anims.exists(attackKey)) {
                this.scene.anims.create({
                    key: attackKey,
                    frames: [{ key: spriteKey }],
                    frameRate: 1,
                    repeat: 0
                });
            }
        });
        
        // Default idle animation
        const idleKey = `${animPrefix}_idle`;
        if (!this.scene.anims.exists(idleKey)) {
            this.scene.anims.create({
                key: idleKey,
                frames: [{ key: `${this.config.spritePrefix}_down` }],
                frameRate: 1,
                repeat: 0
            });
        }
        
        // Start with a random directional idle animation
        const startDirections = ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'];
        const randomDirection = startDirections[Math.floor(Math.random() * startDirections.length)];
        this.currentDirection = randomDirection;
        this.lastValidDirection = randomDirection;
        this.attackDirection = randomDirection; // Initialize attack direction too
        
        // Don't use setTexture, just play the animation directly
        this.play(`${animPrefix}_idle_${randomDirection}`, true);
    }
    
    
    updateDirectionAndAnimation() {
        // Always maintain proper facing during attack state
        if (this.state === 'attacking' && this.playerRef) {
            // Always calculate fresh direction to player
            const targetDirection = this.calculateDirectionToTarget(this.playerRef.x, this.playerRef.y);
            this.currentDirection = targetDirection;
            
            // Update attack direction
            if (!this.attackDirection || this.attackDirection !== targetDirection) {
                this.attackDirection = targetDirection;
            }
            
            const idleKey = `${this.config.animationPrefix}_idle_${this.currentDirection}`;
            const currentKey = this.anims.currentAnim?.key || '';
            
            // Force the correct animation if it's not playing
            if (!currentKey || !currentKey.includes(this.currentDirection)) {
                this.play(idleKey, true);
            }
            return; // Skip normal movement-based animation logic
        }
        
        const velocityX = this.body.velocity.x;
        const velocityY = this.body.velocity.y;
        const isMoving = Math.abs(velocityX) > 5 || Math.abs(velocityY) > 5;
        
        if (isMoving) {
            let newDirection = this.currentDirection;
            
            // Calculate angle to determine 8-directional movement
            const angle = Math.atan2(velocityY, velocityX);
            const degreeAngle = (angle * 180 / Math.PI + 360) % 360;
            
            // Determine direction based on angle (8 directions)
            if (degreeAngle >= 337.5 || degreeAngle < 22.5) {
                newDirection = 'right';
            } else if (degreeAngle >= 22.5 && degreeAngle < 67.5) {
                newDirection = 'downright';
            } else if (degreeAngle >= 67.5 && degreeAngle < 112.5) {
                newDirection = 'down';
            } else if (degreeAngle >= 112.5 && degreeAngle < 157.5) {
                newDirection = 'downleft';
            } else if (degreeAngle >= 157.5 && degreeAngle < 202.5) {
                newDirection = 'left';
            } else if (degreeAngle >= 202.5 && degreeAngle < 247.5) {
                newDirection = 'upleft';
            } else if (degreeAngle >= 247.5 && degreeAngle < 292.5) {
                newDirection = 'up';
            } else if (degreeAngle >= 292.5 && degreeAngle < 337.5) {
                newDirection = 'upright';
            }
            
            // Update direction and animation if changed
            if (newDirection !== this.currentDirection) {
                this.currentDirection = newDirection;
                this.lastValidDirection = newDirection; // Remember this direction
                this.play(`${this.config.animationPrefix}_walk_${newDirection}`);
            } else if (!this.anims.isPlaying) {
                // Resume walking animation if it stopped
                this.play(`${this.config.animationPrefix}_walk_${newDirection}`);
            }
        } else {
            // Enemy stopped moving - play idle animation for current direction
            // If we have a player reference and are in combat, face the player even when idle
            if (this.playerRef && (this.state === 'attacking' || this.state === 'chasing' || this.isAggro)) {
                const newDirection = this.calculateDirectionToTarget(this.playerRef.x, this.playerRef.y);
                this.currentDirection = newDirection;
                
                // Store attack direction when in attack state
                if (this.state === 'attacking') {
                    this.attackDirection = newDirection;
                }
            }
            
            // Don't override animations if we're performing an attack or if we're in attack state
            if (!this.isPerformingAttack && this.state !== 'attacking') {
                // Use last valid direction if current direction hasn't been set properly
                const directionToUse = this.currentDirection || this.lastValidDirection || 'down';
                const idleKey = `${this.config.animationPrefix}_idle_${directionToUse}`;
                const currentKey = this.anims.currentAnim?.key || '';
                
                // Only play new animation if it's different from current
                if (currentKey !== idleKey) {
                    this.play(idleKey, true);
                }
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
                // this.updateHealthBar();
                return;
            }
        }
        
        // Always update health bar for fluid movement
        // this.updateHealthBar();
        
        // Update direction and animation every frame for smooth visuals
        this.updateDirectionAndAnimation();
        
        // Throttle AI updates for performance - but not during attacks
        if (time - this.lastAIUpdate < this.aiUpdateInterval && this.state !== 'attacking') {
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
        
        if (!player || !player.active || player.isDead) {
            this.state = 'wandering';
            this.isAggro = false; // Reset aggro if player is gone
        } else {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y, player.x, player.y
            );
            
            if (distanceToPlayer <= this.attackRange) {
                // Immediately face the player when entering attack range
                if (this.state !== 'attacking') {
                    // First time entering attack state - immediately face player
                    this.state = 'attacking';
                    this.attackDirection = this.calculateDirectionToTarget(player.x, player.y);
                    this.currentDirection = this.attackDirection;
                    const attackReadyAnim = `${this.config.animationPrefix}_idle_${this.attackDirection}`;
                    this.play(attackReadyAnim, true);
                } else {
                    this.state = 'attacking';
                }
            } else if (distanceToPlayer <= this.detectionRange || (this.isAggro && distanceToPlayer <= this.aggroRange)) {
                // Chase if within normal detection range OR if aggro and within aggro range
                if (this.state === 'attacking') {
                    // Just left attack range, clear attack state and resume animations
                    this.isPerformingAttack = false;
                    this.attackDirection = null;
                    // Resume walking animation
                    const walkKey = `${this.config.animationPrefix}_walk_${this.currentDirection}`;
                    this.play(walkKey, true);
                }
                this.state = 'chasing';
            } else if (this.isAggro && distanceToPlayer > this.aggroRange && (time - this.aggroTime > 2000)) {
                // Lost the player while aggro - but only after being aggro for at least 2 seconds
                if (this.state === 'attacking') {
                    // Just left attack state, clear it
                    this.isPerformingAttack = false;
                    this.attackDirection = null;
                }
                this.isAggro = false;
                this.state = 'wandering';
            } else {
                if (this.state === 'attacking') {
                    // Just left attack state, clear it
                    this.isPerformingAttack = false;
                    this.attackDirection = null;
                }
                this.state = 'wandering';
            }
        }
        
        // Behavior-specific AI
        switch (this.config.behavior) {
            case 'archer':
                this.archerBehavior(time, player);
                break;
            case 'exploding':
                this.explodingBehavior(time, player);
                break;
            case 'caster':
                this.casterBehavior(time, player);
                break;
            case 'summoner':
                this.summonerBehavior(time, player);
                break;
            case 'boss':
                this.bossBehavior(time, player);
                break;
            default: // melee behavior
                this.meleeBehavior(time, player);
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
        
        // Check if we're about to enter attack range
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        // If very close to attack range, start facing the player properly
        if (distanceToPlayer <= this.attackRange * 1.2) {
            this.currentDirection = this.calculateDirectionToTarget(player.x, player.y);
        }
        
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }
    
    attack(time, player) {
        // Don't attack if player is dead
        if (player.isDead) {
            this.state = 'idle';
            this.isPerformingAttack = false;
            return;
        }
        
        // Always update direction to face player during attack
        const currentAttackDir = this.calculateDirectionToTarget(player.x, player.y);
        
        // Only set up attack animation on first frame of attack OR if direction changed
        if (!this.isPerformingAttack || currentAttackDir !== this.attackDirection) {
            this.attackDirection = currentAttackDir;
            this.currentDirection = this.attackDirection;
            this.isPerformingAttack = true;
            
            // Store the animation we want to play
            const desiredAnimKey = `${this.config.animationPrefix}_idle_${this.attackDirection}`;
            
            // Play the attack animation
            this.play(desiredAnimKey, true);
        }
        
        // Always set velocity to 0 during attack
        this.setVelocity(0);
        
        
        if (time - this.lastAttack > this.attackCooldown) {
            player.takeDamage(this.damage);
            this.lastAttack = time;
            
            // Keep attack flag true for a portion of the cooldown
            if (this.scene && this.scene.time) {
                this.scene.time.delayedCall(Math.min(500, this.attackCooldown * 0.5), () => {
                    if (this.active && this.state === 'attacking') {
                        // Still attacking - keep the flag but DON'T clear direction
                        this.isPerformingAttack = false;
                        // Keep attackDirection so we maintain facing
                    }
                });
            }
            
            // Visual attack effect - only if scene is still valid
            if (this.scene && this.scene.tweens) {
                this.scene.tweens.add({
                    targets: this,
                    scale: 1.3,
                    duration: 150,
                    yoyo: true,
                    ease: 'Power2'
                });
            }
            
            // Flash red when attacking
            this.setTint(0xff4444);
            if (this.scene && this.scene.time) {
                this.scene.time.delayedCall(200, () => {
                    if (this.active) {
                        this.clearTint();
                    }
                });
            }
            
            // Attack particles (optimized) - only if scene is still valid
            if (this.scene && this.scene.add) {
                const attackEffect = this.scene.add.particles(this.x, this.y, 'enemy', {
                    speed: { min: 80, max: 120 },
                    scale: { start: 0.8, end: 0 },
                    tint: 0xff4444,
                    lifespan: 200,
                    quantity: 3
                });
                
                if (this.scene.time) {
                    this.scene.time.delayedCall(200, () => {
                        if (attackEffect && attackEffect.destroy) {
                            attackEffect.destroy();
                        }
                    });
                }
            }
        }
    }
    
    // BEHAVIOR-SPECIFIC METHODS
    meleeBehavior(time, player) {
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
    
    archerBehavior(time, player) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        if (distanceToPlayer <= this.attackRange) {
            // In range - shoot arrows
            this.state = 'attacking';
            this.shootArrow(time, player);
        } else if (distanceToPlayer <= this.detectionRange || this.isAggro) {
            // Try to maintain preferred distance
            if (distanceToPlayer < this.config.preferredDistance) {
                // Too close - back away
                this.retreatFrom(player);
            } else if (distanceToPlayer > this.attackRange) {
                // Too far - get closer but not too close
                this.approachTo(player, this.config.preferredDistance);
            }
        } else {
            this.wander(time);
        }
    }
    
    explodingBehavior(time, player) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        if (distanceToPlayer <= this.attackRange) {
            // Close enough - explode!
            this.explode();
        } else if (distanceToPlayer <= this.detectionRange || this.isAggro) {
            // Rush towards player
            this.chase(player);
            // Visual warning - flash red when close
            if (distanceToPlayer < this.attackRange * 1.5) {
                this.setTint(0xff4444);
                this.scene.time.delayedCall(200, () => {
                    if (this.active) {
                        this.clearTint();
                        this.isPerformingAttack = false;
                    }
                });
            }
        } else {
            this.wander(time);
        }
    }
    
    casterBehavior(time, player) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        if (distanceToPlayer <= this.attackRange) {
            this.state = 'attacking';
            this.castSpell(time, player);
        } else if (distanceToPlayer <= this.detectionRange || this.isAggro) {
            if (distanceToPlayer < this.config.preferredDistance) {
                this.retreatFrom(player);
            } else {
                this.approachTo(player, this.config.preferredDistance);
            }
        } else {
            this.wander(time);
        }
    }
    
    summonerBehavior(time, player) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        if (distanceToPlayer <= this.attackRange) {
            this.state = 'attacking';
            this.summonMinions(time, player);
        } else if (distanceToPlayer <= this.detectionRange || this.isAggro) {
            this.approachTo(player, this.config.preferredDistance);
        } else {
            this.wander(time);
        }
    }
    
    bossBehavior(time, player) {
        // Bosses have multiple attack patterns
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        if (distanceToPlayer <= this.attackRange) {
            this.state = 'attacking';
            this.bossAttack(time, player);
        } else if (distanceToPlayer <= this.detectionRange || this.isAggro) {
            this.chase(player);
        } else {
            this.wander(time);
        }
    }
    
    // MOVEMENT HELPERS
    retreatFrom(player) {
        const angle = Phaser.Math.Angle.Between(
            player.x, player.y, this.x, this.y
        );
        
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }
    
    approachTo(player, targetDistance) {
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y, player.x, player.y
        );
        
        this.setVelocity(
            Math.cos(angle) * this.speed * 0.8,
            Math.sin(angle) * this.speed * 0.8
        );
    }
    
    // ATTACK METHODS
    shootArrow(time, player) {
        // Calculate direction to player for proper facing
        this.attackDirection = this.calculateDirectionToTarget(player.x, player.y);
        
        // Update facing and play attack animation BEFORE setting velocity
        this.currentDirection = this.attackDirection;
        this.isPerformingAttack = true;
        this.play(`${this.config.animationPrefix}_idle_${this.attackDirection}`, true);
        
        if (time - this.lastAttack > this.attackCooldown) {
            new EnemyArrow(this.scene, this.x, this.y, player.x, player.y, this.damage);
            this.lastAttack = time;
            
            // Visual attack effect
            this.setTint(0x00ff00);
            this.scene.time.delayedCall(200, () => {
                if (this.active) {
                    this.clearTint();
                    this.isPerformingAttack = false;
                    this.attackDirection = null;
                }
            });
        }
        // Set velocity AFTER animation is set
        this.setVelocity(0, 0);
    }
    
    explode() {
        if (!this.scene || !this.scene.player || !this.active) {
            return;
        }
        
        const explosionRadius = this.config.explosionRadius || 80;
        const playerDistance = Phaser.Math.Distance.Between(
            this.x, this.y, this.scene.player.x, this.scene.player.y
        );
        
        // Damage player if in range
        if (playerDistance <= explosionRadius) {
            this.scene.player.takeDamage(this.damage);
        }
        
        // Visual explosion effect
        const explosion = this.scene.add.particles(this.x, this.y, 'fireball', {
            speed: { min: 100, max: 200 },
            scale: { start: 1.0, end: 0 },
            tint: [0xff0000, 0xff4400, 0xff8800],
            blendMode: 'ADD',
            lifespan: 300,
            quantity: 8
        });
        
        this.scene.time.delayedCall(300, () => {
            if (explosion && explosion.destroy) {
                explosion.destroy();
            }
        });
        
        // Destroy self
        this.destroy();
    }
    
    castSpell(time, player) {
        // Calculate direction to player for proper facing
        this.attackDirection = this.calculateDirectionToTarget(player.x, player.y);
        
        // Update facing and play cast animation BEFORE setting velocity
        this.currentDirection = this.attackDirection;
        this.isPerformingAttack = true;
        this.play(`${this.config.animationPrefix}_idle_${this.attackDirection}`, true);
        
        if (time - this.lastAttack > this.attackCooldown) {
            // Random spell choice
            const spellType = Phaser.Math.Between(1, 3);
            
            switch (spellType) {
                case 1:
                    new EnemyMagicMissile(this.scene, this.x, this.y, player.x, player.y, this.damage);
                    break;
                case 2:
                    new EnemyFirebolt(this.scene, this.x, this.y, player.x, player.y, this.damage);
                    break;
                case 3:
                    new EnemyLightningBolt(this.scene, this.x, this.y, player.x, player.y, this.damage);
                    break;
            }
            
            this.lastAttack = time;
            
            // Visual casting effect
            this.setTint(0x8800ff);
            this.scene.time.delayedCall(300, () => {
                if (this.active) {
                    this.clearTint();
                    this.isPerformingAttack = false;
                    this.attackDirection = null;
                }
            });
        }
        // Set velocity AFTER animation is set
        this.setVelocity(0, 0);
    }
    
    summonMinions(time, player) {
        // Calculate direction to player for proper facing
        this.attackDirection = this.calculateDirectionToTarget(player.x, player.y);
        
        // Update facing and play summoning animation BEFORE setting velocity
        this.currentDirection = this.attackDirection;
        this.isPerformingAttack = true;
        this.play(`${this.config.animationPrefix}_idle_${this.attackDirection}`, true);
        
        if (time - this.lastAttack > this.attackCooldown) {
            // Summon 1-2 skeleton minions
            const minionCount = Phaser.Math.Between(1, 2);
            
            for (let i = 0; i < minionCount; i++) {
                const angle = (Math.PI * 2) * (i / minionCount);
                const distance = 60;
                const minionX = this.x + Math.cos(angle) * distance;
                const minionY = this.y + Math.sin(angle) * distance;
                
                // Create weaker skeleton minion
                const minion = new Enemy(this.scene, minionX, minionY, 'skeleton', Math.max(1, this.level - 2));
                minion.playerRef = this.scene.player;
                minion.isMinion = true;
                minion.setScale(0.7); // Smaller minions
                this.scene.enemies.add(minion);
            }
            
            this.lastAttack = time;
            
            // Visual summoning effect
            this.setTint(0x440088);
            this.scene.time.delayedCall(500, () => {
                if (this.active) {
                    this.clearTint();
                    this.isPerformingAttack = false;
                    this.attackDirection = null;
                }
            });
        }
        // Set velocity AFTER animation is set
        this.setVelocity(0, 0);
    }
    
    bossAttack(time, player) {
        if (time - this.lastAttack > this.attackCooldown) {
            const healthPercent = this.health / this.maxHealth;
            
            // Different attack patterns based on boss type and health
            switch (this.config.bossType) {
                case 'melee':
                    this.bossMeleeAttack(player, healthPercent);
                    break;
                case 'caster':
                    this.bossCasterAttack(player, healthPercent);
                    break;
                case 'hybrid':
                    this.bossHybridAttack(player, healthPercent);
                    break;
            }
            
            this.lastAttack = time;
        }
    }
    
    bossHybridAttack(player, healthPercent) {
        if (healthPercent < 0.5) {
            // Enraged - multiple attacks
            this.castSpell(this.scene.time.now, player);
            this.scene.time.delayedCall(300, () => {
                if (this.active) {
                    this.attack(this.scene.time.now, player);
                }
            });
        } else {
            // Normal attack pattern
            if (Math.random() < 0.6) {
                this.attack(this.scene.time.now, player);
            } else {
                this.castSpell(this.scene.time.now, player);
            }
        }
    }
    
    bossMeleeAttack(player, healthPercent) {
        // Powerful melee attacks
        this.attack(this.scene.time.now, player);
        
        if (healthPercent < 0.3) {
            // Desperate - charge attack
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocity(
                Math.cos(angle) * this.speed * 2,
                Math.sin(angle) * this.speed * 2
            );
        }
    }
    
    bossCasterAttack(player, healthPercent) {
        // Powerful spell attacks
        if (healthPercent < 0.4) {
            // Multi-cast when low health
            for (let i = 0; i < 3; i++) {
                this.scene.time.delayedCall(i * 200, () => {
                    if (this.active) {
                        this.castSpell(this.scene.time.now, player);
                    }
                });
            }
        } else {
            this.castSpell(this.scene.time.now, player);
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
        
        if (this.scene && this.scene.tweens) {
            this.scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 2
            });
        }
        
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
        // Add robust null checking to prevent errors during scene transitions
        if (this.scene && this.scene.player && this.scene.player.active && !this.scene.isTransitioning) {
            this.scene.player.gainExperience(this.experienceReward);
            
            // Track enemy kill for statistics
            if (this.scene.playerStats) {
                this.scene.playerStats.enemiesKilled++;
            }
            
            // Show experience gain - only if scene is still active
            if (this.scene.add && this.scene.tweens) {
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
                    onComplete: () => {
                        if (expText && expText.destroy) {
                            expText.destroy();
                        }
                    }
                });
            }
            
            // Chance to drop item (25% base chance + 3% per enemy level + world bonus)
            const worldLevel = this.scene.currentWorldLevel || 1;
            const worldDropBonus = Math.min(0.08, (worldLevel - 1) * 0.01); // Max 8% bonus
            const dropChance = 0.25 + (this.level * 0.03) + worldDropBonus;
            if (Math.random() < dropChance) {
                try {
                    this.dropItem();
                } catch (error) {
                    // Silently handle errors during scene transitions
                    console.warn('Error dropping item during scene transition:', error);
                }
            }
        }
        
        // Health bar now handled by GameScene
        // if (this.healthBar && this.healthBar.destroy) {
        //     this.healthBar.destroy();
        // }
        if (this.bossNameText && this.bossNameText.destroy) {
            this.bossNameText.destroy();
        }
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
        // Ensure scene is still valid before creating item drop
        if (!this.scene || !this.scene.add) {
            return;
        }
        
        // Create visual representation of the dropped item using proper icons
        const itemSprite = this.scene.add.graphics();
        itemSprite.x = this.x;
        itemSprite.y = this.y;
        itemSprite.setDepth(50);
        
        // Draw the proper item icon using UIManager for consistency
        if (this.scene.uiManager) {
            this.scene.uiManager.drawItemIcon(itemSprite, item);
        }
        
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
}

// Enemy Spawner class for handling spawn logic
class EnemySpawner {
    constructor(scene) {
        this.scene = scene;
        this.spawnGroups = [];
    }
    
    // Get available enemy types for the current world level
    getAvailableEnemyTypes(worldLevel) {
        return Object.keys(EnemyTypes).filter(type => {
            return EnemyTypes[type].minWorldLevel <= worldLevel;
        });
    }
    
    // Select enemy type based on rarity weights
    selectEnemyType(availableTypes) {
        const totalWeight = availableTypes.reduce((sum, type) => {
            return sum + EnemyTypes[type].rarity;
        }, 0);
        
        let random = Math.random() * totalWeight;
        
        for (const type of availableTypes) {
            random -= EnemyTypes[type].rarity;
            if (random <= 0) {
                return type;
            }
        }
        
        // Fallback to first available type
        return availableTypes[0] || 'skeleton';
    }
    
    // Spawn a group of enemies at given positions
    spawnEnemyGroup(positions, worldLevel, playerLevel) {
        const availableTypes = this.getAvailableEnemyTypes(worldLevel);
        const groupSize = positions.length;
        const enemies = [];
        
        // Determine group composition - sometimes mixed groups, sometimes single type
        const useMixedGroup = Math.random() < 0.3; // 30% chance for mixed groups
        let groupTypes = [];
        
        if (useMixedGroup && availableTypes.length > 1) {
            // Mixed group - select 2-3 different types
            const numTypes = Math.min(availableTypes.length, Math.max(2, Math.floor(groupSize / 2)));
            const shuffled = [...availableTypes].sort(() => Math.random() - 0.5);
            groupTypes = shuffled.slice(0, numTypes);
        } else {
            // Single type group
            groupTypes = [this.selectEnemyType(availableTypes)];
        }
        
        positions.forEach((pos, index) => {
            // Select type for this enemy
            const enemyType = groupTypes[index % groupTypes.length];
            
            // Calculate enemy level with some variation
            const baseLevel = Math.max(1, playerLevel + Phaser.Math.Between(-1, 1));
            const worldScaledLevel = baseLevel + Math.floor((worldLevel - 1) * 0.5);
            
            // Create the enemy
            const enemy = new Enemy(this.scene, pos.x, pos.y, enemyType, worldScaledLevel);
            enemy.playerRef = this.scene.player;
            
            this.scene.enemies.add(enemy);
            enemies.push(enemy);
        });
        
        // Store group info for potential group behaviors later
        this.spawnGroups.push({
            enemies: enemies,
            spawnTime: this.scene.time.now,
            groupTypes: groupTypes
        });
        
        return enemies;
    }
    
    // Generate fixed spawn data for world
    generateWorldSpawns(worldLevel) {
        const worldSpawns = {
            fixedGroups: [],
            totalEnemies: 0,
            bossSpawned: false
        };
        
        // Base spawn count increases with world level but caps out
        const baseSpawnCount = Math.min(50, 25 + (worldLevel * 3));
        
        // Add boss spawn chance (increases with world level)
        const bossChance = Math.min(0.3, (worldLevel - 4) * 0.05); // Starts at world 5
        const shouldSpawnBoss = worldLevel >= 5 && Math.random() < bossChance;
        
        if (shouldSpawnBoss) {
            worldSpawns.fixedGroups.push({
                size: 1,
                spawned: false,
                isBoss: true
            });
            worldSpawns.totalEnemies += 1;
        }
        
        // Create spawn groups of various sizes
        let remainingSpawns = baseSpawnCount;
        
        while (remainingSpawns > 0) {
            // Group sizes: 1-2 for singles, 3-5 for small groups, 6-8 for large groups
            let groupSize;
            const rand = Math.random();
            
            if (rand < 0.4) {
                // 40% singles or pairs
                groupSize = Math.min(remainingSpawns, Phaser.Math.Between(1, 2));
            } else if (rand < 0.8) {
                // 40% small groups
                groupSize = Math.min(remainingSpawns, Phaser.Math.Between(3, 5));
            } else {
                // 20% large groups  
                groupSize = Math.min(remainingSpawns, Phaser.Math.Between(6, 8));
            }
            
            worldSpawns.fixedGroups.push({
                size: groupSize,
                spawned: false,
                isBoss: false
            });
            
            remainingSpawns -= groupSize;
            worldSpawns.totalEnemies += groupSize;
        }
        
        return worldSpawns;
    }
    
    // Spawn enemies for world using fixed spawn data
    spawnWorldEnemies(worldSpawns, playerLevel, worldLevel) {
        let totalSpawned = 0;
        
        worldSpawns.fixedGroups.forEach(group => {
            if (!group.spawned) {
                // Get spawn positions for this group
                const positions = this.scene.worldGenerator.getSpawnablePositions(group.size);
                
                if (positions.length >= group.size) {
                    if (group.isBoss) {
                        // Spawn boss enemy
                        this.spawnBossEnemy(positions[0], worldLevel, playerLevel);
                        worldSpawns.bossSpawned = true;
                    } else {
                        // Spawn the group
                        this.spawnEnemyGroup(positions.slice(0, group.size), worldLevel, playerLevel);
                    }
                    group.spawned = true;
                    totalSpawned += group.size;
                }
            }
        });
        
        return totalSpawned;
    }
    
    // Spawn a boss enemy
    spawnBossEnemy(position, worldLevel, playerLevel) {
        const availableBosses = Object.keys(EnemyTypes).filter(type => {
            const config = EnemyTypes[type];
            return config.isBoss && config.minWorldLevel <= worldLevel;
        });
        
        if (availableBosses.length === 0) {
            // Fallback to regular enemy if no bosses available
            this.spawnEnemyGroup([position], worldLevel, playerLevel);
            return;
        }
        
        // Select boss type based on rarity
        const bossType = this.selectEnemyType(availableBosses);
        
        // Boss level is higher than regular enemies
        const bossLevel = Math.max(1, playerLevel + Phaser.Math.Between(2, 5)) + Math.floor((worldLevel - 1) * 0.8);
        
        // Create the boss
        const boss = new Enemy(this.scene, position.x, position.y, bossType, bossLevel);
        boss.playerRef = this.scene.player;
        boss.isBoss = true;
        
        // Make bosses larger and more visible
        boss.setScale(1.5);
        boss.setDepth(15); // Above regular enemies
        
        // Boss health bar now handled by GameScene hover system
        // if (boss.healthBar) {
        //     boss.healthBar.destroy();
        // }
        // boss.createBossHealthBar();
        
        this.scene.enemies.add(boss);
        
        console.log(`Boss spawned: ${EnemyTypes[bossType].name} (Level ${bossLevel})`);
        
        return boss;
    }
    
    // Clean up old spawn groups (for memory management)
    cleanupOldGroups() {
        const now = this.scene.time.now;
        this.spawnGroups = this.spawnGroups.filter(group => {
            // Remove groups that are very old or have no living enemies
            const isOld = (now - group.spawnTime) > 300000; // 5 minutes
            const hasLivingEnemies = group.enemies.some(enemy => enemy.active);
            
            return !isOld && hasLivingEnemies;
        });
    }
}

// ENEMY PROJECTILE CLASSES
class EnemyArrow extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'fireball');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.speed = 250;
        this.setScale(0.6);
        this.setTint(0x8b4513); // Brown arrow
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        this.setRotation(angle);
        
        // Auto-destroy after 3 seconds
        scene.time.delayedCall(3000, () => {
            if (this.active) this.destroy();
        });
        
        // Collision with player
        scene.physics.add.overlap(this, scene.player, (arrow, player) => {
            player.takeDamage(this.damage);
            this.destroy();
        });
        
        // Add wall collision
        if (scene.worldWalls) {
            scene.physics.add.collider(this, scene.worldWalls, () => {
                this.destroy();
            });
        }
    }
}

class EnemyMagicMissile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'fireball');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.speed = 200;
        this.setScale(0.7);
        this.setTint(0x8800ff); // Purple magic missile
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        // Auto-destroy after 4 seconds
        scene.time.delayedCall(4000, () => {
            if (this.active) this.destroy();
        });
        
        // Collision with player
        scene.physics.add.overlap(this, scene.player, (missile, player) => {
            player.takeDamage(this.damage);
            this.destroy();
        });
        
        // Add wall collision
        if (scene.worldWalls) {
            scene.physics.add.collider(this, scene.worldWalls, () => {
                this.destroy();
            });
        }
    }
}

class EnemyFirebolt extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'fireball');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.speed = 220;
        this.setScale(0.8);
        this.setTint(0xff4400); // Orange firebolt
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        // Auto-destroy after 4 seconds
        scene.time.delayedCall(4000, () => {
            if (this.active) this.destroy();
        });
        
        // Fire trail
        this.trail = scene.add.particles(0, 0, 'fireball', {
            speed: { min: 20, max: 40 },
            scale: { start: 0.3, end: 0 },
            tint: 0xff4400,
            blendMode: 'ADD',
            lifespan: 150,
            quantity: 1,
            frequency: 100
        });
        
        this.trail.startFollow(this);
        
        // Collision with player
        scene.physics.add.overlap(this, scene.player, (firebolt, player) => {
            player.takeDamage(this.damage);
            this.destroy();
        });
        
        // Add wall collision
        if (scene.worldWalls) {
            scene.physics.add.collider(this, scene.worldWalls, () => {
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

class EnemyLightningBolt extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY, damage) {
        super(scene, x, y, 'chainLightning');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.speed = 350; // Very fast
        this.setScale(1.2);
        this.setTint(0x00ffff); // Cyan lightning
        
        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
        
        // Auto-destroy after 2 seconds
        scene.time.delayedCall(2000, () => {
            if (this.active) this.destroy();
        });
        
        // Lightning effect
        this.electricEffect = scene.add.particles(0, 0, 'chainLightning', {
            speed: { min: 30, max: 60 },
            scale: { start: 0.4, end: 0 },
            tint: 0x00ffff,
            blendMode: 'ADD',
            lifespan: 100,
            quantity: 2,
            frequency: 50
        });
        
        this.electricEffect.startFollow(this);
        
        // Collision with player
        scene.physics.add.overlap(this, scene.player, (lightning, player) => {
            player.takeDamage(this.damage);
            this.destroy();
        });
        
        // Add wall collision
        if (scene.worldWalls) {
            scene.physics.add.collider(this, scene.worldWalls, () => {
                this.destroy();
            });
        }
    }
    
    destroy() {
        if (this.electricEffect) {
            this.electricEffect.destroy();
        }
        super.destroy();
    }
}