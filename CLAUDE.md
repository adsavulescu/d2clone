# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start the development server:**
```bash
npm start
```
This runs `http-server -c-1 -p 8080` and serves the game at http://localhost:8080

**Install dependencies:**
```bash
npm install
```

## Architecture Overview

This is a Diablo 2-inspired action RPG prototype built with Phaser.js 3.70.0. The game uses a modular class-based architecture with the following key components:

### Core Game Structure
- **Entry Point**: `index.html` loads Phaser.js from CDN and all game scripts in dependency order
- **Game Configuration**: `js/game.js` contains the main Phaser game config (1024x768, arcade physics)
- **Scene Management**: Two main scenes - `Preloader` for asset generation and `GameScene` for gameplay

### Entity System
- **Player**: `js/entities/Player.js` - Main character with health/mana, movement, and skill casting
- **Enemy**: `js/entities/Enemy.js` - AI-driven enemies that pursue and attack the player
- **Skills**: `js/skills/` directory contains spell implementations (Fireball.js, FrostNova.js)

### World Generation
- **WorldGenerator**: `js/world/WorldGenerator.js` - Procedural world generation using Perlin noise
- Creates terrain tiles (grass, dirt, stone) and provides spawn positions for enemies

### Key Gameplay Systems

#### RPG Systems
- **Experience & Leveling**: Players gain XP from killing enemies, level up awards 5 stat points + 1 skill point
- **Stats System**: Four core stats (Strength, Dexterity, Vitality, Energy) affect health, mana, damage, and speed
- **Skills System**: Scalable skills with levels 1-20, mana costs, cooldowns, and damage that increases per level
- **Inventory**: 10x4 grid (40 slots) for storing items and equipment
- **Equipment**: 10 equipment slots (helmet, armor, weapon, shield, boots, gloves, belt, 2 rings, amulet)

#### Combat & Skills
- **Movement**: Left-click to move, with visual target indicators
- **Combat**: Right-click to cast Fireball, Space for Frost Nova, Middle-click for Teleport
- **Skills**: Fireball (ranged projectile), Frost Nova (AoE freeze), Teleport (instant movement)
- **Hotbar**: 8-slot hotbar for skills and consumables (keys 1-8)

#### Items & Equipment
- **Item Rarities**: Normal (white), Magic (blue), Rare (yellow), Unique (brown)
- **Item Types**: Weapons, armor, accessories, and consumables (potions)
- **Item Properties**: Damage, armor, stat bonuses, resistances
- **Item Drops**: Enemies drop items based on level and rarity chances

#### UI System
- **Experience Bar**: Top center, shows current XP and level
- **Character Sheet**: Press 'C' - displays stats, allows stat point allocation
- **Inventory**: Press 'I' - shows 40-slot item grid
- **Skills Tree**: Press 'S' - upgrade skills with skill points
- **Enhanced Hotbar**: 8 slots with skill icons, cooldown indicators, and hotkeys

### Asset Generation
The game generates all sprites procedurally in `Preloader.js` using Phaser graphics:
- Player: Blue circle (32x32)
- Enemy: Red circle (24x24)
- Fireball: Orange circle (16x16) with particle effects
- Frost Nova: Light blue circle (128x128)
- Terrain tiles: Colored rectangles (32x32)

### Physics and Collision
- Uses Phaser Arcade Physics
- Enemies collide with each other but not with player (for attack mechanics)
- Skill projectiles have overlap detection with enemies

### File Loading Order (Critical)
Scripts must be loaded in this exact order in index.html:
1. Preloader.js
2. Item.js (new item system)
3. UIManager.js (new UI system)
4. GameScene.js  
5. Player.js
6. Enemy.js
7. Fireball.js
8. FrostNova.js
9. WorldGenerator.js
10. game.js

### New File Structure
```
js/
├── entities/
│   ├── Player.js (expanded with RPG systems)
│   └── Enemy.js (now drops items and XP)
├── items/
│   └── Item.js (complete item system)
├── ui/
│   └── UIManager.js (inventory, character sheet, skills)
├── skills/ (existing)
├── scenes/ (existing)
└── world/ (existing)
```

## Development Notes

### Core Systems Implementation
- **Player Stats**: Stats affect derived values (health = 50 + vitality*4 + level*2)
- **Experience Formula**: Next level XP requirement increases by 10% each level
- **Enemy Scaling**: Enemy level = player level ± 1, with stats scaling accordingly
- **Item Generation**: Procedural item generation with rarity-based property counts
- **UI Management**: Centralized UIManager handles all interface panels and interactions

### Controls Reference
- **Movement**: Left-click
- **Attack**: Right-click (Fireball)  
- **Special**: Space (Frost Nova), Middle-click (Teleport)
- **Interface**: I (Inventory), C (Character), S (Skills), ESC (Close all)
- **Hotbar**: Keys 1-8 for hotbar slots

### Technical Details
- No external image assets required - all sprites generated programmatically
- Game world is 50x50 tiles (1600x1600 pixels) 
- Camera follows player with world bounds
- Uses ES6 classes extending Phaser base classes
- Item drops use physics overlap detection for pickup
- All UI panels use depth layering (2000+) to appear above game elements
- Game Over screen appears when player dies, press R to restart