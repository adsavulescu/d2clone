class Item {
    constructor(type, name, level = 1) {
        this.type = type; // 'weapon', 'armor', 'helmet', 'boots', 'gloves', 'belt', 'ring', 'amulet', 'potion', 'scroll'
        this.name = name;
        this.level = level;
        this.rarity = 'normal'; // normal, magic, rare, unique
        this.stackable = false;
        this.stackSize = 1;
        this.maxStackSize = 1;
        
        // Base properties
        this.properties = {
            damage: 0,
            armor: 0,
            strength: 0,
            dexterity: 0,
            vitality: 0,
            energy: 0,
            life: 0,
            mana: 0,
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
        
        // Stat requirements (Diablo 2 style)
        this.requirements = {
            strength: 0,
            dexterity: 0,
            level: this.level
        };
        
        // Equipment slot (null if not equippable)
        this.equipSlot = this.getEquipSlot();
        
        // Generate base stats based on type and level
        this.generateBaseStats();
        
        // Generate random properties based on rarity
        this.generateRandomProperties();
    }
    
    getEquipSlot() {
        const slotMap = {
            'weapon': 'weapon',
            'armor': 'armor',
            'helmet': 'helmet',
            'boots': 'boots',
            'gloves': 'gloves',
            'belt': 'belt',
            'ring': 'ring1', // Default to ring1, can be ring2
            'amulet': 'amulet',
            'shield': 'shield'
        };
        return slotMap[this.type] || null;
    }
    
    generateBaseStats() {
        switch (this.type) {
            case 'weapon':
                this.properties.damage = 5 + (this.level * 2);
                // Weapons require strength and some dexterity
                this.requirements.strength = Math.max(8, this.level * 3);
                this.requirements.dexterity = Math.max(3, this.level);
                break;
            case 'armor':
                this.properties.armor = 10 + (this.level * 3);
                // Heavy armor requires high strength
                this.requirements.strength = Math.max(12, this.level * 4);
                break;
            case 'helmet':
                this.properties.armor = 5 + this.level;
                // Light strength requirement
                this.requirements.strength = Math.max(5, this.level * 2);
                break;
            case 'boots':
                this.properties.armor = 3 + this.level;
                this.properties.moveSpeed = 5;
                // Minimal requirements
                this.requirements.strength = Math.max(3, this.level);
                break;
            case 'gloves':
                this.properties.armor = 2 + this.level;
                this.properties.attackSpeed = 5;
                // Dexterity for attack speed
                this.requirements.dexterity = Math.max(5, this.level * 2);
                break;
            case 'belt':
                this.properties.armor = 2 + this.level;
                this.properties.life = 10 + (this.level * 2);
                // Light strength requirement
                this.requirements.strength = Math.max(4, this.level);
                break;
            case 'shield':
                this.properties.armor = 8 + (this.level * 2);
                // Shields require strength and dexterity
                this.requirements.strength = Math.max(10, this.level * 3);
                this.requirements.dexterity = Math.max(5, this.level);
                break;
            case 'ring':
                // Rings have various random bonuses, no requirements
                break;
            case 'amulet':
                this.properties.mana = 10 + (this.level * 2);
                // No requirements for amulets
                break;
            case 'potion':
                this.stackable = true;
                this.maxStackSize = 20;
                this.stackSize = 1;
                
                // Calculate healing amounts based on tier
                const tier = this.level;
                if (this.name.includes('Healing')) {
                    // Health potions: base 30, +20 per tier
                    this.healAmount = 30 + (tier * 20);
                } else if (this.name.includes('Mana')) {
                    // Mana potions: base 20, +15 per tier
                    this.manaAmount = 20 + (tier * 15);
                }
                break;
        }
    }
    
    generateRandomProperties() {
        // Only generate random properties for magic+ items
        if (this.rarity === 'normal') return;
        
        const propertyCount = this.rarity === 'magic' ? 1 : 
                            this.rarity === 'rare' ? Phaser.Math.Between(2, 4) : 6;
        
        for (let i = 0; i < propertyCount; i++) {
            this.addRandomProperty();
        }
    }
    
    addRandomProperty() {
        const properties = ['strength', 'dexterity', 'vitality', 'energy', 'life', 'mana'];
        const property = Phaser.Math.RND.pick(properties);
        const value = Phaser.Math.Between(1, this.level * 2);
        
        this.properties[property] += value;
    }
    
    getDisplayName() {
        const rarityColors = {
            'normal': '#ffffff',
            'magic': '#4444ff',
            'rare': '#ffff44',
            'unique': '#8b4513'
        };
        
        return {
            text: this.name,
            color: rarityColors[this.rarity]
        };
    }
    
    canPlayerUse(player) {
        // Check if player meets all requirements
        return (
            player.level >= this.requirements.level &&
            player.strength >= this.requirements.strength &&
            player.dexterity >= this.requirements.dexterity
        );
    }
    
    getTooltipData(player = null) {
        // Return structured tooltip data for Diablo 2-style rendering
        const tooltipData = {
            name: this.name,
            rarity: this.rarity,
            type: this.type,
            level: this.level,
            sections: []
        };
        
        // Item type and level section
        tooltipData.sections.push({
            type: 'header',
            lines: [
                { text: this.name, color: this.getRarityColor(), size: 'large' },
                { text: this.getItemTypeDisplay(), color: '#c0c0c0', size: 'small' }
            ]
        });
        
        // Core stats section (damage, armor, etc.)
        const coreStats = [];
        if (this.properties.damage > 0) {
            coreStats.push({ text: `One-Hand Damage: ${this.properties.damage}`, color: '#ffffff' });
        }
        if (this.properties.armor > 0) {
            coreStats.push({ text: `Defense: ${this.properties.armor}`, color: '#ffffff' });
        }
        
        if (coreStats.length > 0) {
            tooltipData.sections.push({
                type: 'stats',
                lines: coreStats
            });
        }
        
        // Properties section (bonuses) - comes before requirements in Diablo 2
        const bonuses = [];
        ['strength', 'dexterity', 'vitality', 'energy'].forEach(stat => {
            if (this.properties[stat] > 0) {
                bonuses.push({ 
                    text: `+${this.properties[stat]} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`, 
                    color: '#8080ff' 
                });
            }
        });
        
        if (this.properties.life > 0) {
            bonuses.push({ text: `+${this.properties.life} to Life`, color: '#ff6060' });
        }
        if (this.properties.mana > 0) {
            bonuses.push({ text: `+${this.properties.mana} to Mana`, color: '#6060ff' });
        }
        if (this.properties.moveSpeed > 0) {
            bonuses.push({ text: `+${this.properties.moveSpeed}% Faster Run/Walk`, color: '#c0c0c0' });
        }
        if (this.properties.attackSpeed > 0) {
            bonuses.push({ text: `+${this.properties.attackSpeed}% Increased Attack Speed`, color: '#c0c0c0' });
        }
        
        // Add resistance bonuses
        Object.keys(this.properties.resistance).forEach(resistType => {
            const value = this.properties.resistance[resistType];
            if (value > 0) {
                const resistName = resistType.charAt(0).toUpperCase() + resistType.slice(1);
                bonuses.push({ text: `+${value}% ${resistName} Resist`, color: '#c0c0c0' });
            }
        });
        
        if (bonuses.length > 0) {
            tooltipData.sections.push({
                type: 'bonuses',
                lines: bonuses
            });
        }
        
        // Requirements section (comes after bonuses in Diablo 2)
        const requirements = [];
        if (this.requirements.level > 1) {
            const canUseLevel = !player || player.level >= this.requirements.level;
            requirements.push({ 
                text: `Level: ${this.requirements.level}`, 
                color: canUseLevel ? '#ffffff' : '#ff6060' 
            });
        }
        if (this.requirements.strength > 0) {
            const canUseStr = !player || player.strength >= this.requirements.strength;
            requirements.push({ 
                text: `Strength: ${this.requirements.strength}`, 
                color: canUseStr ? '#ffffff' : '#ff6060' 
            });
        }
        if (this.requirements.dexterity > 0) {
            const canUseDex = !player || player.dexterity >= this.requirements.dexterity;
            requirements.push({ 
                text: `Dexterity: ${this.requirements.dexterity}`, 
                color: canUseDex ? '#ffffff' : '#ff6060' 
            });
        }
        
        if (requirements.length > 0) {
            tooltipData.sections.push({
                type: 'requirements',
                title: { text: 'Requirements:', color: '#c0c0c0' },
                lines: requirements
            });
        }
        
        // Special effects for potions
        if (this.type === 'potion') {
            const effects = [];
            if (this.healAmount) {
                effects.push({ text: `Restores ${this.healAmount} Health`, color: '#ff6060' });
            }
            if (this.manaAmount) {
                effects.push({ text: `Restores ${this.manaAmount} Mana`, color: '#6060ff' });
            }
            
            if (effects.length > 0) {
                tooltipData.sections.push({
                    type: 'effects',
                    lines: effects
                });
            }
        }
        
        return tooltipData;
    }
    
    getRarityColor() {
        const colors = {
            'normal': '#ffffff',
            'magic': '#6060ff',
            'rare': '#ffff00',
            'unique': '#c08040'
        };
        return colors[this.rarity] || '#ffffff';
    }
    
    getItemTypeDisplay() {
        const typeNames = {
            'weapon': 'Weapon',
            'armor': 'Body Armor',
            'helmet': 'Helm',
            'boots': 'Boots',
            'gloves': 'Gloves',
            'belt': 'Belt',
            'shield': 'Shield',
            'ring': 'Ring',
            'amulet': 'Amulet',
            'potion': 'Potion'
        };
        return typeNames[this.type] || this.type;
    }
    
    getTooltipText() {
        // Legacy method for backward compatibility
        const data = this.getTooltipData();
        let tooltip = [];
        
        data.sections.forEach(section => {
            if (section.title) {
                tooltip.push(section.title.text);
            }
            section.lines.forEach(line => {
                tooltip.push(line.text);
            });
            tooltip.push(''); // Add spacing between sections
        });
        
        return tooltip.filter(line => line !== ''); // Remove empty lines at end
    }
    
    use(player) {
        if (this.type === 'potion') {
            const currentTime = player.scene.time.now;
            
            if (this.name.includes('Healing')) {
                // Check health potion cooldown
                if (!player.canUseHealthPotion()) {
                    return false; // Still on cooldown
                }
                
                // Add gradual healing over time
                player.addHealingOverTime(this.healAmount, 2000); // 2 seconds duration
                player.lastHealthPotionUsed = currentTime;
                return true;
            } else if (this.name.includes('Mana')) {
                // Check mana potion cooldown
                if (!player.canUseManaPotion()) {
                    return false; // Still on cooldown
                }
                
                // Add gradual mana restoration over time
                player.addManaRestoreOverTime(this.manaAmount, 2000); // 2 seconds duration
                player.lastManaPotionUsed = currentTime;
                return true;
            }
        }
        return false;
    }
    
    canStackWith(otherItem) {
        return this.stackable && 
               otherItem.stackable && 
               this.name === otherItem.name && 
               this.level === otherItem.level &&
               this.stackSize < this.maxStackSize;
    }
    
    static generateRandomItem(level = 1, qualityBonus = 0) {
        const itemTypes = [
            { type: 'weapon', names: ['Sword', 'Axe', 'Mace', 'Dagger', 'Staff'] },
            { type: 'armor', names: ['Leather Armor', 'Chain Mail', 'Plate Mail'] },
            { type: 'helmet', names: ['Cap', 'Helm', 'Crown'] },
            { type: 'boots', names: ['Boots', 'Heavy Boots', 'War Boots'] },
            { type: 'gloves', names: ['Gloves', 'Gauntlets', 'Heavy Gloves'] },
            { type: 'belt', names: ['Belt', 'Heavy Belt', 'War Belt'] },
            { type: 'ring', names: ['Ring', 'Band', 'Circle'] },
            { type: 'amulet', names: ['Amulet', 'Pendant', 'Charm'] }
        ];
        
        const selectedType = Phaser.Math.RND.pick(itemTypes);
        const itemName = Phaser.Math.RND.pick(selectedType.names);
        
        const item = new Item(selectedType.type, itemName, level);
        
        // Determine rarity with quality bonus
        const rarityRoll = Math.random();
        const bonusRoll = rarityRoll - qualityBonus; // Lower values = better rarity
        
        if (bonusRoll < 0.4) {
            item.rarity = 'normal';
        } else if (bonusRoll < 0.7) {
            item.rarity = 'magic';
        } else if (bonusRoll < 0.9) {
            item.rarity = 'rare';
        } else {
            item.rarity = 'unique';
        }
        
        // Regenerate properties with new rarity
        item.generateRandomProperties();
        
        return item;
    }
    
    static createPotion(type, level = 1) {
        const potionTiers = {
            1: { prefix: 'Minor', color: '#cccccc' },
            2: { prefix: 'Lesser', color: '#cccccc' },
            3: { prefix: 'Light', color: '#4444ff' },
            4: { prefix: 'Healing', color: '#4444ff' },
            5: { prefix: 'Greater', color: '#ffff44' },
            6: { prefix: 'Super', color: '#ffff44' },
            7: { prefix: 'Full', color: '#8b4513' },
            8: { prefix: 'Perfect', color: '#8b4513' }
        };
        
        const tier = Math.min(8, Math.max(1, level));
        const tierInfo = potionTiers[tier];
        
        const potionNames = {
            'health': `${tierInfo.prefix} Healing Potion`,
            'mana': `${tierInfo.prefix} Mana Potion`
        };
        
        const potion = new Item('potion', potionNames[type], level);
        potion.potionTier = tier;
        potion.tierColor = tierInfo.color;
        
        return potion;
    }
}