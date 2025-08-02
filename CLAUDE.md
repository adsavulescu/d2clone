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
- **Game Configuration**: `js/game.js` contains the main Phaser game config (1600x880, arcade physics)
- **Scene Management**: Four main scenes:
  - `StartScreen` - Main menu with game title, instructions, and start button
  - `Preloader` - Asset generation and loading
  - `GameScene` - Main gameplay with statistics tracking
  - `EndGameScreen` - Game over screen with final statistics and score

### Entity System
- **Player**: `js/entities/Player.js` - Sorcerer character with health/mana, movement, directional sprites, and skill casting
- **Enemy**: `js/entities/Enemy.js` - Skeletal warriors with AI that pursue and attack the player
- **Skills**: `js/skills/` directory contains spell implementations (Fireball.js, FrostNova.js, ChainLightning.js, IceBolt.js, Meteor.js)

### World Generation
- **WorldGenerator**: `js/world/WorldGenerator.js` - Procedural world generation using Perlin noise
- Creates terrain tiles (grass, dirt, stone) and provides spawn positions for enemies
- World transitions through portal system with level scaling

### Key Gameplay Systems

#### RPG Systems
- **Experience & Leveling**: Players gain XP from killing enemies, level up awards 5 stat points + 1 skill point
- **Stats System**: Four core stats (Strength, Dexterity, Vitality, Energy) affect health, mana, damage, and speed
- **Skills System**: Complete sorcerer skill system with 17 skills across 3 tabs:
  - **Offensive Tab** (7 skills): Fireball, Ice Bolt, Chain Lightning, Meteor, Lightning Bolt, Blizzard, Hydra
  - **Defensive Tab** (5 skills): Frost Nova, Teleport, Energy Shield, Thunder Storm, Chilling Armor  
  - **Passive Tab** (6 skills): Warmth, Static Field, Fire/Cold/Lightning Resistances, Mastery
- **Inventory**: 6x7 grid (42 slots) for storing items and equipment
- **Equipment**: 10 equipment slots (helmet, armor, weapon, shield, boots, gloves, belt, 2 rings, amulet)

#### Combat & Skills
- **Movement**: Left-click to move with directional animations (sorcerer sprites for up/down/left/right)
- **Combat**: Right-click for Fireball (default), various skills available through hotbar system
- **Skills**: 17 total skills with unique mechanics:
  - **Offensive**: Projectiles, area effects, summoned creatures
  - **Defensive**: Shields, teleportation, damage auras
  - **Passive**: Permanent bonuses and resistances
- **Hotbar System**: Three sections - potion hotbar (Q/E), mouse hotbar (LMB/MMB/RMB), skills hotbar (1-4)

#### Items & Equipment
- **Item Rarities**: Normal (white), Magic (blue), Rare (yellow), Unique (brown)
- **Item Types**: Weapons, armor, accessories, and consumables (potions with over-time effects)
- **Item Properties**: Damage, armor, stat bonuses, resistances
- **Item Drops**: Enemies drop items based on level and rarity chances

#### UI System
- **Experience Bar**: Managed by UIManager
- **Character Sheet**: Press 'C' - displays stats, allows stat point allocation
- **Inventory**: Press 'I' - shows 42-slot item grid
- **Skills Tree**: Press 'S' - upgrade skills with skill points
- **Enhanced Hotbar**: Multiple hotbar sections with skill icons and cooldown indicators

### Asset Generation
The game generates all sprites procedurally in `Preloader.js` using Phaser graphics:
- Player: Detailed sorcerer sprites for 4 directions (32x32) with robes, hood, and staff
- Enemy: Detailed skeletal warrior sprites for 4 directions (24x24) with bones, weapons, shields
- Skills: Various colored circles and shapes for different spells
- Terrain tiles: Colored rectangles (32x32)

### Physics and Collision

#### Component-Based Collision System
The game uses a robust component-based collision system with event-driven architecture:

**Core Components:**
- **CollisionEventBus**: Central event system for collision notifications
- **Collidable**: Base class for all entities with collision (extends Phaser.GameObjects.Sprite)
- **CollisionRegistry**: Manages collision groups and rules

**Collision Groups:**
- `PLAYER` - Player character
- `ENEMY` - All enemy types
- `PLAYER_PROJECTILE` - Player-cast projectiles
- `ENEMY_PROJECTILE` - Enemy-cast projectiles  
- `WALL` - World boundaries and obstacles
- `ITEM` - Dropped items (click-to-pickup)
- `PORTAL` - World transition portals
- `AREA_EFFECT` - AoE skills like Frost Nova

