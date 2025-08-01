class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, playerFrames) {
        super(scene, x, y, 'player');
        
        // Store animation frames data
        this.playerFrames = playerFrames || null;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.setScale(1.5); // Double the previous size: from 96x96 to 192x192 (128 * 1.5 = 192)
        this.setDepth(200); // Ensure player is above everything including town hall
        
        // Update physics body for scaled sprites (192x192 displayed, but 128x128 actual)
        // Use optimal collision box for smooth wall sliding
        this.body.setSize(21, 21); // Collision box in original sprite space (32 / 1.5 ≈ 21)
        this.body.setOffset(53.5, 53.5); // Center the collision box (128/2 - 21/2 ≈ 53.5)
        
        // Configure physics for smooth wall sliding - key settings
        this.body.bounce.set(0); // No bouncing - essential for smooth sliding
        this.body.friction.set(0); // No friction to prevent sticking
        this.body.drag.set(0); // No drag - allows clean movement
        this.body.mass = 1; // Standard mass
        this.body.immovable = false; // Allow collision resolution
        this.body.pushable = false; // Prevent other objects from interfering
        this.body.moves = true; // Ensure body can move
        
        // Set collision world bounds
        this.body.collideWorldBounds = true;
        
        
        // Movement direction tracking
        this.currentDirection = 'down';
        this.lastVelocity = { x: 0, y: 0 };
        this.isCasting = false;
        this.isWalking = false; // Toggle between walk and run
        
        // Setup directional animations
        this.setupAnimations();
        
        // Invulnerability for transitions
        this.isInvulnerable = false;
        
        // Death state
        this.isDead = false;
        
        // Experience and Level System
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        
        // Core Stats (Diablo 2 style)
        this.baseStats = {
            strength: 10,
            dexterity: 10,
            vitality: 10,
            energy: 10
        };
        
        this.allocatedStats = {
            strength: 0,
            dexterity: 0,
            vitality: 0,
            energy: 0
        };
        
        this.statPoints = 0;
        this.skillPoints = 0;
        
        // Potion system with separate cooldowns
        this.healthPotionCooldown = 1500; // 1.5 seconds cooldown for health potions
        this.manaPotionCooldown = 1500; // 1.5 seconds cooldown for mana potions
        this.lastHealthPotionUsed = 0;
        this.lastManaPotionUsed = 0;
        this.healingOverTime = [];
        this.manaRestoreOverTime = [];
        
        // Equipment slots - must be defined before updateDerivedStats()
        this.equipment = {
            helmet: null,
            armor: null,
            weapon: null,
            shield: null,
            boots: null,
            gloves: null,
            belt: null,
            ring1: null,
            ring2: null,
            amulet: null
        };
        
        // Calculate derived stats
        this.updateDerivedStats();
        
        // Current health/mana (separate from max)
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        
        // Stamina system (Diablo 2 style)
        this.maxStamina = 80 + (this.allocatedStats.vitality * 2) + this.level; // Base 80 + 2 per vitality + 1 per level
        this.stamina = this.maxStamina;
        this.staminaDrainRate = 0.25; // Stamina lost per frame while running (4x slower)
        this.staminaRegenRate = 0.5; // Stamina gained per frame while walking/standing (4x slower)
        this.staminaRegenDelay = 1000; // Delay before regen starts after running (ms)
        this.lastStaminaDrain = 0; // Track when stamina was last drained
        this.wasForceWalking = false; // Track if player was forced to walk due to no stamina
        
        // Skills system - Organized by tabs (Offensive, Defensive, Passive)
        this.skills = {
            // OFFENSIVE TAB - Direct damage dealing skills
            fireball: {
                tab: 'offensive',
                level: 1,
                maxLevel: 20,
                cooldown: 500,
                lastUsed: 0,
                baseDamage: 10,
                damagePerLevel: 5,
                baseManaCost: 5,
                manaCostPerLevel: 1,
                statScaling: { energy: 0.2 },
                description: 'Hurls a fiery projectile that explodes on impact'
            },
            iceBolt: {
                tab: 'offensive',
                level: 0,
                maxLevel: 20,
                cooldown: 300,
                lastUsed: 0,
                baseDamage: 6,
                damagePerLevel: 3,
                baseManaCost: 3,
                manaCostPerLevel: 1,
                baseAccuracy: 70,
                accuracyPerLevel: 1.5,
                statScaling: { energy: 0.1, dexterity: 0.3 },
                description: 'Fires a piercing ice shard that can hit multiple enemies'
            },
            chainLightning: {
                tab: 'offensive',
                level: 0,
                maxLevel: 20,
                cooldown: 1000,
                lastUsed: 0,
                baseDamage: 12,
                damagePerLevel: 4,
                baseManaCost: 12,
                manaCostPerLevel: 2,
                baseChains: 3,
                chainsPerLevel: 0.2,
                statScaling: { energy: 0.25 },
                description: 'Lightning that jumps between nearby enemies'
            },
            meteor: {
                tab: 'offensive',
                level: 0,
                maxLevel: 20,
                cooldown: 4000,
                lastUsed: 0,
                baseDamage: 25,
                damagePerLevel: 8,
                baseManaCost: 30,
                manaCostPerLevel: 3,
                baseImpact: 80,
                impactPerLevel: 5,
                statScaling: { energy: 0.2, strength: 0.4 },
                description: 'Calls down a devastating meteor from the sky'
            },
            lightningBolt: {
                tab: 'offensive',
                level: 0,
                maxLevel: 20,
                cooldown: 600,
                lastUsed: 0,
                baseDamage: 15,
                damagePerLevel: 6,
                baseManaCost: 8,
                manaCostPerLevel: 2,
                basePierce: 2,
                piercePerLevel: 0.15,
                statScaling: { energy: 0.3 },
                description: 'Fast lightning bolt that pierces through enemies'
            },
            blizzard: {
                tab: 'offensive',
                level: 0,
                maxLevel: 20,
                cooldown: 8000,
                lastUsed: 0,
                baseDamage: 20,
                damagePerLevel: 7,
                baseManaCost: 40,
                manaCostPerLevel: 4,
                baseDuration: 5000,
                durationPerLevel: 200,
                baseRadius: 120,
                radiusPerLevel: 5,
                statScaling: { energy: 0.25 },
                description: 'Creates a freezing blizzard in target area'
            },
            hydra: {
                tab: 'offensive',
                level: 0,
                maxLevel: 20,
                cooldown: 10000,
                lastUsed: 0,
                baseDamage: 12,
                damagePerLevel: 4,
                baseManaCost: 35,
                manaCostPerLevel: 3,
                baseDuration: 15000,
                durationPerLevel: 1000,
                baseFireRate: 1500,
                fireRateReduction: 50,
                statScaling: { energy: 0.2 },
                description: 'Summons a fire-breathing hydra that attacks enemies'
            },
            
            // DEFENSIVE TAB - Protection and utility skills
            frostNova: {
                tab: 'defensive',
                level: 0,
                maxLevel: 20,
                cooldown: 3000,
                lastUsed: 0,
                baseDamage: 8,
                damagePerLevel: 3,
                baseManaCost: 15,
                manaCostPerLevel: 2,
                baseRadius: 100,
                radiusPerLevel: 10,
                statScaling: { energy: 0.15 },
                description: 'Freezes all nearby enemies in place'
            },
            teleport: {
                tab: 'defensive',
                level: 0,
                maxLevel: 20,
                cooldown: 2000,
                lastUsed: 0,
                baseManaCost: 20,
                manaCostPerLevel: 1,
                statScaling: { energy: 0.1 },
                description: 'Instantly teleports to target location'
            },
            energyShield: {
                tab: 'defensive',
                level: 0,
                maxLevel: 20,
                cooldown: 15000,
                lastUsed: 0,
                baseManaCost: 25,
                manaCostPerLevel: 2,
                baseAbsorption: 40,
                absorptionPerLevel: 2,
                baseDuration: 30000,
                durationPerLevel: 2000,
                statScaling: { energy: 0.15 },
                description: 'Absorbs damage by consuming mana instead of health'
            },
            thunderStorm: {
                tab: 'defensive',
                level: 0,
                maxLevel: 20,
                cooldown: 20000,
                lastUsed: 0,
                baseDamage: 18,
                damagePerLevel: 5,
                baseManaCost: 45,
                manaCostPerLevel: 3,
                baseDuration: 20000,
                durationPerLevel: 2000,
                baseStrikeRate: 2000,
                strikeRateReduction: 50,
                statScaling: { energy: 0.2 },
                description: 'Creates a storm that strikes enemies with lightning'
            },
            chillingArmor: {
                tab: 'defensive',
                level: 0,
                maxLevel: 20,
                cooldown: 25000,
                lastUsed: 0,
                baseChillDamage: 10,
                chillDamagePerLevel: 3,
                baseManaCost: 30,
                manaCostPerLevel: 2,
                baseChillDuration: 2000,
                chillDurationPerLevel: 200,
                baseArmorDuration: 60000,
                armorDurationPerLevel: 5000,
                statScaling: { energy: 0.1, vitality: 0.1 },
                description: 'Chills and damages attackers when you take damage'
            },
            
            // PASSIVE TAB - Permanent bonuses (no cooldowns, no casting)
            warmth: {
                tab: 'passive',
                level: 0,
                maxLevel: 20,
                baseManaRegen: 0.1,
                manaRegenPerLevel: 0.05,
                description: 'Increases mana regeneration rate'
            },
            staticField: {
                tab: 'passive',
                level: 0,
                maxLevel: 10,
                baseChance: 5,
                chancePerLevel: 2,
                baseRadius: 60,
                radiusPerLevel: 5,
                description: 'Chance to create static field when hit, reducing enemy health'
            },
            fireResistance: {
                tab: 'passive',
                level: 0,
                maxLevel: 20,
                baseResistance: 2,
                resistancePerLevel: 1,
                description: 'Increases resistance to fire damage'
            },
            coldResistance: {
                tab: 'passive',
                level: 0,
                maxLevel: 20,
                baseResistance: 2,
                resistancePerLevel: 1,
                description: 'Increases resistance to cold damage'
            },
            lightningResistance: {
                tab: 'passive',
                level: 0,
                maxLevel: 20,
                baseResistance: 2,
                resistancePerLevel: 1,
                description: 'Increases resistance to lightning damage'
            },
            mastery: {
                tab: 'passive',
                level: 0,
                maxLevel: 20,
                baseDamageBonus: 5,
                damageBonusPerLevel: 3,
                baseManaCostReduction: 2,
                manaCostReductionPerLevel: 1,
                description: 'Increases spell damage and reduces mana costs'
            }
        };
        
        // Inventory system - redesigned for better space utilization
        this.inventory = {
            width: 6,
            height: 7,
            items: new Array(42).fill(null)
        };
        
        // Equipment slots already defined above
        
        // New hotbar system - separated into three sections
        this.potionHotbar = new Array(2).fill(null);     // Q and E keys for potions
        this.mouseHotbar = new Array(3).fill(null);      // LMB, MMB, RMB
        this.skillsHotbar = new Array(4).fill(null);     // Keys 1-4 for skills
        
        // Default assignments
        this.mouseHotbar[0] = { type: 'action', name: 'move' };        // LMB - Move
        this.mouseHotbar[1] = null;                                    // MMB - Empty
        this.mouseHotbar[2] = { type: 'skill', name: 'fireball' };     // RMB - Fireball
        
        // Clear skills hotbar since we reduced available skills
        this.skillsHotbar[0] = null;
        this.skillsHotbar[1] = null;
        this.skillsHotbar[2] = null;
        this.skillsHotbar[3] = null;
        
        // Add starter potions to hotbar
        const healingPotion = Item.createPotion('health', 1); // Minor Healing Potion
        healingPotion.stackSize = 5;
        this.potionHotbar[0] = { type: 'item', item: healingPotion };
        
        const manaPotion = Item.createPotion('mana', 1); // Minor Mana Potion  
        manaPotion.stackSize = 5;
        this.potionHotbar[1] = { type: 'item', item: manaPotion };
    }
    
    addHealingOverTime(amount, duration) {
        const healPerTick = amount / (duration / 100); // Heal every 100ms
        const ticksRemaining = duration / 100;
        
        this.healingOverTime.push({
            healPerTick: healPerTick,
            ticksRemaining: ticksRemaining,
            lastTick: this.scene.time.now
        });
    }
    
    addManaRestoreOverTime(amount, duration) {
        const manaPerTick = amount / (duration / 100); // Restore every 100ms
        const ticksRemaining = duration / 100;
        
        this.manaRestoreOverTime.push({
            manaPerTick: manaPerTick,
            ticksRemaining: ticksRemaining,
            lastTick: this.scene.time.now
        });
    }
    
    updatePotionEffects() {
        const currentTime = this.scene.time.now;
        
        // Process healing over time
        for (let i = this.healingOverTime.length - 1; i >= 0; i--) {
            const effect = this.healingOverTime[i];
            
            if (currentTime - effect.lastTick >= 100) { // 100ms intervals
                this.health = Math.min(this.maxHealth, this.health + effect.healPerTick);
                effect.ticksRemaining--;
                effect.lastTick = currentTime;
                
                if (effect.ticksRemaining <= 0) {
                    this.healingOverTime.splice(i, 1);
                }
            }
        }
        
        // Process mana restoration over time
        for (let i = this.manaRestoreOverTime.length - 1; i >= 0; i--) {
            const effect = this.manaRestoreOverTime[i];
            
            if (currentTime - effect.lastTick >= 100) { // 100ms intervals
                this.mana = Math.min(this.maxMana, this.mana + effect.manaPerTick);
                effect.ticksRemaining--;
                effect.lastTick = currentTime;
                
                if (effect.ticksRemaining <= 0) {
                    this.manaRestoreOverTime.splice(i, 1);
                }
            }
        }
    }
    
    canUseHealthPotion() {
        const currentTime = this.scene.time.now;
        return currentTime - this.lastHealthPotionUsed >= this.healthPotionCooldown;
    }
    
    canUseManaPotion() {
        const currentTime = this.scene.time.now;
        return currentTime - this.lastManaPotionUsed >= this.manaPotionCooldown;
    }
    
    getHealthPotionCooldownRemaining() {
        const currentTime = this.scene.time.now;
        return Math.max(0, this.healthPotionCooldown - (currentTime - this.lastHealthPotionUsed));
    }
    
    getManaPotionCooldownRemaining() {
        const currentTime = this.scene.time.now;
        return Math.max(0, this.manaPotionCooldown - (currentTime - this.lastManaPotionUsed));
    }
    
    setupAnimations() {
        // Create animations for all 8 directions
        const directions = ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'];
        
        if (this.playerFrames) {
            // Create animations from loaded sprite sheets
            directions.forEach(dir => {
                // Run animation
                if (this.playerFrames.run && this.playerFrames.run[dir] && !this.scene.anims.exists(`sorcerer_run_${dir}`)) {
                    this.scene.anims.create({
                        key: `sorcerer_run_${dir}`,
                        frames: this.playerFrames.run[dir].map(frameKey => ({ key: frameKey })),
                        frameRate: 24, // 2x speed: 12 -> 24
                        repeat: -1
                    });
                }
                
                // Walk animation
                if (this.playerFrames.walk && this.playerFrames.walk[dir] && !this.scene.anims.exists(`sorcerer_walk_${dir}`)) {
                    this.scene.anims.create({
                        key: `sorcerer_walk_${dir}`,
                        frames: this.playerFrames.walk[dir].map(frameKey => ({ key: frameKey })),
                        frameRate: 16, // 2x speed: 8 -> 16
                        repeat: -1
                    });
                }
                
                // Idle animation
                if (this.playerFrames.idle && this.playerFrames.idle[dir] && !this.scene.anims.exists(`sorcerer_idle_${dir}`)) {
                    this.scene.anims.create({
                        key: `sorcerer_idle_${dir}`,
                        frames: this.playerFrames.idle[dir].map(frameKey => ({ key: frameKey })),
                        frameRate: 16, // 2x speed: 8 -> 16
                        repeat: -1
                    });
                }
                
                // Cast animation
                if (this.playerFrames.cast && this.playerFrames.cast[dir] && !this.scene.anims.exists(`sorcerer_cast_${dir}`)) {
                    this.scene.anims.create({
                        key: `sorcerer_cast_${dir}`,
                        frames: this.playerFrames.cast[dir].map(frameKey => ({ key: frameKey })),
                        frameRate: 128, // 4x speed: 32 -> 128 (2x faster than previous)
                        repeat: 0
                    });
                }
                
                // Death animation
                if (this.playerFrames.death && this.playerFrames.death[dir] && !this.scene.anims.exists(`sorcerer_death_${dir}`)) {
                    this.scene.anims.create({
                        key: `sorcerer_death_${dir}`,
                        frames: this.playerFrames.death[dir].map(frameKey => ({ key: frameKey })),
                        frameRate: 20, // 2x speed: 10 -> 20
                        repeat: 0
                    });
                }
            });
            
            // Default idle animation
            if (this.playerFrames.idle && this.playerFrames.idle.down && !this.scene.anims.exists('sorcerer_idle')) {
                this.scene.anims.create({
                    key: 'sorcerer_idle',
                    frames: this.playerFrames.idle.down.map(frameKey => ({ key: frameKey })),
                    frameRate: 16, // 2x speed: 8 -> 16
                    repeat: -1
                });
            }
        } else {
            // Fallback to single frame animations if no sprite data
            directions.forEach(dir => {
                if (!this.scene.anims.exists(`sorcerer_walk_${dir}`)) {
                    this.scene.anims.create({
                        key: `sorcerer_walk_${dir}`,
                        frames: [{ key: `sorcerer_${dir}` }],
                        frameRate: 8,
                        repeat: -1
                    });
                }
                
                if (!this.scene.anims.exists(`sorcerer_idle_${dir}`)) {
                    this.scene.anims.create({
                        key: `sorcerer_idle_${dir}`,
                        frames: [{ key: `sorcerer_${dir}` }],
                        frameRate: 1,
                        repeat: 0
                    });
                }
            });
            
            // Default idle animation
            if (!this.scene.anims.exists('sorcerer_idle')) {
                this.scene.anims.create({
                    key: 'sorcerer_idle',
                    frames: [{ key: 'sorcerer_down' }],
                    frameRate: 1,
                    repeat: 0
                });
            }
        }
        
        // Start with idle animation
        this.play('sorcerer_idle_down');
    }
    
    
    updateDerivedStats() {
        // Calculate equipment bonuses
        const equipmentBonuses = this.calculateEquipmentBonuses();
        
        // Calculate total stats (base + allocated + equipment)
        const totalStrength = this.baseStats.strength + this.allocatedStats.strength + equipmentBonuses.strength;
        const totalDexterity = this.baseStats.dexterity + this.allocatedStats.dexterity + equipmentBonuses.dexterity;
        const totalVitality = this.baseStats.vitality + this.allocatedStats.vitality + equipmentBonuses.vitality;
        const totalEnergy = this.baseStats.energy + this.allocatedStats.energy + equipmentBonuses.energy;
        
        // Store total stats for UI display
        this.totalStats = {
            strength: totalStrength,
            dexterity: totalDexterity,
            vitality: totalVitality,
            energy: totalEnergy
        };
        
        // Calculate max health (base 50 + 4 per vitality + 2 per level + equipment life)
        this.maxHealth = 50 + (totalVitality * 4) + (this.level * 2) + equipmentBonuses.life;
        
        // Calculate max mana (base 20 + 2 per energy + 1 per level + equipment mana)
        this.maxMana = 20 + (totalEnergy * 2) + this.level + equipmentBonuses.mana;
        
        // Calculate defense (equipment armor + dexterity bonus)
        this.defense = equipmentBonuses.armor + Math.floor(totalDexterity * 0.25);
        
        // Calculate attack rating (base 50 + dexterity bonus + level bonus)
        this.attackRating = 50 + (totalDexterity * 5) + (this.level * 3);
        
        // Calculate damage (base weapon damage + strength bonus + equipment damage)
        this.minDamage = 1 + Math.floor(totalStrength * 0.1) + equipmentBonuses.damage;
        this.maxDamage = 3 + Math.floor(totalStrength * 0.15) + equipmentBonuses.damage;
        
        // Calculate movement speed (base 200 + dexterity bonus + equipment bonus)
        this.speed = 200 + (totalDexterity * 2) + equipmentBonuses.moveSpeed;
        
        // Calculate resistances (equipment bonuses)
        this.resistances = {
            fire: equipmentBonuses.resistance.fire,
            cold: equipmentBonuses.resistance.cold,
            lightning: equipmentBonuses.resistance.lightning,
            poison: equipmentBonuses.resistance.poison
        };
        
        // Calculate cast and attack speeds
        this.attackSpeed = 100 + equipmentBonuses.attackSpeed;
        this.castSpeed = 100 + equipmentBonuses.castSpeed;
        
        // Calculate max stamina (base 80 + 2 per vitality + 1 per level)
        this.maxStamina = 80 + (totalVitality * 2) + this.level;
        
        // Ensure current health/mana/stamina don't exceed new maximums
        this.health = Math.min(this.health, this.maxHealth);
        this.mana = Math.min(this.mana, this.maxMana);
        this.stamina = Math.min(this.stamina || this.maxStamina, this.maxStamina);
    }
    
    calculateEquipmentBonuses() {
        const bonuses = {
            strength: 0,
            dexterity: 0,
            vitality: 0,
            energy: 0,
            life: 0,
            mana: 0,
            damage: 0,
            armor: 0,
            attackSpeed: 0,
            castSpeed: 0,
            moveSpeed: 0,
            resistance: {
                fire: 0,
                cold: 0,
                lightning: 0,
                poison: 0
            }
        };
        
        // Sum up bonuses from all equipped items
        Object.values(this.equipment).forEach(item => {
            if (item && item.properties) {
                bonuses.strength += item.properties.strength || 0;
                bonuses.dexterity += item.properties.dexterity || 0;
                bonuses.vitality += item.properties.vitality || 0;
                bonuses.energy += item.properties.energy || 0;
                bonuses.life += item.properties.life || 0;
                bonuses.mana += item.properties.mana || 0;
                bonuses.damage += item.properties.damage || 0;
                bonuses.armor += item.properties.armor || 0;
                bonuses.attackSpeed += item.properties.attackSpeed || 0;
                bonuses.castSpeed += item.properties.castSpeed || 0;
                bonuses.moveSpeed += item.properties.moveSpeed || 0;
                
                if (item.properties.resistance) {
                    bonuses.resistance.fire += item.properties.resistance.fire || 0;
                    bonuses.resistance.cold += item.properties.resistance.cold || 0;
                    bonuses.resistance.lightning += item.properties.resistance.lightning || 0;
                    bonuses.resistance.poison += item.properties.resistance.poison || 0;
                }
            }
        });
        
        return bonuses;
    }
    
    gainExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext && this.level < 99) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        
        // Award stat and skill points
        this.statPoints += 5;
        this.skillPoints += 1;
        
        // Increase experience requirement for next level
        this.experienceToNext = Math.floor(this.experienceToNext * 1.1);
        
        // Update derived stats
        this.updateDerivedStats();
        
        // Heal player and restore stamina on level up
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        this.stamina = this.maxStamina;
        
        // Visual level up effect
        const levelUpText = this.scene.add.text(this.x, this.y - 50, 'LEVEL UP!', {
            fontSize: '24px',
            fill: '#ffff00',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1000);
        
        // Animate the text upward and fade out
        this.scene.tweens.add({
            targets: levelUpText,
            y: levelUpText.y - 30,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                levelUpText.destroy();
            }
        });
    }
    
    allocateStat(statName) {
        if (this.statPoints > 0) {
            this.allocatedStats[statName]++;
            this.statPoints--;
            this.updateDerivedStats();
            return true;
        }
        return false;
    }
    
    upgradeSkill(skillName) {
        const skill = this.skills[skillName];
        if (skill && this.skillPoints > 0 && skill.level < skill.maxLevel) {
            skill.level++;
            this.skillPoints--;
            return true;
        }
        return false;
    }
    
    getSkillDamage(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level === 0) return 0;
        
        let damage = skill.baseDamage + (skill.damagePerLevel * (skill.level - 1));
        
        // Apply stat scaling bonuses
        if (skill.statScaling) {
            Object.keys(skill.statScaling).forEach(stat => {
                const statValue = this.totalStats[stat] || 0;
                const scalingFactor = skill.statScaling[stat];
                damage += Math.floor(statValue * scalingFactor);
            });
        }
        
        return Math.max(1, damage);
    }
    
    getSkillManaCost(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level === 0) return 0;
        
        return skill.baseManaCost + (skill.manaCostPerLevel * (skill.level - 1));
    }
    
    getSkillRadius(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level === 0) return 0;
        
        return skill.baseRadius + (skill.radiusPerLevel * (skill.level - 1));
    }
    
    getSkillChains(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level === 0) return 0;
        
        return Math.floor(skill.baseChains + (skill.chainsPerLevel * (skill.level - 1)));
    }
    
    getSkillAccuracy(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level === 0) return 0;
        
        let accuracy = skill.baseAccuracy + (skill.accuracyPerLevel * (skill.level - 1));
        
        // Apply dexterity bonus for accuracy
        if (skill.statScaling && skill.statScaling.dexterity) {
            accuracy += this.totalStats.dexterity * 0.5;
        }
        
        return Math.min(accuracy, 100); // Cap at 100% accuracy
    }
    
    getSkillImpact(skillName) {
        const skill = this.skills[skillName];
        if (!skill || skill.level === 0) return 0;
        
        let impact = skill.baseImpact + (skill.impactPerLevel * (skill.level - 1));
        
        // Apply strength bonus for impact area
        if (skill.statScaling && skill.statScaling.strength) {
            impact += this.totalStats.strength * 0.3;
        }
        
        return impact;
    }
    
    
    update(targetPosition) {
        // Don't update anything if player is dead
        if (this.isDead) {
            return;
        }
        
        // Store position before movement for debugging
        
        // Follow Phaser 3 best practice: reset velocity first, then apply movement
        this.body.setVelocity(0);
        
        // Prevent movement while casting (Movement-Restricted Casting)
        if (this.isCasting) {
            this.lastVelocityX = 0;
            this.lastVelocityY = 0;
        } else if (targetPosition && Phaser.Math.Distance.Between(this.x, this.y, targetPosition.x, targetPosition.y) > 10) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, targetPosition.x, targetPosition.y);
            
            // Calculate current movement speed (walk is half speed, running drains stamina)
            let currentSpeed = this.speed;
            const isMoving = true; // We're in the movement block
            
            if (this.isWalking) {
                currentSpeed = this.speed * 0.5; // Walk is half speed
            } else if (this.stamina <= 0) {
                currentSpeed = this.speed * 0.5; // No stamina = forced walk speed
                this.isWalking = true; // Force walking when out of stamina
            } else {
                // Running - drain stamina
                this.stamina = Math.max(0, this.stamina - this.staminaDrainRate);
                this.lastStaminaDrain = this.scene.time.now;
            }
            
            const velocityX = Math.cos(angle) * currentSpeed;
            const velocityY = Math.sin(angle) * currentSpeed;
            
            // Apply movement - Phaser's collision system will handle wall sliding
            this.body.setVelocity(velocityX, velocityY);
            
            // Store intended movement for animation
            this.lastVelocityX = velocityX;
            this.lastVelocityY = velocityY;
        } else {
            this.lastVelocityX = 0;
            this.lastVelocityY = 0;
        }
        
        // Update direction and animation based on intended movement
        this.updateDirectionAndAnimation(this.lastVelocityX, this.lastVelocityY);
        
        this.updatePotionEffects();
        this.updateStamina();
        
        this.mana = Math.min(this.maxMana, this.mana + 0.1);
    }
    
    updateStamina() {
        const currentTime = this.scene.time.now;
        const isMoving = Math.abs(this.lastVelocityX) > 5 || Math.abs(this.lastVelocityY) > 5;
        
        // If not moving or walking, regenerate stamina (with delay after running)
        if (!isMoving || this.isWalking) {
            const timeSinceLastDrain = currentTime - this.lastStaminaDrain;
            
            // Only regenerate if enough time has passed since last stamina drain
            if (timeSinceLastDrain > this.staminaRegenDelay) {
                const previousStamina = this.stamina;
                this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate);
                
                // If stamina reaches max and player was force-walking, auto-resume running
                if (this.wasForceWalking && this.stamina >= this.maxStamina) {
                    this.isWalking = false;
                    this.wasForceWalking = false;
                    // Update the UI button to reflect resumed running
                    if (this.scene.uiManager) {
                        this.scene.uiManager.updateWalkRunButton();
                    }
                }
            }
        }
        
        // If stamina is completely depleted and player tries to run, force walk
        if (this.stamina <= 0 && !this.isWalking) {
            this.isWalking = true;
            this.wasForceWalking = true; // Mark as force-walking for auto-resume
            // Update the UI button to reflect forced walking
            if (this.scene.uiManager) {
                this.scene.uiManager.updateWalkRunButton();
            }
        }
    }
    
    
    updateDirectionAndAnimation(velocityX, velocityY) {
        // Update direction even while casting, but handle animations differently
        const wasMoving = Math.abs(this.lastVelocity.x) > 5 || Math.abs(this.lastVelocity.y) > 5;
        
        const isMoving = Math.abs(velocityX) > 5 || Math.abs(velocityY) > 5;
        
        // Always update direction based on movement or mouse position
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
            
            // Update direction
            const oldDirection = this.currentDirection;
            this.currentDirection = newDirection;
            
            // If casting and direction changed, update the cast animation
            if (this.isCasting && oldDirection !== newDirection) {
                this.updateCastDirection();
            }
            
            // Only play movement animations if not casting
            if (!this.isCasting) {
                // Play appropriate movement animation based on walk/run toggle
                const movementKey = this.isWalking ? `sorcerer_walk_${newDirection}` : `sorcerer_run_${newDirection}`;
                const currentAnim = this.anims.currentAnim;
                
                // If direction changed during movement, preserve frame progress
                if (oldDirection !== newDirection && currentAnim && 
                    (currentAnim.key.includes('walk_') || currentAnim.key.includes('run_'))) {
                    this.updateMovementDirection(movementKey);
                }
                // Play movement animation if not already playing the correct one
                else if (!currentAnim || currentAnim.key !== movementKey) {
                    this.play(movementKey);
                }
            }
        } else {
            // Player stopped moving - play idle animation for current direction
            if (!this.isCasting) {
                const idleKey = `sorcerer_idle_${this.currentDirection}`;
                const currentAnim = this.anims.currentAnim;
                
                // Play idle animation if not already playing the correct one
                if (!currentAnim || currentAnim.key !== idleKey) {
                    this.play(idleKey);
                }
            }
        }
        
        // Store velocity for next frame
        this.lastVelocity.x = velocityX;
        this.lastVelocity.y = velocityY;
    }
    
    playCastAnimation() {
        // Stop all movement when casting begins (Movement-Restricted Casting)
        this.body.setVelocity(0);
        this.lastVelocityX = 0;
        this.lastVelocityY = 0;
        
        // Clear any pending movement targets in the scene
        if (this.scene.playerTarget) {
            this.scene.playerTarget = null;
        }
        
        // Update direction to face mouse before casting
        this.setDirectionFromMouse();
        
        // Play casting animation for current direction
        const castAnim = `sorcerer_cast_${this.currentDirection}`;
        if (this.scene.anims.exists(castAnim)) {
            this.isCasting = true;
            this.play(castAnim);
            
            // Return to idle animation when cast is complete
            this.once('animationcomplete', () => {
                this.isCasting = false;
                this.play(`sorcerer_idle_${this.currentDirection}`);
            });
        }
    }
    
    setDirectionFromMouse() {
        // Get mouse position and calculate direction from player to mouse
        const pointer = this.scene.input.activePointer;
        if (pointer) {
            const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const deltaX = worldPoint.x - this.x;
            const deltaY = worldPoint.y - this.y;
            
            // Only update if mouse is far enough away to avoid jittering
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 20) {
                // Calculate angle to determine 8-directional facing
                const angle = Math.atan2(deltaY, deltaX);
                const degreeAngle = (angle * 180 / Math.PI + 360) % 360;
                
                // Determine direction based on angle (8 directions)
                if (degreeAngle >= 337.5 || degreeAngle < 22.5) {
                    this.currentDirection = 'right';
                } else if (degreeAngle >= 22.5 && degreeAngle < 67.5) {
                    this.currentDirection = 'downright';
                } else if (degreeAngle >= 67.5 && degreeAngle < 112.5) {
                    this.currentDirection = 'down';
                } else if (degreeAngle >= 112.5 && degreeAngle < 157.5) {
                    this.currentDirection = 'downleft';
                } else if (degreeAngle >= 157.5 && degreeAngle < 202.5) {
                    this.currentDirection = 'left';
                } else if (degreeAngle >= 202.5 && degreeAngle < 247.5) {
                    this.currentDirection = 'upleft';
                } else if (degreeAngle >= 247.5 && degreeAngle < 292.5) {
                    this.currentDirection = 'up';
                } else if (degreeAngle >= 292.5 && degreeAngle < 337.5) {
                    this.currentDirection = 'upright';
                }
            }
        }
    }

    updateCastDirection() {
        // Update casting animation to face new direction while preserving frame progress
        if (this.isCasting) {
            const newCastAnim = `sorcerer_cast_${this.currentDirection}`;
            if (this.scene.anims.exists(newCastAnim)) {
                // Get current animation progress
                const currentAnim = this.anims.currentAnim;
                let currentFrameIndex = 0;
                let animProgress = 0;
                
                if (currentAnim && this.anims.currentFrame) {
                    // Calculate progress as a percentage
                    currentFrameIndex = this.anims.currentFrame.index;
                    const totalFrames = currentAnim.frames.length;
                    animProgress = currentFrameIndex / totalFrames;
                }
                
                // Remove the old animation complete listener to prevent conflicts
                this.off('animationcomplete');
                
                // Start the new direction cast animation
                this.play(newCastAnim);
                
                // Set the animation to the same relative progress
                if (this.anims.currentAnim && animProgress > 0) {
                    const newTotalFrames = this.anims.currentAnim.frames.length;
                    const targetFrame = Math.floor(animProgress * newTotalFrames);
                    
                    // Ensure targetFrame is within valid bounds
                    if (targetFrame >= 0 && targetFrame < newTotalFrames && this.anims.currentAnim.frames[targetFrame]) {
                        // Jump to the corresponding frame
                        this.anims.setCurrentFrame(this.anims.currentAnim.frames[targetFrame]);
                    }
                }
                
                // Re-add the completion listener for the new animation
                this.once('animationcomplete', () => {
                    this.isCasting = false;
                    this.play(`sorcerer_idle_${this.currentDirection}`);
                });
            }
        }
    }

    updateMovementDirection(newMovementKey) {
        // Update movement animation to face new direction while preserving frame progress
        if (this.scene.anims.exists(newMovementKey)) {
            // Get current animation progress
            const currentAnim = this.anims.currentAnim;
            let animProgress = 0;
            
            if (currentAnim && this.anims.currentFrame) {
                // Calculate progress as a percentage
                const currentFrameIndex = this.anims.currentFrame.index;
                const totalFrames = currentAnim.frames.length;
                animProgress = currentFrameIndex / totalFrames;
            }
            
            // Start the new direction movement animation
            this.play(newMovementKey);
            
            // Set the animation to the same relative progress
            if (this.anims.currentAnim && animProgress > 0) {
                const newTotalFrames = this.anims.currentAnim.frames.length;
                const targetFrame = Math.floor(animProgress * newTotalFrames);
                
                // Ensure targetFrame is within valid bounds
                if (targetFrame >= 0 && targetFrame < newTotalFrames && this.anims.currentAnim.frames[targetFrame]) {
                    // Jump to the corresponding frame
                    this.anims.setCurrentFrame(this.anims.currentAnim.frames[targetFrame]);
                }
            }
        }
    }

    castFireball(targetX, targetY) {
        const skill = this.skills.fireball;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('fireball');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        // Play casting animation
        this.playCastAnimation();
        
        const damage = this.getSkillDamage('fireball');
        new Fireball(this.scene, this.x, this.y, targetX, targetY, damage);
        return true;
    }
    
    castFrostNova() {
        const skill = this.skills.frostNova;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('frostNova');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        // Play casting animation
        this.playCastAnimation();
        
        const damage = this.getSkillDamage('frostNova');
        const radius = this.getSkillRadius('frostNova');
        new FrostNova(this.scene, this.x, this.y, damage, radius);
        return true;
    }
    
    castTeleport(targetX, targetY) {
        const skill = this.skills.teleport;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('teleport');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        // Create teleport effect using the new Teleport class
        new Teleport(this.scene, this, targetX, targetY);
        
        return true;
    }
    
    castChainLightning() {
        const skill = this.skills.chainLightning;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('chainLightning');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const damage = this.getSkillDamage('chainLightning');
        const chains = this.getSkillChains('chainLightning');
        const targets = this.scene.enemies.getChildren();
        
        new ChainLightning(this.scene, this.x, this.y, targets, damage, chains);
        return true;
    }
    
    castIceBolt(targetX, targetY) {
        const skill = this.skills.iceBolt;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('iceBolt');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const damage = this.getSkillDamage('iceBolt');
        const accuracy = this.getSkillAccuracy('iceBolt');
        
        new IceBolt(this.scene, this.x, this.y, targetX, targetY, damage, accuracy);
        return true;
    }
    
    castMeteor(targetX, targetY) {
        const skill = this.skills.meteor;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('meteor');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const damage = this.getSkillDamage('meteor');
        const impact = this.getSkillImpact('meteor');
        
        new Meteor(this.scene, this.x, this.y, targetX, targetY, damage, impact);
        return true;
    }
    
    // NEW OFFENSIVE SKILLS
    castLightningBolt(targetX, targetY) {
        const skill = this.skills.lightningBolt;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('lightningBolt');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const damage = this.getSkillDamage('lightningBolt');
        new LightningBolt(this.scene, this.x, this.y, targetX, targetY, damage);
        return true;
    }
    
    castBlizzard(targetX, targetY) {
        const skill = this.skills.blizzard;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('blizzard');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const damage = this.getSkillDamage('blizzard');
        const duration = skill.baseDuration + (skill.durationPerLevel * (skill.level - 1));
        const radius = skill.baseRadius + (skill.radiusPerLevel * (skill.level - 1));
        
        new Blizzard(this.scene, this.x, this.y, targetX, targetY, damage, duration, radius);
        return true;
    }
    
    castHydra(targetX, targetY) {
        const skill = this.skills.hydra;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('hydra');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const damage = this.getSkillDamage('hydra');
        const duration = skill.baseDuration + (skill.durationPerLevel * (skill.level - 1));
        const fireRate = Math.max(500, skill.baseFireRate - (skill.fireRateReduction * (skill.level - 1)));
        
        new Hydra(this.scene, targetX, targetY, damage, duration, fireRate);
        return true;
    }
    
    // NEW DEFENSIVE SKILLS
    castEnergyShield() {
        const skill = this.skills.energyShield;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) return false;
        if (currentTime - skill.lastUsed < skill.cooldown) return false;
        
        const manaCost = this.getSkillManaCost('energyShield');
        if (this.mana < manaCost) return false;
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const absorption = skill.baseAbsorption + (skill.absorptionPerLevel * (skill.level - 1));
        const duration = skill.baseDuration + (skill.durationPerLevel * (skill.level - 1));
        
        new EnergyShield(this.scene, this, absorption, duration);
        return true;
    }
    
    castThunderStorm() {
        const skill = this.skills.thunderStorm;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) {
            this.showSkillMessage("Thunder Storm not learned!", 0xff4444);
            return false;
        }
        if (currentTime - skill.lastUsed < skill.cooldown) {
            this.showSkillMessage("Thunder Storm on cooldown!", 0xffaa00);
            return false;
        }
        
        const manaCost = this.getSkillManaCost('thunderStorm');
        if (this.mana < manaCost) {
            this.showSkillMessage("Not enough mana!", 0x4444ff);
            return false;
        }
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const damage = this.getSkillDamage('thunderStorm');
        const duration = skill.baseDuration + (skill.durationPerLevel * (skill.level - 1));
        const strikeRate = Math.max(500, skill.baseStrikeRate - (skill.strikeRateReduction * (skill.level - 1)));
        
        new ThunderStorm(this.scene, this, damage, duration, strikeRate);
        return true;
    }
    
    showSkillMessage(message, color = 0xffffff) {
        const messageText = this.scene.add.text(this.x, this.y - 30, message, {
            fontSize: '14px',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setDepth(1000);
        
        this.scene.tweens.add({
            targets: messageText,
            y: messageText.y - 40,
            alpha: 0,
            duration: 2000,
            onComplete: () => messageText.destroy()
        });
    }
    
    castChillingArmor() {
        const skill = this.skills.chillingArmor;
        const currentTime = this.scene.time.now;
        
        if (skill.level === 0) {
            this.showSkillMessage("Chilling Armor not learned!", 0xff4444);
            return false;
        }
        if (currentTime - skill.lastUsed < skill.cooldown) {
            this.showSkillMessage("Chilling Armor on cooldown!", 0xffaa00);
            return false;
        }
        
        const manaCost = this.getSkillManaCost('chillingArmor');
        if (this.mana < manaCost) {
            this.showSkillMessage("Not enough mana!", 0x4444ff);
            return false;
        }
        
        skill.lastUsed = currentTime;
        this.mana -= manaCost;
        
        const chillDamage = skill.baseChillDamage + (skill.chillDamagePerLevel * (skill.level - 1));
        const chillDuration = skill.baseChillDuration + (skill.chillDurationPerLevel * (skill.level - 1));
        const armorDuration = skill.baseArmorDuration + (skill.armorDurationPerLevel * (skill.level - 1));
        
        new ChillingArmor(this.scene, this, chillDamage, chillDuration, armorDuration);
        return true;
    }
    
    takeDamage(amount) {
        // Don't take damage if invulnerable (during transitions)
        if (this.isInvulnerable) {
            return;
        }
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        // Prevent further input and movement
        this.isDead = true;
        this.body.setVelocity(0);
        
        // Stop all current actions
        this.isCasting = false;
        if (this.castingSkill) {
            this.castingSkill = null;
        }
        
        // Play death animation first
        this.playDeathAnimation();
        
        // Calculate experience penalty based on level and world
        const experienceLost = this.calculateDeathPenalty();
        this.experience = Math.max(0, this.experience - experienceLost);
        
        // Check if we need to delevel
        this.checkDelevel();
        
        // Gather death data
        const deathData = {
            level: this.level,
            experienceLost: experienceLost,
            currentExperience: this.experience,
            worldLevel: this.scene.currentWorldLevel || 1
        };
        
        // Wait for death animation to finish (3 seconds), then show death screen
        this.scene.time.delayedCall(3000, () => {
            // Fade out game scene
            this.scene.cameras.main.fadeOut(800, 0, 0, 0);
            
            this.scene.time.delayedCall(800, () => {
                // Pause game scene and launch death screen
                this.scene.scene.pause('GameScene');
                this.scene.scene.launch('DeathScreen', deathData);
            });
        });
    }
    
    playDeathAnimation() {
        // Get current direction for death animation
        const dir = this.currentDirection;
        const deathAnimKey = `sorcerer_death_${dir}`;
        
        // Play death animation if it exists
        if (this.scene.anims.exists(deathAnimKey)) {
            this.play(deathAnimKey);
        } else {
            console.warn(`Death animation ${deathAnimKey} not found`);
            // Fallback: just fade out
            this.scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: 2000,
                ease: 'Power2'
            });
        }
    }
    
    calculateDeathPenalty() {
        // Diablo 2-style death penalty: lose percentage of experience needed for next level
        // Penalty increases with level and world difficulty
        const basePercentage = 0.05; // 5% base penalty
        const levelMultiplier = Math.min(this.level * 0.01, 0.15); // Up to 15% additional based on level
        const worldMultiplier = Math.min((this.scene.currentWorldLevel - 1) * 0.02, 0.10); // Up to 10% based on world
        
        const totalPercentage = basePercentage + levelMultiplier + worldMultiplier;
        
        // Safety checks to prevent NaN
        const safeExperience = this.experience || 0;
        const safeExperienceToNext = this.experienceToNext || 100;
        
        // Calculate experience needed for next level more safely
        const currentLevelProgress = safeExperience % safeExperienceToNext;
        const experienceForNextLevel = safeExperienceToNext - currentLevelProgress;
        
        const penalty = Math.floor(experienceForNextLevel * totalPercentage);
        
        // Ensure penalty is never NaN or negative
        return Math.max(0, isNaN(penalty) ? 0 : penalty);
    }
    
    checkDelevel() {
        // Check if we need to delevel due to experience loss
        while (this.level > 1 && this.experience < this.getExperienceForLevel(this.level - 1)) {
            this.level--;
            this.statPoints += 5; // Give back stat points for delevel
            this.skillPoints += 1; // Give back skill point for delevel
            this.updateDerivedStats();
        }
        
        // Recalculate experience to next level
        this.experienceToNext = this.getExperienceForLevel(this.level);
    }
    
    getExperienceForLevel(level) {
        // Calculate total experience needed to reach a specific level
        let totalExperience = 0;
        for (let i = 1; i < level; i++) {
            totalExperience += Math.floor(100 * Math.pow(1.1, i - 1));
        }
        return totalExperience;
    }
    
    destroy() {
        super.destroy();
    }
}