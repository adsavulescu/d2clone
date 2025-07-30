class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.setScale(1);
        this.setDepth(200); // Ensure player is above everything including town hall
        
        // Movement direction tracking
        this.currentDirection = 'down';
        this.lastVelocity = { x: 0, y: 0 };
        
        // Setup directional animations
        this.setupAnimations();
        
        // Invulnerability for transitions
        this.isInvulnerable = false;
        
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
        
        // Skills system - 6 sorcerer skills with stat scaling
        this.skills = {
            fireball: {
                level: 1,
                maxLevel: 20,
                cooldown: 500,
                lastUsed: 0,
                baseDamage: 10,
                damagePerLevel: 5,
                baseManaCost: 5,
                manaCostPerLevel: 1,
                statScaling: { energy: 0.2 }
            },
            teleport: {
                level: 0,
                maxLevel: 20,
                cooldown: 2000,
                lastUsed: 0,
                baseManaCost: 20,
                manaCostPerLevel: 1,
                statScaling: { energy: 0.1 }
            },
            frostNova: {
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
                statScaling: { energy: 0.15 }
            },
            chainLightning: {
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
                statScaling: { energy: 0.25 }
            },
            iceBolt: {
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
                statScaling: { energy: 0.1, dexterity: 0.3 }
            },
            meteor: {
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
                statScaling: { energy: 0.2, strength: 0.4 }
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
        // Create animations for different directions
        if (!this.scene.anims.exists('sorcerer_walk_down')) {
            this.scene.anims.create({
                key: 'sorcerer_walk_down',
                frames: [{ key: 'sorcerer_down' }],
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('sorcerer_walk_up')) {
            this.scene.anims.create({
                key: 'sorcerer_walk_up',
                frames: [{ key: 'sorcerer_up' }],
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('sorcerer_walk_left')) {
            this.scene.anims.create({
                key: 'sorcerer_walk_left',
                frames: [{ key: 'sorcerer_left' }],
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('sorcerer_walk_right')) {
            this.scene.anims.create({
                key: 'sorcerer_walk_right',
                frames: [{ key: 'sorcerer_right' }],
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('sorcerer_idle')) {
            this.scene.anims.create({
                key: 'sorcerer_idle',
                frames: [{ key: 'sorcerer_down' }],
                frameRate: 1,
                repeat: 0
            });
        }
        
        // Start with idle animation
        this.play('sorcerer_idle');
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
        
        // Ensure current health/mana don't exceed new maximums
        this.health = Math.min(this.health, this.maxHealth);
        this.mana = Math.min(this.mana, this.maxMana);
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
        
        // Heal player on level up
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        
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
        let newVelocityX = 0;
        let newVelocityY = 0;
        
        if (targetPosition && Phaser.Math.Distance.Between(this.x, this.y, targetPosition.x, targetPosition.y) > 10) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, targetPosition.x, targetPosition.y);
            newVelocityX = Math.cos(angle) * this.speed;
            newVelocityY = Math.sin(angle) * this.speed;
            this.setVelocity(newVelocityX, newVelocityY);
        } else {
            this.setVelocity(0);
        }
        
        // Update direction and animation based on movement
        this.updateDirectionAndAnimation(newVelocityX, newVelocityY);
        
        this.updatePotionEffects();
        
        this.mana = Math.min(this.maxMana, this.mana + 0.1);
    }
    
    updateDirectionAndAnimation(velocityX, velocityY) {
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
                this.play(`sorcerer_walk_${newDirection}`);
            } else if (!this.anims.isPlaying) {
                // Resume walking animation if it stopped
                this.play(`sorcerer_walk_${newDirection}`);
            }
        } else {
            // Player stopped moving - play idle animation
            if (this.anims.currentAnim && this.anims.currentAnim.key !== 'sorcerer_idle') {
                this.play('sorcerer_idle');
            }
        }
        
        // Store velocity for next frame
        this.lastVelocity.x = velocityX;
        this.lastVelocity.y = velocityY;
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
        
        // Teleport effect
        this.setPosition(targetX, targetY);
        
        // Visual teleport effect
        const teleportEffect = this.scene.add.graphics();
        teleportEffect.fillStyle(0x0088ff, 0.8);
        teleportEffect.fillCircle(targetX, targetY, 30);
        teleportEffect.setDepth(100);
        
        this.scene.time.delayedCall(300, () => {
            teleportEffect.destroy();
        });
        
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
    
    takeDamage(amount) {
        // Don't take damage if invulnerable (during transitions)
        if (this.isInvulnerable) {
            return;
        }
        
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
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
    
    destroy() {
        super.destroy();
    }
}