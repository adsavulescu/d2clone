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
                break;
            case 'armor':
                this.properties.armor = 10 + (this.level * 3);
                break;
            case 'helmet':
                this.properties.armor = 5 + this.level;
                break;
            case 'boots':
                this.properties.armor = 3 + this.level;
                this.properties.moveSpeed = 5;
                break;
            case 'gloves':
                this.properties.armor = 2 + this.level;
                this.properties.attackSpeed = 5;
                break;
            case 'belt':
                this.properties.armor = 2 + this.level;
                this.properties.life = 10 + (this.level * 2);
                break;
            case 'ring':
                // Rings have various random bonuses
                break;
            case 'amulet':
                this.properties.mana = 10 + (this.level * 2);
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
    
    getTooltipText() {
        let tooltip = [];
        tooltip.push(`${this.name} (Level ${this.level})`);
        tooltip.push('');
        
        if (this.properties.damage > 0) {
            tooltip.push(`Damage: ${this.properties.damage}`);
        }
        if (this.properties.armor > 0) {
            tooltip.push(`Armor: ${this.properties.armor}`);
        }
        
        // Add stat bonuses
        ['strength', 'dexterity', 'vitality', 'energy'].forEach(stat => {
            if (this.properties[stat] > 0) {
                tooltip.push(`+${this.properties[stat]} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
            }
        });
        
        if (this.properties.life > 0) {
            tooltip.push(`+${this.properties.life} Life`);
        }
        if (this.properties.mana > 0) {
            tooltip.push(`+${this.properties.mana} Mana`);
        }
        
        // Special item effects
        if (this.type === 'potion') {
            if (this.healAmount) {
                tooltip.push(`Restores ${this.healAmount} Health`);
            }
            if (this.manaAmount) {
                tooltip.push(`Restores ${this.manaAmount} Mana`);
            }
        }
        
        return tooltip;
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