**Event System:**
All collision events are broadcast through CollisionEventBus:
- `PLAYER_ENEMY` - Player/enemy collision
- `PROJECTILE_ENEMY` - Projectile hits enemy
- `PLAYER_ITEM` - Item pickup events
- `PLAYER_PORTAL` - Portal entry/world transition

**Implementation Notes:**
- Enemies collide with each other but overlap with player (for attack mechanics)
- All entities extending Collidable get automatic collision lifecycle management
- Collision handlers support enter/stay/exit events
- Registry handles cleanup during world transitions

### File Loading Order (Critical)
Scripts must be loaded in this exact order in index.html:
1. StartScreen.js (main menu scene)
2. Preloader.js (asset generation)
3. DeathScreen.js (death/respawn scene)
4. EndGameScreen.js (game over scene)
5. CollisionEventBus.js (collision event system)
6. Collidable.js (base collision class)
7. CollisionRegistry.js (collision management)
8. Item.js (complete item system)
9. UIManager.js (comprehensive UI system)
10. Fireball.js (and all other skill files)
11. GameScene.js (main gameplay scene)
12. Player.js
13. Enemy.js
14. WorldGenerator.js
15. game.js

### File Structure
```
js/
├── entities/
│   ├── Player.js (comprehensive RPG systems, stats, skills, inventory)
│   └── Enemy.js (AI-driven skeletal warriors with level scaling)
├── items/
│   └── Item.js (complete item system with rarities, properties, potions)
├── ui/
│   └── UIManager.js (handles all UI panels and interactions)
├── systems/
│   ├── CollisionEventBus.js (event-driven collision handling)
│   ├── Collidable.js (base class for collidable entities)
│   └── CollisionRegistry.js (collision group management)
├── skills/
│   ├── Fireball.js (offensive projectile)
│   ├── IceBolt.js (piercing ice projectile)
│   ├── ChainLightning.js (jumping lightning)
│   ├── Meteor.js (delayed area damage)
│   ├── LightningBolt.js (fast piercing bolt)
│   ├── Blizzard.js (persistent area damage)
│   ├── Hydra.js (summoned attacking creature)
│   ├── FrostNova.js (defensive freeze nova)
│   ├── EnergyShield.js (mana-based damage absorption)
│   ├── ThunderStorm.js (area lightning strikes)
│   └── ChillingArmor.js (retaliatory ice armor)
├── scenes/
│   ├── StartScreen.js (main menu with instructions and atmospheric effects)
│   ├── Preloader.js (generates all game sprites procedurally)
│   ├── GameScene.js (main game scene with world transitions and statistics tracking)
│   ├── DeathScreen.js (death and respawn handling)
│   └── EndGameScreen.js (game over screen with final statistics and score calculation)
├── world/
│   └── WorldGenerator.js (procedural world generation)
└── game.js (Phaser configuration)
```

## Development Notes

### Core Systems Implementation
- **Player Stats**: Stats affect derived values (health = 50 + vitality*4 + level*2)
- **Experience Formula**: Next level XP requirement increases by 10% each level
- **Enemy Scaling**: Enemy level = player level ± 1, with additional world level scaling
- **Item Generation**: Procedural item generation with rarity-based property counts
- **UI Management**: Centralized UIManager handles all interface panels and interactions

### Controls Reference
- **Movement**: Left-click
- **Attack**: Right-click (default: Fireball)  
- **Potions**: Q (Health), E (Mana)
- **Skills**: Keys 1-4 for assigned skills
- **Interface**: I (Inventory), C (Character), S (Skills), ESC (Close all)

### Game Flow & Scenes
- **Start Screen**: Dark fantasy themed main menu with atmospheric particle effects
  - Instructions panel with complete control reference
  - Fade transitions between scenes
  - Enter key or Start button to begin
- **Game Statistics Tracking**: Comprehensive tracking during gameplay
  - Enemies killed, items collected, play time
  - World level progression, experience gained
  - Final score calculation based on performance
- **End Game Screen**: Detailed statistics display and restart options
  - Final score calculation with multiple factors
  - Play again or return to main menu options
  - Keyboard shortcuts (R for restart, M for main menu)

### Technical Details
- No external image assets required - all sprites generated programmatically
- Game world is 150x150 tiles (4800x4800 pixels) 
- Camera follows player with world bounds
- Uses ES6 classes extending Phaser base classes
- Item drops use physics overlap detection for pickup
- All UI panels use depth layering (1000+) to appear above game elements
- Complete scene flow: StartScreen → Preloader → GameScene → EndGameScreen
- World transition system with portal mechanics and level progression