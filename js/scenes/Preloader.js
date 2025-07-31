class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        this.createAssets();
        
        // All assets are generated procedurally, no external images needed
    }

    createAssets() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Create sorcerer sprites for different directions
        this.createSorcererSprites(graphics);
        
        // Create all enemy type sprites
        this.createSkeletalWarriorSprites(graphics);
        this.createZombieSprites(graphics);
        this.createOrcSprites(graphics);
        this.createDemonSprites(graphics);
        
        // Create archer enemy sprites
        this.createFallenArcherSprites(graphics);
        this.createDarkRangerSprites(graphics);
        
        // Create exploding enemy sprites
        this.createExplodingCorpseSprites(graphics);
        this.createSuicideBomberSprites(graphics);
        
        // Create special enemy sprites
        this.createShamanSprites(graphics);
        this.createNecromancerSprites(graphics);
        
        // Create boss enemy sprites
        this.createBoneLordSprites(graphics);
        this.createDemonLordSprites(graphics);
        this.createLichKingSprites(graphics);
        
        // Fireball sprite (orange circle) - 3x size
        graphics.clear();
        graphics.fillStyle(0xff8800, 1);
        graphics.fillCircle(24, 24, 24);
        graphics.generateTexture('fireball', 48, 48);
        
        // Frost sprite (light blue circle) - 3x size
        graphics.clear();
        graphics.fillStyle(0x88ddff, 0.8);
        graphics.fillCircle(192, 192, 192);
        graphics.generateTexture('frost', 384, 384);
        
        // Chain Lightning (small lightning bolt) - 3x size
        graphics.clear();
        graphics.fillStyle(0xaaffff, 1);
        graphics.fillCircle(24, 24, 12);
        graphics.generateTexture('chainLightning', 48, 48);
        
        // Ice Bolt - 3x size
        graphics.clear();
        graphics.fillStyle(0xccffff, 1);
        graphics.fillTriangle(24, 6, 42, 42, 6, 42);
        graphics.generateTexture('iceBolt', 48, 48);
        
        // Meteor - 3x size
        graphics.clear();
        graphics.fillStyle(0xff6600, 1);
        graphics.fillCircle(48, 48, 36);
        graphics.fillStyle(0xffaa00, 0.8);
        graphics.fillCircle(42, 42, 24);
        graphics.generateTexture('meteor', 96, 96);
        
        // Original tiles (kept for compatibility)
        graphics.clear();
        graphics.fillStyle(0x228822, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('grass', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x666666, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('stone', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('dirt', 32, 32);
        
        // Dungeon floor - dark stone with texture
        graphics.clear();
        graphics.fillStyle(0x2a2a2a, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(1, 0x1a1a1a, 0.5);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.strokeRect(4, 4, 24, 24);
        graphics.generateTexture('dungeon_floor', 32, 32);
        
        // Dungeon wall - darker with highlights
        graphics.clear();
        graphics.fillStyle(0x0a0a0a, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(1, 0x3a3a3a, 0.8);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.fillStyle(0x1a1a1a, 0.5);
        graphics.fillRect(2, 2, 28, 28);
        graphics.generateTexture('dungeon_wall', 32, 32);
        
        // Town floor - cobblestone pattern
        graphics.clear();
        graphics.fillStyle(0x8b7355, 1);
        graphics.fillRect(0, 0, 32, 32);
        // Add cobblestone pattern
        graphics.lineStyle(1, 0x654321, 0.5);
        graphics.strokeRect(0, 0, 16, 16);
        graphics.strokeRect(16, 0, 16, 16);
        graphics.strokeRect(0, 16, 16, 16);
        graphics.strokeRect(16, 16, 16, 16);
        graphics.generateTexture('town_floor', 32, 32);
        
        // Town wall - wooden palisade look
        graphics.clear();
        graphics.fillStyle(0x4a3c28, 1);
        graphics.fillRect(0, 0, 32, 32);
        // Add wood grain
        graphics.lineStyle(1, 0x3a2c18, 1);
        for (let i = 4; i < 32; i += 8) {
            graphics.lineBetween(i, 0, i, 32);
        }
        graphics.lineStyle(2, 0x2a1c08, 0.5);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('town_wall', 32, 32);
        
        // Town path - dirt road
        graphics.clear();
        graphics.fillStyle(0xa0826d, 1);
        graphics.fillRect(0, 0, 32, 32);
        // Add some texture
        graphics.fillStyle(0x8b7355, 0.3);
        graphics.fillCircle(8, 8, 3);
        graphics.fillCircle(24, 24, 3);
        graphics.fillCircle(8, 24, 2);
        graphics.fillCircle(24, 8, 2);
        graphics.generateTexture('town_path', 32, 32);
        
        // Invisible wall texture for physics
        graphics.clear();
        graphics.fillStyle(0x000000, 0);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('invisible_wall', 32, 32);
        
        graphics.destroy();
    }

    createSorcererSprites(graphics) {
        // Sorcerer facing down (default/front view)
        graphics.clear();
        this.drawSorcerer(graphics, 'down');
        graphics.generateTexture('sorcerer_down', 96, 96);
        
        // Sorcerer facing up (back view)
        graphics.clear();
        this.drawSorcerer(graphics, 'up');
        graphics.generateTexture('sorcerer_up', 96, 96);
        
        // Sorcerer facing left
        graphics.clear();
        this.drawSorcerer(graphics, 'left');
        graphics.generateTexture('sorcerer_left', 96, 96);
        
        // Sorcerer facing right
        graphics.clear();
        this.drawSorcerer(graphics, 'right');
        graphics.generateTexture('sorcerer_right', 96, 96);
        
        // Sorcerer facing down-left
        graphics.clear();
        this.drawSorcerer(graphics, 'downleft');
        graphics.generateTexture('sorcerer_downleft', 96, 96);
        
        // Sorcerer facing down-right
        graphics.clear();
        this.drawSorcerer(graphics, 'downright');
        graphics.generateTexture('sorcerer_downright', 96, 96);
        
        // Sorcerer facing up-left
        graphics.clear();
        this.drawSorcerer(graphics, 'upleft');
        graphics.generateTexture('sorcerer_upleft', 96, 96);
        
        // Sorcerer facing up-right
        graphics.clear();
        this.drawSorcerer(graphics, 'upright');
        graphics.generateTexture('sorcerer_upright', 96, 96);
        
        // Default player texture (facing down)
        graphics.clear();
        this.drawSorcerer(graphics, 'down');
        graphics.generateTexture('player', 96, 96);
    }
    
    drawSorcerer(graphics, direction) {
        switch (direction) {
            case 'down': // Front view
                // Robe (dark blue/purple) - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 54, 60);
                
                // Belt - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(24, 54, 48, 9);
                
                // Arms - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(24, 48, 12);
                graphics.fillCircle(72, 48, 12);
                
                // Head (flesh tone) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(48, 30, 18);
                
                // Hood/hat - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(48, 24, 36, 24);
                graphics.fillTriangle(48, 6, 36, 24, 60, 24);
                
                // Staff (right side) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(75, 24, 6, 48);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(78, 18, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(78, 18, 6);
                
                // Eyes - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(42, 27, 3);
                graphics.fillCircle(54, 27, 3);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 54, 60);
                break;
                
            case 'up': // Back view
                // Robe back - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 54, 60);
                
                // Belt (back view) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(24, 54, 48, 9);
                
                // Arms - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(24, 48, 12);
                graphics.fillCircle(72, 48, 12);
                
                // Head (back of head) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(48, 30, 18);
                
                // Hood back - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(48, 24, 36, 24);
                
                // Staff (right side, held up) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(75, 18, 6, 54);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(78, 12, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(78, 12, 6);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 54, 60);
                break;
                
            case 'left': // Side view left
                // Robe (side view) - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 48, 60);
                
                // Belt - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(27, 54, 42, 9);
                
                // Visible arm - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(36, 48, 12);
                
                // Head (profile) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(42, 30, 18);
                
                // Hood/hat (side) - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(42, 24, 30, 24);
                graphics.fillTriangle(42, 6, 30, 24, 54, 24);
                
                // Staff (held to the side) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(18, 30, 6, 42);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(21, 24, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(21, 24, 6);
                
                // Eye - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(48, 27, 3);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 48, 60);
                break;
                
            case 'right': // Side view right
                // Robe (side view) - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 48, 60);
                
                // Belt - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(27, 54, 42, 9);
                
                // Visible arm - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(60, 48, 12);
                
                // Head (profile) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(54, 30, 18);
                
                // Hood/hat (side) - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(54, 24, 30, 24);
                graphics.fillTriangle(54, 6, 42, 24, 66, 24);
                
                // Staff (held to the side) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(72, 30, 6, 42);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(75, 24, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(75, 24, 6);
                
                // Eye - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(48, 27, 3);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 48, 60);
                break;
                
            case 'downleft': // Diagonal view down-left
                // Robe (diagonal view) - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 51, 60);
                
                // Belt - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(25, 54, 46, 9);
                
                // Left arm more visible - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(30, 48, 12);
                graphics.fillCircle(66, 48, 10);
                
                // Head (3/4 view) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(45, 30, 18);
                
                // Hood/hat - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(45, 24, 33, 24);
                graphics.fillTriangle(45, 6, 33, 24, 57, 24);
                
                // Staff (angled) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(12, 32, 6, 40);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(15, 26, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(15, 26, 6);
                
                // Eyes (3/4 view) - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(39, 28, 3);
                graphics.fillCircle(48, 27, 3);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 51, 60);
                break;
                
            case 'downright': // Diagonal view down-right
                // Robe (diagonal view) - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 51, 60);
                
                // Belt - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(25, 54, 46, 9);
                
                // Right arm more visible - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(30, 48, 10);
                graphics.fillCircle(66, 48, 12);
                
                // Head (3/4 view) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(51, 30, 18);
                
                // Hood/hat - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(51, 24, 33, 24);
                graphics.fillTriangle(51, 6, 39, 24, 63, 24);
                
                // Staff (angled) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(78, 32, 6, 40);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(81, 26, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(81, 26, 6);
                
                // Eyes (3/4 view) - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(48, 27, 3);
                graphics.fillCircle(57, 28, 3);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 51, 60);
                break;
                
            case 'upleft': // Diagonal view up-left
                // Robe back (diagonal) - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 51, 60);
                
                // Belt (back view) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(25, 54, 46, 9);
                
                // Arms - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(30, 48, 12);
                graphics.fillCircle(66, 48, 10);
                
                // Head (back 3/4) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(45, 30, 18);
                
                // Hood back - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(45, 24, 33, 24);
                
                // Staff (angled up) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(12, 20, 6, 52);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(15, 14, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(15, 14, 6);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 51, 60);
                break;
                
            case 'upright': // Diagonal view up-right
                // Robe back (diagonal) - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(48, 66, 51, 60);
                
                // Belt (back view) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(25, 54, 46, 9);
                
                // Arms - 3x size
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(30, 48, 10);
                graphics.fillCircle(66, 48, 12);
                
                // Head (back 3/4) - 3x size
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(51, 30, 18);
                
                // Hood back - 3x size
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(51, 24, 33, 24);
                
                // Staff (angled up) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(78, 20, 6, 52);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(81, 14, 9);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(81, 14, 6);
                
                // Robe trim removed - was creating blue circle
                // graphics.lineStyle(3, 0x4444aa, 1);
                // graphics.strokeEllipse(48, 66, 51, 60);
                break;
        }
    }
    
    drawMeleeWarrior(graphics) {
        // Skeletal ribcage (pale bone color)
        graphics.fillStyle(0xf5f5dc, 1); // Bone white
        graphics.fillEllipse(12, 15, 10, 8);
        
        // Rib bones (darker lines)
        graphics.lineStyle(1, 0xd3d3d3, 1);
        graphics.lineBetween(8, 13, 16, 13); // Top rib
        graphics.lineBetween(8, 15, 16, 15); // Middle rib
        graphics.lineBetween(8, 17, 16, 17); // Bottom rib
        
        // Shoulder bones
        graphics.fillStyle(0xf5f5dc, 1);
        graphics.fillCircle(7, 12, 2);
        graphics.fillCircle(17, 12, 2);
        
        // Skeletal arms (bone segments)
        graphics.fillStyle(0xf5f5dc, 1);
        graphics.fillRect(5, 13, 3, 1); // Left upper arm
        graphics.fillRect(4, 15, 3, 1); // Left forearm
        graphics.fillRect(16, 13, 3, 1); // Right upper arm
        graphics.fillRect(17, 15, 3, 1); // Right forearm
        
        // Leg bones (femur and tibia)
        graphics.fillStyle(0xf5f5dc, 1);
        graphics.fillRect(9, 19, 2, 3); // Left leg
        graphics.fillRect(13, 19, 2, 3); // Right leg
        
        // Skull (bone white with darker shadows)
        graphics.fillStyle(0xf5f5dc, 1);
        graphics.fillCircle(12, 8, 4);
        
        // Skull details (darker bone for depth)
        graphics.fillStyle(0xe6e6e6, 1);
        graphics.fillEllipse(12, 9, 3, 2); // Cheekbone area
        
        // Eye sockets (black/dark)
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(10, 7, 1.5);
        graphics.fillCircle(14, 7, 1.5);
        
        // Glowing red eyes in sockets
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(10, 7, 0.8);
        graphics.fillCircle(14, 7, 0.8);
        
        // Nasal cavity
        graphics.fillStyle(0x000000, 1);
        graphics.fillTriangle(12, 8, 11, 10, 13, 10);
        
        // Weapon - rusty sword (darker, weathered metal)
        graphics.fillStyle(0xa0a0a0, 1); // Tarnished silver
        graphics.fillRect(19, 6, 2, 8); // Blade
        
        // Rust spots on blade
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillCircle(20, 8, 0.5);
        graphics.fillCircle(19.5, 11, 0.3);
        
        // Sword hilt (weathered leather)
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(18, 14, 4, 2);
        
        // Sword pommel (tarnished)
        graphics.fillStyle(0x696969, 1);
        graphics.fillCircle(20, 16, 1);
        
        // Tattered shield (old, damaged)
        graphics.fillStyle(0x654321, 1); // Dark brown/weathered
        graphics.fillEllipse(4, 13, 3, 4);
        
        // Shield damage/holes
        graphics.fillStyle(0x333333, 1);
        graphics.fillCircle(4, 12, 0.5);
        graphics.fillCircle(3.5, 14, 0.3);
        
        // Torn cloak/rags around waist
        graphics.fillStyle(0x2f2f2f, 1); // Dark gray cloth
        graphics.fillRect(9, 16, 6, 1);
        
        // Spine visibility
        graphics.lineStyle(1, 0xd3d3d3, 1);
        graphics.lineBetween(12, 11, 12, 19); // Spine line
        
        // Bone joints
        graphics.fillStyle(0xe6e6e6, 1);
        graphics.fillCircle(7, 13, 0.8); // Left shoulder joint
        graphics.fillCircle(17, 13, 0.8); // Right shoulder joint
        graphics.fillCircle(10, 19, 0.8); // Left hip joint
        graphics.fillCircle(14, 19, 0.8); // Right hip joint
    }
    
    createSkeletalWarriorSprites(graphics) {
        // Skeletal warrior facing down (default/front view)
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'down');
        graphics.generateTexture('skeleton_down', 72, 72);
        
        // Skeletal warrior facing up (back view)
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'up');
        graphics.generateTexture('skeleton_up', 72, 72);
        
        // Skeletal warrior facing left
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'left');
        graphics.generateTexture('skeleton_left', 72, 72);
        
        // Skeletal warrior facing right
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'right');
        graphics.generateTexture('skeleton_right', 72, 72);
        
        // Skeletal warrior facing down-left
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'downleft');
        graphics.generateTexture('skeleton_downleft', 72, 72);
        
        // Skeletal warrior facing down-right
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'downright');
        graphics.generateTexture('skeleton_downright', 72, 72);
        
        // Skeletal warrior facing up-left
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'upleft');
        graphics.generateTexture('skeleton_upleft', 72, 72);
        
        // Skeletal warrior facing up-right
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'upright');
        graphics.generateTexture('skeleton_upright', 72, 72);
        
        // Remove default enemy texture to prevent down-facing bug
        // graphics.clear();
        // this.drawSkeletalWarrior(graphics, 'down');
        // graphics.generateTexture('enemy', 72, 72);
    }
    
    drawSkeletalWarrior(graphics, direction) {
        switch (direction) {
            case 'down': // Front view - 3x size
                // Skeletal ribcage - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 30, 24);
                
                // Rib bones - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(24, 39, 48, 39);
                graphics.lineBetween(24, 45, 48, 45);
                graphics.lineBetween(24, 51, 48, 51);
                
                // Arms - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(15, 39, 9, 3);
                graphics.fillRect(12, 45, 9, 3);
                graphics.fillRect(48, 39, 9, 3);
                graphics.fillRect(51, 45, 9, 3);
                
                // Legs - 3x size
                graphics.fillRect(27, 57, 6, 9);
                graphics.fillRect(39, 57, 6, 9);
                
                // Skull - 3x size
                graphics.fillCircle(36, 24, 12);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(30, 21, 4.5);
                graphics.fillCircle(42, 21, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(30, 21, 2.4);
                graphics.fillCircle(42, 21, 2.4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(36, 24, 33, 30, 39, 30);
                
                // Sword (right side) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(57, 18, 6, 24);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillCircle(60, 24, 1.5);
                
                // Shield (left side) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(12, 39, 9, 12);
                break;
                
            case 'up': // Back view - 3x size
                // Skeletal back - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 30, 24);
                
                // Spine - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(36, 33, 36, 57);
                
                // Arms (back view) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(15, 39, 9, 3);
                graphics.fillRect(48, 39, 9, 3);
                
                // Legs - 3x size
                graphics.fillRect(27, 57, 6, 9);
                graphics.fillRect(39, 57, 6, 9);
                
                // Back of skull - 3x size
                graphics.fillCircle(36, 24, 12);
                
                // Sword (held up) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(57, 12, 6, 30);
                
                // Shield (back view) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(12, 39, 9, 12);
                break;
                
            case 'left': // Side view left - 3x size
                // Skeletal torso (side view) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 24, 24);
                
                // Side ribs - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(27, 39, 45, 39);
                graphics.lineBetween(27, 45, 45, 45);
                graphics.lineBetween(27, 51, 45, 51);
                
                // Visible arm - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(24, 39, 9, 3);
                graphics.fillRect(21, 45, 9, 3);
                
                // Legs (side view) - 3x size
                graphics.fillRect(30, 57, 6, 9);
                graphics.fillRect(36, 57, 6, 9);
                
                // Skull (profile) - 3x size
                graphics.fillCircle(33, 24, 12);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(39, 21, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(39, 21, 2.4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(39, 24, 36, 30, 42, 30);
                
                // Sword (held to the side) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(15, 24, 6, 24);
                
                // Shield (side view) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(51, 39, 6, 12);
                break;
                
            case 'right': // Side view right - 3x size
                // Skeletal torso (side view) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 24, 24);
                
                // Side ribs - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(27, 39, 45, 39);
                graphics.lineBetween(27, 45, 45, 45);
                graphics.lineBetween(27, 51, 45, 51);
                
                // Visible arm - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(39, 39, 9, 3);
                graphics.fillRect(42, 45, 9, 3);
                
                // Legs (side view) - 3x size
                graphics.fillRect(30, 57, 6, 9);
                graphics.fillRect(36, 57, 6, 9);
                
                // Skull (profile) - 3x size
                graphics.fillCircle(39, 24, 12);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(33, 21, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(33, 21, 2.4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(33, 24, 30, 30, 36, 30);
                
                // Sword (held to the side) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(51, 24, 6, 24);
                
                // Shield (side view) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(21, 39, 6, 12);
                break;
                
            case 'downleft': // Diagonal down-left - 3x size
                // Skeletal ribcage (diagonal) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                
                // Diagonal ribs - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(25, 40, 47, 38);
                graphics.lineBetween(25, 45, 47, 44);
                graphics.lineBetween(25, 50, 47, 50);
                
                // Arms (left more visible) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(18, 39, 9, 3);
                graphics.fillRect(15, 45, 9, 3);
                graphics.fillRect(45, 39, 8, 3);
                graphics.fillRect(47, 44, 8, 3);
                
                // Legs - 3x size
                graphics.fillRect(28, 57, 6, 9);
                graphics.fillRect(38, 57, 6, 9);
                
                // Skull (3/4 view) - 3x size
                graphics.fillCircle(34, 24, 12);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(28, 22, 4.5);
                graphics.fillCircle(38, 21, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(28, 22, 2.4);
                graphics.fillCircle(38, 21, 2.4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(34, 24, 31, 30, 37, 30);
                
                // Sword (angled) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(12, 26, 6, 22);
                
                // Shield (diagonal) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(52, 40, 8, 11);
                break;
                
            case 'downright': // Diagonal down-right - 3x size
                // Skeletal ribcage (diagonal) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                
                // Diagonal ribs - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(25, 38, 47, 40);
                graphics.lineBetween(25, 44, 47, 45);
                graphics.lineBetween(25, 50, 47, 50);
                
                // Arms (right more visible) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(17, 39, 8, 3);
                graphics.fillRect(15, 44, 8, 3);
                graphics.fillRect(45, 39, 9, 3);
                graphics.fillRect(48, 45, 9, 3);
                
                // Legs - 3x size
                graphics.fillRect(28, 57, 6, 9);
                graphics.fillRect(38, 57, 6, 9);
                
                // Skull (3/4 view) - 3x size
                graphics.fillCircle(38, 24, 12);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(34, 21, 4.5);
                graphics.fillCircle(44, 22, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(34, 21, 2.4);
                graphics.fillCircle(44, 22, 2.4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(38, 24, 35, 30, 41, 30);
                
                // Sword (angled) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(54, 26, 6, 22);
                
                // Shield (diagonal) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(20, 40, 8, 11);
                break;
                
            case 'upleft': // Diagonal up-left - 3x size
                // Skeletal back (diagonal) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                
                // Spine (angled) - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(34, 33, 36, 57);
                
                // Arms (back view, left visible) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(18, 39, 9, 3);
                graphics.fillRect(45, 39, 8, 3);
                
                // Legs - 3x size
                graphics.fillRect(28, 57, 6, 9);
                graphics.fillRect(38, 57, 6, 9);
                
                // Back of skull - 3x size
                graphics.fillCircle(34, 24, 12);
                
                // Sword (held up, angled) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(12, 14, 6, 28);
                
                // Shield (back view) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(52, 40, 8, 11);
                break;
                
            case 'upright': // Diagonal up-right - 3x size
                // Skeletal back (diagonal) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                
                // Spine (angled) - 3x size
                graphics.lineStyle(3, 0xd3d3d3, 1);
                graphics.lineBetween(38, 33, 36, 57);
                
                // Arms (back view, right visible) - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(17, 39, 8, 3);
                graphics.fillRect(44, 39, 9, 3);
                
                // Legs - 3x size
                graphics.fillRect(28, 57, 6, 9);
                graphics.fillRect(38, 57, 6, 9);
                
                // Back of skull - 3x size
                graphics.fillCircle(38, 24, 12);
                
                // Sword (held up, angled) - 3x size
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(54, 14, 6, 28);
                
                // Shield (back view) - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(20, 40, 8, 11);
                break;
        }
    }
    
    createZombieSprites(graphics) {
        // Create all 8 directional sprites for zombie
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawZombie(graphics, direction);
            graphics.generateTexture(`zombie_${direction}`, 72, 72);
        });
        
        // Default zombie texture
        graphics.clear();
        this.drawZombie(graphics, 'down');
        graphics.generateTexture('zombie', 72, 72);
    }
    
    drawZombie(graphics, direction) {
        switch (direction) {
            case 'down':
                // Rotting flesh body (green-gray) - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                
                // Torn clothing - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                
                // Arms (rotting) - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(15, 39, 12, 6);
                graphics.fillRect(45, 39, 12, 6);
                
                // Legs - 3x size
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                
                // Zombie head - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(36, 24, 15);
                
                // Dead eyes - 3x size
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(30, 21, 4.5);
                graphics.fillCircle(42, 21, 4.5);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(30, 21, 1.5);
                graphics.fillCircle(42, 21, 1.5);
                
                // Mouth - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(33, 27, 6, 3);
                
                // Blood/gore spots - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(27, 42, 1.5);
                graphics.fillCircle(45, 48, 0.9);
                break;
                
            case 'up':
                // Back view - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(15, 39, 12, 6);
                graphics.fillRect(45, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(36, 24, 15);
                break;
                
            case 'left':
                // Side view - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 30, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(21, 39, 12, 6);
                graphics.fillRect(30, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(33, 24, 15);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(39, 21, 4.5);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(39, 21, 1.5);
                break;
                
            case 'right':
                // Side view right - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 30, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(39, 39, 12, 6);
                graphics.fillRect(30, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(39, 24, 15);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(33, 21, 4.5);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(33, 21, 1.5);
                break;
                
            case 'downleft':
                // Diagonal down-left - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(18, 39, 12, 6);
                graphics.fillRect(42, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(34, 24, 15);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(28, 22, 4.5);
                graphics.fillCircle(38, 21, 4.5);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(28, 22, 1.5);
                graphics.fillCircle(38, 21, 1.5);
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(31, 27, 6, 3);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(25, 42, 1.5);
                break;
                
            case 'downright':
                // Diagonal down-right - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(18, 39, 12, 6);
                graphics.fillRect(42, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(38, 24, 15);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(34, 21, 4.5);
                graphics.fillCircle(44, 22, 4.5);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(34, 21, 1.5);
                graphics.fillCircle(44, 22, 1.5);
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(35, 27, 6, 3);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(47, 42, 1.5);
                break;
                
            case 'upleft':
                // Diagonal up-left - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(18, 39, 12, 6);
                graphics.fillRect(42, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(34, 24, 15);
                break;
                
            case 'upright':
                // Diagonal up-right - 3x size
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(24, 36, 24, 24);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(18, 39, 12, 6);
                graphics.fillRect(42, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x6b8e23, 1);
                graphics.fillCircle(38, 24, 15);
                break;
        }
    }
    
    createOrcSprites(graphics) {
        // Create all 8 directional sprites for orc
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawOrc(graphics, direction);
            graphics.generateTexture(`orc_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawOrc(graphics, 'down');
        graphics.generateTexture('orc', 72, 72);
    }
    
    drawOrc(graphics, direction) {
        switch (direction) {
            case 'down':
                // Muscular green body - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 42, 36);
                
                // Armor/leather - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                
                // Arms (muscular) - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(12, 36, 15, 9);
                graphics.fillRect(45, 36, 15, 9);
                
                // Legs - 3x size
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                
                // Orc head (larger) - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillCircle(36, 21, 18);
                
                // Angry red eyes - 3x size
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(30, 18, 4.5);
                graphics.fillCircle(42, 18, 4.5);
                
                // Tusks - 3x size
                graphics.fillStyle(0xffffff, 1);
                graphics.fillTriangle(30, 24, 27, 30, 33, 30);
                graphics.fillTriangle(42, 24, 39, 30, 45, 30);
                
                // Large weapon (axe) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(60, 24, 6, 30);
                graphics.fillStyle(0x696969, 1);
                graphics.fillRect(54, 18, 18, 12);
                break;
                
            case 'up':
                // Back view - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 42, 36);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(12, 36, 15, 9);
                graphics.fillRect(45, 36, 15, 9);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(36, 21, 18);
                break;
                
            case 'left':
                // Side view - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 36, 36);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(18, 36, 15, 9);
                graphics.fillRect(27, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(30, 21, 18);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(36, 18, 4.5);
                break;
                
            case 'right':
                // Side view right - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 36, 36);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(39, 36, 15, 9);
                graphics.fillRect(27, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(42, 21, 18);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(36, 18, 4.5);
                break;
                
            case 'downleft':
                // Diagonal down-left - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(15, 36, 15, 9);
                graphics.fillRect(42, 36, 15, 9);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(33, 21, 18);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(27, 19, 4.5);
                graphics.fillCircle(39, 18, 4.5);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillTriangle(27, 24, 24, 30, 30, 30);
                graphics.fillTriangle(39, 24, 36, 30, 42, 30);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(12, 24, 6, 30);
                graphics.fillStyle(0x696969, 1);
                graphics.fillRect(6, 18, 18, 12);
                break;
                
            case 'downright':
                // Diagonal down-right - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(15, 36, 15, 9);
                graphics.fillRect(42, 36, 15, 9);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(39, 21, 18);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(33, 18, 4.5);
                graphics.fillCircle(45, 19, 4.5);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillTriangle(33, 24, 30, 30, 36, 30);
                graphics.fillTriangle(45, 24, 42, 30, 48, 30);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(54, 24, 6, 30);
                graphics.fillStyle(0x696969, 1);
                graphics.fillRect(48, 18, 18, 12);
                break;
                
            case 'upleft':
                // Diagonal up-left - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(15, 36, 15, 9);
                graphics.fillRect(42, 36, 15, 9);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(33, 21, 18);
                break;
                
            case 'upright':
                // Diagonal up-right - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 33, 30, 27);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(15, 36, 15, 9);
                graphics.fillRect(42, 36, 15, 9);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(39, 21, 18);
                break;
        }
    }
    
    createDemonSprites(graphics) {
        // Create all 8 directional sprites for demon
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawDemon(graphics, direction);
            graphics.generateTexture(`demon_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawDemon(graphics, 'down');
        graphics.generateTexture('demon', 72, 72);
    }
    
    drawDemon(graphics, direction) {
        switch (direction) {
            case 'down':
                // Dark red demonic body - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                
                // Wings (small, bat-like) - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(15, 36, 24, 24, 24, 48);
                graphics.fillTriangle(57, 36, 48, 24, 48, 48);
                
                // Arms with claws - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(12, 39, 12, 6);
                graphics.fillRect(48, 39, 12, 6);
                
                // Claws - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(9, 42, 12, 45, 15, 42);
                graphics.fillTriangle(57, 42, 60, 45, 63, 42);
                
                // Legs (hooved) - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                
                // Hooves - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(27, 66, 9, 3);
                graphics.fillRect(36, 66, 9, 3);
                
                // Demonic head with horns - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(36, 24, 15);
                
                // Horns - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(27, 15, 30, 6, 33, 15);
                graphics.fillTriangle(45, 15, 42, 6, 39, 15);
                
                // Glowing eyes - 3x size
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(30, 21, 4.5);
                graphics.fillCircle(42, 21, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(30, 21, 2.4);
                graphics.fillCircle(42, 21, 2.4);
                
                // Fanged mouth - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(33, 27, 6, 6);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillTriangle(30, 27, 27, 33, 33, 33);
                graphics.fillTriangle(42, 27, 39, 33, 45, 33);
                break;
                
            case 'up':
                // Back view with visible wings - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(15, 36, 24, 24, 24, 48);
                graphics.fillTriangle(57, 36, 48, 24, 48, 48);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(12, 39, 12, 6);
                graphics.fillRect(48, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillCircle(36, 24, 15);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(27, 15, 30, 6, 33, 15);
                graphics.fillTriangle(45, 15, 42, 6, 39, 15);
                break;
                
            case 'left':
                // Side view - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 30, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(21, 36, 30, 24, 30, 48);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(18, 39, 12, 6);
                graphics.fillRect(30, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillCircle(30, 24, 15);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(24, 15, 27, 6, 30, 15);
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(36, 21, 4.5);
                break;
                
            case 'right':
                // Side view right - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 30, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(51, 36, 42, 24, 42, 48);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(42, 39, 12, 6);
                graphics.fillRect(30, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillCircle(42, 24, 15);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(48, 15, 45, 6, 42, 15);
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(36, 21, 4.5);
                break;
                
            case 'downleft':
                // Diagonal down-left - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(18, 36, 27, 24, 27, 48);
                graphics.fillTriangle(54, 36, 45, 24, 45, 48);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(15, 39, 12, 6);
                graphics.fillRect(45, 39, 12, 6);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(12, 42, 15, 45, 18, 42);
                graphics.fillTriangle(54, 42, 57, 45, 60, 42);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(27, 66, 9, 3);
                graphics.fillRect(36, 66, 9, 3);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(33, 24, 15);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(24, 15, 27, 6, 30, 15);
                graphics.fillTriangle(42, 15, 39, 6, 36, 15);
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(27, 22, 4.5);
                graphics.fillCircle(39, 21, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(27, 22, 2.4);
                graphics.fillCircle(39, 21, 2.4);
                break;
                
            case 'downright':
                // Diagonal down-right - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(18, 36, 27, 24, 27, 48);
                graphics.fillTriangle(54, 36, 45, 24, 45, 48);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(15, 39, 12, 6);
                graphics.fillRect(45, 39, 12, 6);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(12, 42, 15, 45, 18, 42);
                graphics.fillTriangle(54, 42, 57, 45, 60, 42);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(27, 66, 9, 3);
                graphics.fillRect(36, 66, 9, 3);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(39, 24, 15);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(30, 15, 33, 6, 36, 15);
                graphics.fillTriangle(48, 15, 45, 6, 42, 15);
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(33, 21, 4.5);
                graphics.fillCircle(45, 22, 4.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(33, 21, 2.4);
                graphics.fillCircle(45, 22, 2.4);
                break;
                
            case 'upleft':
                // Diagonal up-left - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(18, 36, 27, 24, 27, 48);
                graphics.fillTriangle(54, 36, 45, 24, 45, 48);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(15, 39, 12, 6);
                graphics.fillRect(45, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillCircle(33, 24, 15);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(24, 15, 27, 6, 30, 15);
                graphics.fillTriangle(42, 15, 39, 6, 36, 15);
                break;
                
            case 'upright':
                // Diagonal up-right - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(18, 36, 27, 24, 27, 48);
                graphics.fillTriangle(54, 36, 45, 24, 45, 48);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(15, 39, 12, 6);
                graphics.fillRect(45, 39, 12, 6);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillCircle(39, 24, 15);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(30, 15, 33, 6, 36, 15);
                graphics.fillTriangle(48, 15, 45, 6, 42, 15);
                break;
        }
    }
    
    // ARCHER ENEMY SPRITES
    createFallenArcherSprites(graphics) {
        // Create all 8 directional sprites for fallen archer
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawFallenArcher(graphics, direction);
            graphics.generateTexture(`fallenArcher_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawFallenArcher(graphics, 'down');
        graphics.generateTexture('fallenArcher', 72, 72);
    }
    
    drawFallenArcher(graphics, direction) {
        switch (direction) {
            case 'down':
                // Small humanoid archer body (red-brown) - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 30, 24);
                
                // Simple tunic - 3x size
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                
                // Arms holding bow - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(15, 39, 9, 6);
                graphics.fillRect(48, 39, 9, 6);
                
                // Legs - 3x size
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                
                // Head - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillCircle(36, 24, 12);
                
                // Eyes - 3x size
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(30, 21, 3);
                graphics.fillCircle(42, 21, 3);
                
                // Bow - 3x size
                graphics.lineStyle(6, 0x654321, 1);
                graphics.strokeCircle(54, 36, 18);
                graphics.lineStyle(3, 0x333333, 1);
                graphics.lineBetween(54, 18, 54, 54);
                break;
                
            case 'up':
                // Back view - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 30, 24);
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(15, 39, 9, 6);
                graphics.fillRect(48, 39, 9, 6);
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                graphics.fillCircle(36, 24, 12);
                break;
                
            case 'left':
                // Side view - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 24, 24);
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 39, 9, 6);
                graphics.fillRect(30, 57, 6, 12);
                graphics.fillRect(36, 57, 6, 12);
                graphics.fillCircle(36, 24, 12);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(42, 21, 3);
                break;
                
            case 'right':
                // Side view right - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 24, 24);
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(42, 39, 9, 6);
                graphics.fillRect(30, 57, 6, 12);
                graphics.fillRect(36, 57, 6, 12);
                graphics.fillCircle(36, 24, 12);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(30, 21, 3);
                break;
                
            case 'downleft':
                // Diagonal down-left - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(18, 39, 9, 6);
                graphics.fillRect(45, 39, 9, 6);
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                graphics.fillCircle(34, 24, 12);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(28, 22, 3);
                graphics.fillCircle(40, 21, 3);
                graphics.lineStyle(6, 0x654321, 1);
                graphics.strokeCircle(18, 36, 18);
                graphics.lineStyle(3, 0x333333, 1);
                graphics.lineBetween(18, 18, 18, 54);
                break;
                
            case 'downright':
                // Diagonal down-right - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(18, 39, 9, 6);
                graphics.fillRect(45, 39, 9, 6);
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                graphics.fillCircle(38, 24, 12);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(32, 21, 3);
                graphics.fillCircle(44, 22, 3);
                graphics.lineStyle(6, 0x654321, 1);
                graphics.strokeCircle(54, 36, 18);
                graphics.lineStyle(3, 0x333333, 1);
                graphics.lineBetween(54, 18, 54, 54);
                break;
                
            case 'upleft':
                // Diagonal up-left - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(18, 39, 9, 6);
                graphics.fillRect(45, 39, 9, 6);
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                graphics.fillCircle(34, 24, 12);
                break;
                
            case 'upright':
                // Diagonal up-right - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 27, 24);
                graphics.fillStyle(0x654321, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(18, 39, 9, 6);
                graphics.fillRect(45, 39, 9, 6);
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                graphics.fillCircle(38, 24, 12);
                break;
        }
    }
    
    createDarkRangerSprites(graphics) {
        // Create all 8 directional sprites for dark ranger
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawDarkRanger(graphics, direction);
            graphics.generateTexture(`darkRanger_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawDarkRanger(graphics, 'down');
        graphics.generateTexture('darkRanger', 72, 72);
    }
    
    drawDarkRanger(graphics, direction) {
        switch (direction) {
            case 'down':
                // Dark ranger body (darker, more armored) - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                
                // Dark armor - 3x size
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                
                // Arms with bracers - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(12, 36, 12, 9);
                graphics.fillRect(48, 36, 12, 9);
                
                // Legs with boots - 3x size
                graphics.fillRect(24, 57, 9, 12);
                graphics.fillRect(39, 57, 9, 12);
                
                // Hooded head - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillCircle(36, 24, 15);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillEllipse(36, 18, 24, 18);
                
                // Glowing eyes - 3x size
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(30, 21, 4.5);
                graphics.fillCircle(42, 21, 4.5);
                
                // Large bow - 3x size
                graphics.lineStyle(9, 0x654321, 1);
                graphics.strokeEllipse(57, 36, 12, 24);
                graphics.lineStyle(3, 0x333333, 1);
                graphics.lineBetween(57, 12, 57, 60);
                break;
                
            case 'up':
                // Back view - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(12, 36, 12, 9);
                graphics.fillRect(48, 36, 12, 9);
                graphics.fillRect(24, 57, 9, 12);
                graphics.fillRect(39, 57, 9, 12);
                graphics.fillCircle(36, 24, 15);
                break;
                
            case 'left':
                // Side view - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 30, 30);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(18, 36, 12, 9);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillCircle(36, 24, 15);
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(42, 21, 4.5);
                break;
                
            case 'right':
                // Side view right - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 30, 30);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(42, 36, 12, 9);
                graphics.fillRect(27, 57, 9, 12);
                graphics.fillRect(36, 57, 9, 12);
                graphics.fillCircle(36, 24, 15);
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(30, 21, 4.5);
                break;
                
            case 'downleft':
                // Diagonal down-left - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(15, 36, 12, 9);
                graphics.fillRect(45, 36, 12, 9);
                graphics.fillRect(24, 57, 9, 12);
                graphics.fillRect(39, 57, 9, 12);
                graphics.fillCircle(34, 24, 15);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillEllipse(34, 18, 24, 18);
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(28, 22, 4.5);
                graphics.fillCircle(40, 21, 4.5);
                graphics.lineStyle(9, 0x654321, 1);
                graphics.strokeEllipse(15, 36, 12, 24);
                graphics.lineStyle(3, 0x333333, 1);
                graphics.lineBetween(15, 12, 15, 60);
                break;
                
            case 'downright':
                // Diagonal down-right - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(15, 36, 12, 9);
                graphics.fillRect(45, 36, 12, 9);
                graphics.fillRect(24, 57, 9, 12);
                graphics.fillRect(39, 57, 9, 12);
                graphics.fillCircle(38, 24, 15);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillEllipse(38, 18, 24, 18);
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(32, 21, 4.5);
                graphics.fillCircle(44, 22, 4.5);
                graphics.lineStyle(9, 0x654321, 1);
                graphics.strokeEllipse(57, 36, 12, 24);
                graphics.lineStyle(3, 0x333333, 1);
                graphics.lineBetween(57, 12, 57, 60);
                break;
                
            case 'upleft':
                // Diagonal up-left - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(15, 36, 12, 9);
                graphics.fillRect(45, 36, 12, 9);
                graphics.fillRect(24, 57, 9, 12);
                graphics.fillRect(39, 57, 9, 12);
                graphics.fillCircle(34, 24, 15);
                break;
                
            case 'upright':
                // Diagonal up-right - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 33, 30);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(21, 33, 30, 24);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillRect(15, 36, 12, 9);
                graphics.fillRect(45, 36, 12, 9);
                graphics.fillRect(24, 57, 9, 12);
                graphics.fillRect(39, 57, 9, 12);
                graphics.fillCircle(38, 24, 15);
                break;
        }
    }
    
    // EXPLODING ENEMY SPRITES
    createExplodingCorpseSprites(graphics) {
        // Create all 8 directional sprites for exploding corpse
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawExplodingCorpse(graphics, direction);
            graphics.generateTexture(`explodingCorpse_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawExplodingCorpse(graphics, 'down');
        graphics.generateTexture('explodingCorpse', 72, 72);
    }
    
    drawExplodingCorpse(graphics, direction) {
        switch (direction) {
            case 'down':
                // Bloated, diseased corpse body - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 42, 36);
                
                // Rotting flesh patches - 3x size
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(24, 36, 6);
                graphics.fillCircle(48, 42, 4.5);
                graphics.fillCircle(36, 54, 6);
                
                // Torn clothing - 3x size
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                
                // Swollen arms - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(9, 36, 15, 12);
                graphics.fillRect(48, 36, 15, 12);
                
                // Legs - 3x size
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                
                // Bloated head - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillCircle(36, 21, 18);
                
                // Dead eyes - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(30, 18, 6);
                graphics.fillCircle(42, 18, 6);
                
                // Stitches/wounds - 3x size
                graphics.lineStyle(3, 0x8b0000, 1);
                graphics.lineBetween(24, 27, 48, 27);
                graphics.lineBetween(30, 45, 42, 45);
                
                // Glowing volatile core - 3x size
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
                
            case 'up':
                // Back view - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 42, 36);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(30, 39, 4.5);
                graphics.fillCircle(42, 48, 3);
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(9, 36, 15, 12);
                graphics.fillRect(48, 36, 15, 12);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(36, 21, 18);
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
                
            case 'left':
                // Side view - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 36, 36);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(30, 39, 4.5);
                graphics.fillCircle(42, 48, 3);
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(18, 36, 15, 12);
                graphics.fillRect(27, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(33, 21, 18);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(39, 18, 6);
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
                
            case 'right':
                // Side view right - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 36, 36);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(30, 39, 4.5);
                graphics.fillCircle(42, 48, 3);
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(39, 36, 15, 12);
                graphics.fillRect(27, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(39, 21, 18);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(33, 18, 6);
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
                
            case 'downleft':
                // Diagonal down-left - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(22, 37, 6);
                graphics.fillCircle(46, 41, 4.5);
                graphics.fillCircle(34, 53, 6);
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(12, 36, 15, 12);
                graphics.fillRect(45, 36, 15, 12);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(34, 21, 18);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(28, 19, 6);
                graphics.fillCircle(40, 18, 6);
                graphics.lineStyle(3, 0x8b0000, 1);
                graphics.lineBetween(22, 27, 46, 27);
                graphics.lineBetween(28, 45, 40, 45);
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
                
            case 'downright':
                // Diagonal down-right - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(26, 41, 4.5);
                graphics.fillCircle(50, 37, 6);
                graphics.fillCircle(38, 53, 6);
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(12, 36, 15, 12);
                graphics.fillRect(45, 36, 15, 12);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(38, 21, 18);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(32, 18, 6);
                graphics.fillCircle(44, 19, 6);
                graphics.lineStyle(3, 0x8b0000, 1);
                graphics.lineBetween(26, 27, 50, 27);
                graphics.lineBetween(32, 45, 44, 45);
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
                
            case 'upleft':
                // Diagonal up-left - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(28, 40, 4.5);
                graphics.fillCircle(40, 47, 3);
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(12, 36, 15, 12);
                graphics.fillRect(45, 36, 15, 12);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(34, 21, 18);
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
                
            case 'upright':
                // Diagonal up-right - 3x size
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillEllipse(36, 45, 39, 36);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(32, 40, 4.5);
                graphics.fillCircle(44, 47, 3);
                graphics.fillStyle(0x2f2f2f, 0.7);
                graphics.fillRect(21, 33, 30, 18);
                graphics.fillStyle(0x556b2f, 1);
                graphics.fillRect(12, 36, 15, 12);
                graphics.fillRect(45, 36, 15, 12);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(38, 21, 18);
                graphics.fillStyle(0xff4400, 0.8);
                graphics.fillCircle(36, 45, 9);
                break;
        }
    }
    
    createSuicideBomberSprites(graphics) {
        // Create all 8 directional sprites for suicide bomber
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawSuicideBomber(graphics, direction);
            graphics.generateTexture(`suicideBomber_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawSuicideBomber(graphics, 'down');
        graphics.generateTexture('suicideBomber', 72, 72);
    }
    
    drawSuicideBomber(graphics, direction) {
        // Fast-moving bomber with explosive devices - 3x size
        switch (direction) {
            case 'down':
                // Lean, agile body - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 30, 24);
                
                // Dark clothing - 3x size
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(24, 36, 24, 18);
                
                // Arms with bomb attachments - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(15, 39, 9, 6);
                graphics.fillRect(48, 39, 9, 6);
                
                // Bomb devices on arms - 3x size
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillCircle(12, 42, 6);
                graphics.fillCircle(60, 42, 6);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(12, 42, 3);
                graphics.fillCircle(60, 42, 3);
                
                // Legs - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                
                // Hooded head - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillCircle(36, 24, 12);
                graphics.fillStyle(0x333333, 1);
                graphics.fillEllipse(36, 18, 18, 12);
                
                // Glowing eyes - 3x size
                graphics.fillStyle(0xff4400, 1);
                graphics.fillCircle(30, 21, 3);
                graphics.fillCircle(42, 21, 3);
                
                // Central explosive device - 3x size
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillCircle(36, 45, 12);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(36, 45, 6);
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(36, 45, 3);
                break;
                
            case 'up':
            case 'left':
            case 'right':
            case 'downleft':
            case 'downright':
            case 'upleft':
            case 'upright':
                // Similar for other directions - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 45, 30, 24);
                graphics.fillStyle(0x333333, 1);
                graphics.fillRect(24, 36, 24, 18);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(21, 39, 9, 6);
                graphics.fillRect(27, 57, 6, 12);
                graphics.fillRect(39, 57, 6, 12);
                graphics.fillCircle(36, 24, 12);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillCircle(36, 45, 12);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(36, 45, 6);
                break;
        }
    }
    
    // SPECIAL ENEMY SPRITES  
    createShamanSprites(graphics) {
        // Create all 8 directional sprites for shaman
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawShaman(graphics, direction);
            graphics.generateTexture(`shaman_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawShaman(graphics, 'down');
        graphics.generateTexture('shaman', 72, 72);
    }
    
    drawShaman(graphics, direction) {
        switch (direction) {
            case 'down':
                // Orc shaman body - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                
                // Ornate robes - 3x size
                graphics.fillStyle(0x4b0082, 1);
                graphics.fillRect(21, 33, 30, 30);
                
                // Tribal markings on robes - 3x size
                graphics.fillStyle(0xffd700, 1);
                graphics.fillRect(27, 39, 6, 3);
                graphics.fillRect(39, 39, 6, 3);
                graphics.fillRect(33, 48, 6, 3);
                
                // Arms - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(12, 36, 12, 9);
                graphics.fillRect(48, 36, 12, 9);
                
                // Legs - 3x size
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                
                // Shaman head with headdress - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillCircle(36, 24, 15);
                
                // Feathered headdress - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillEllipse(36, 12, 24, 12);
                graphics.fillStyle(0xff4400, 1);
                graphics.fillRect(24, 6, 6, 12);
                graphics.fillRect(42, 6, 6, 12);
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillRect(33, 3, 6, 15);
                
                // Glowing eyes - 3x size
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(30, 21, 4.5);
                graphics.fillCircle(42, 21, 4.5);
                
                // Staff - 3x size
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(60, 18, 6, 48);
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(63, 12, 9);
                graphics.fillStyle(0x0088ff, 0.7);
                graphics.fillCircle(63, 12, 6);
                break;
                
            case 'up':
            case 'left':
            case 'right':
            case 'downleft':
            case 'downright':
            case 'upleft':
            case 'upright':
                // Similar structure for other directions - 3x size
                graphics.fillStyle(0x228b22, 1);
                graphics.fillEllipse(36, 45, 36, 30);
                graphics.fillStyle(0x4b0082, 1);
                graphics.fillRect(21, 33, 30, 30);
                graphics.fillStyle(0x228b22, 1);
                graphics.fillRect(18, 36, 12, 9);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(36, 24, 15);
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(direction === 'left' ? 42 : 30, 21, 4.5);
                break;
        }
    }
    
    createNecromancerSprites(graphics) {
        // Create all 8 directional sprites for necromancer
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawNecromancer(graphics, direction);
            graphics.generateTexture(`necromancer_${direction}`, 72, 72);
        });
        
        graphics.clear();
        this.drawNecromancer(graphics, 'down');
        graphics.generateTexture('necromancer', 72, 72);
    }
    
    drawNecromancer(graphics, direction) {
        switch (direction) {
            case 'down':
                // Necromancer body - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 33, 27);
                
                // Dark flowing robes - 3x size
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(18, 30, 36, 36);
                
                // Bone decorations on robes - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(24, 36, 3, 9);
                graphics.fillRect(45, 36, 3, 9);
                graphics.fillRect(33, 48, 6, 3);
                
                // Skeletal arms - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(12, 36, 9, 6);
                graphics.fillRect(51, 36, 9, 6);
                
                // Legs hidden in robes - 3x size
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                
                // Skull head - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillCircle(36, 24, 15);
                
                // Eye sockets - 3x size
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(30, 21, 6);
                graphics.fillCircle(42, 21, 6);
                
                // Glowing red eyes - 3x size
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(30, 21, 3);
                graphics.fillCircle(42, 21, 3);
                
                // Dark hood - 3x size
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillEllipse(36, 15, 30, 18);
                
                // Bone staff - 3x size
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(63, 15, 6, 54);
                graphics.fillCircle(66, 9, 9);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(66, 9, 4.5);
                break;
                
            case 'up':
            case 'left':
            case 'right':
            case 'downleft':
            case 'downright':
            case 'upleft':
            case 'upright':
                // Similar structure - 3x size
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(36, 45, 33, 27);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(18, 30, 36, 36);
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(18, 36, 9, 6);
                graphics.fillRect(24, 57, 12, 12);
                graphics.fillRect(36, 57, 12, 12);
                graphics.fillCircle(36, 24, 15);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(direction === 'left' ? 42 : 30, 21, 3);
                break;
        }
    }
    
    // BOSS ENEMY SPRITES
    createBoneLordSprites(graphics) {
        // Create all 8 directional sprites for bone lord boss
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawBoneLord(graphics, direction);
            graphics.generateTexture(`boneLord_${direction}`, 96, 96); // 3x larger boss sprites
        });
        
        graphics.clear();
        this.drawBoneLord(graphics, 'down');
        graphics.generateTexture('boneLord', 96, 96);
    }
    
    drawBoneLord(graphics, direction) {
        switch (direction) {
            case 'down':
                // Large skeletal boss body
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(16, 20, 16, 12);
                
                // Armored ribcage
                graphics.fillStyle(0x696969, 1);
                graphics.fillRect(10, 16, 12, 8);
                
                // Massive bone arms
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(4, 16, 6, 4);
                graphics.fillRect(22, 16, 6, 4);
                
                // Bone joints
                graphics.fillStyle(0xe6e6e6, 1);
                graphics.fillCircle(7, 18, 2);
                graphics.fillCircle(25, 18, 2);
                
                // Massive legs
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(11, 25, 4, 6);
                graphics.fillRect(17, 25, 4, 6);
                
                // Large skull head
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillCircle(16, 10, 8);
                
                // Glowing eye sockets
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(13, 8, 3);
                graphics.fillCircle(19, 8, 3);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(13, 8, 2);
                graphics.fillCircle(19, 8, 2);
                
                // Bone crown
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillTriangle(12, 4, 16, 1, 20, 4);
                graphics.fillTriangle(10, 5, 13, 2, 15, 5);
                graphics.fillTriangle(17, 5, 19, 2, 22, 5);
                
                // Massive bone sword
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(28, 8, 4, 20);
                graphics.fillRect(26, 28, 8, 3);
                
                // Bone shield
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(2, 18, 6, 10);
                graphics.fillStyle(0x696969, 1);
                graphics.fillCircle(2, 18, 2);
                break;
                
            case 'up':
            case 'left':
            case 'right':
                // Similar massive structure
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(16, 20, 16, 12);
                graphics.fillStyle(0x696969, 1);
                graphics.fillRect(10, 16, 12, 8);
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(8, 16, 6, 4);
                graphics.fillRect(11, 25, 4, 6);
                graphics.fillRect(17, 25, 4, 6);
                graphics.fillCircle(16, 10, 8);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(direction === 'left' ? 19 : 13, 8, 2);
                break;
        }
    }
    
    createDemonLordSprites(graphics) {
        // Create all 8 directional sprites for demon lord boss
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawDemonLord(graphics, direction);
            graphics.generateTexture(`demonLord_${direction}`, 96, 96); // 3x larger boss sprites
        });
        
        graphics.clear();
        this.drawDemonLord(graphics, 'down');
        graphics.generateTexture('demonLord', 96, 96);
    }
    
    drawDemonLord(graphics, direction) {
        switch (direction) {
            case 'down':
                // Massive demonic body
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(16, 20, 18, 14);
                
                // Large bat wings
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(2, 16, 12, 10, 12, 22);
                graphics.fillTriangle(30, 16, 20, 10, 20, 22);
                
                // Muscular arms
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(5, 16, 6, 4);
                graphics.fillRect(21, 16, 6, 4);
                
                // Large claws
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(2, 18, 5, 20, 6, 17);
                graphics.fillTriangle(26, 17, 27, 20, 30, 18);
                
                // Powerful legs
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(10, 25, 5, 6);
                graphics.fillRect(17, 25, 5, 6);
                
                // Hooves
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(10, 30, 5, 2);
                graphics.fillRect(17, 30, 5, 2);
                
                // Massive demonic head
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillCircle(16, 10, 9);
                
                // Large horns
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(10, 4, 12, 0, 14, 4);
                graphics.fillTriangle(18, 4, 20, 0, 22, 4);
                
                // Glowing eyes
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(13, 8, 2.5);
                graphics.fillCircle(19, 8, 2.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(13, 8, 1.5);
                graphics.fillCircle(19, 8, 1.5);
                
                // Fanged mouth
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(14, 12, 4, 3);
                graphics.fillStyle(0xffffff, 1);
                graphics.fillTriangle(12, 12, 11, 15, 13, 15);
                graphics.fillTriangle(20, 12, 19, 15, 21, 15);
                break;
                
            case 'up':
            case 'left':
            case 'right':
                // Similar massive structure
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillEllipse(16, 20, 18, 14);
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillTriangle(8, 16, 14, 10, 14, 22);
                graphics.fillStyle(0x8b0000, 1);
                graphics.fillRect(8, 16, 6, 4);
                graphics.fillRect(10, 25, 5, 6);
                graphics.fillRect(17, 25, 5, 6);
                graphics.fillCircle(16, 10, 9);
                graphics.fillStyle(0xffff00, 1);
                graphics.fillCircle(direction === 'left' ? 19 : 13, 8, 2.5);
                break;
        }
    }
    
    createLichKingSprites(graphics) {
        // Create all 8 directional sprites for lich king boss
        ['down', 'up', 'left', 'right', 'downleft', 'downright', 'upleft', 'upright'].forEach(direction => {
            graphics.clear();
            this.drawLichKing(graphics, direction);
            graphics.generateTexture(`lichKing_${direction}`, 96, 96); // 3x larger boss sprites
        });
        
        graphics.clear();
        this.drawLichKing(graphics, 'down');
        graphics.generateTexture('lichKing', 96, 96);
    }
    
    drawLichKing(graphics, direction) {
        switch (direction) {
            case 'down':
                // Lich King body
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(16, 20, 14, 12);
                
                // Ancient robes
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(8, 14, 16, 14);
                
                // Mystical runes on robes
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillRect(10, 16, 2, 1);
                graphics.fillRect(20, 16, 2, 1);
                graphics.fillRect(12, 20, 8, 1);
                graphics.fillRect(14, 24, 4, 1);
                
                // Skeletal arms
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(4, 16, 5, 3);
                graphics.fillRect(23, 16, 5, 3);
                
                // Floating above ground (no visible legs)
                graphics.fillStyle(0x1a1a1a, 0.8);
                graphics.fillEllipse(16, 28, 12, 4);
                
                // Lich skull head
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillCircle(16, 10, 7);
                
                // Empty eye sockets
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(13, 8, 2.5);
                graphics.fillCircle(19, 8, 2.5);
                
                // Blue flame eyes
                graphics.fillStyle(0x0088ff, 1);
                graphics.fillCircle(13, 8, 1.5);
                graphics.fillCircle(19, 8, 1.5);
                graphics.fillStyle(0x00ffff, 0.8);
                graphics.fillCircle(13, 8, 1);
                graphics.fillCircle(19, 8, 1);
                
                // Crown of power
                graphics.fillStyle(0xffd700, 1);
                graphics.fillRect(10, 4, 12, 2);
                graphics.fillTriangle(14, 4, 16, 1, 18, 4);
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(16, 3, 1);
                
                // Staff of ultimate power
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(28, 6, 3, 24);
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(29.5, 4, 4);
                graphics.fillStyle(0x0088ff, 0.7);
                graphics.fillCircle(29.5, 4, 3);
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(29.5, 4, 2);
                
                // Floating magical orbs
                graphics.fillStyle(0x8800ff, 0.8);
                graphics.fillCircle(8, 12, 2);
                graphics.fillCircle(24, 14, 2);
                graphics.fillCircle(6, 22, 1.5);
                break;
                
            case 'up':
            case 'left':
            case 'right':
                // Similar structure
                graphics.fillStyle(0x2f2f2f, 1);
                graphics.fillEllipse(16, 20, 14, 12);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(8, 14, 16, 14);
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(6, 16, 5, 3);
                graphics.fillCircle(16, 10, 7);
                graphics.fillStyle(0x0088ff, 1);
                graphics.fillCircle(direction === 'left' ? 19 : 13, 8, 1.5);
                break;
        }
    }

    create() {
        this.scene.start('GameScene');
    }
}