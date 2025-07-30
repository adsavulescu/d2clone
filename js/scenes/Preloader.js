class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        this.createAssets();
        
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('enemy', 'assets/sprites/enemy.png');
        this.load.image('fireball', 'assets/sprites/fireball.png');
        this.load.image('frost', 'assets/sprites/frost.png');
        this.load.image('grass', 'assets/tiles/grass.png');
        this.load.image('stone', 'assets/tiles/stone.png');
        this.load.image('dirt', 'assets/tiles/dirt.png');
    }

    createAssets() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Create sorcerer sprites for different directions
        this.createSorcererSprites(graphics);
        
        // Create skeletal warrior sprites for different directions
        this.createSkeletalWarriorSprites(graphics);
        
        // Fireball sprite (orange circle)
        graphics.clear();
        graphics.fillStyle(0xff8800, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('fireball', 16, 16);
        
        // Frost sprite (light blue circle)
        graphics.clear();
        graphics.fillStyle(0x88ddff, 0.8);
        graphics.fillCircle(64, 64, 64);
        graphics.generateTexture('frost', 128, 128);
        
        // Chain Lightning (small lightning bolt)
        graphics.clear();
        graphics.fillStyle(0xaaffff, 1);
        graphics.fillCircle(8, 8, 4);
        graphics.generateTexture('chainLightning', 16, 16);
        
        // Ice Bolt
        graphics.clear();
        graphics.fillStyle(0xccffff, 1);
        graphics.fillTriangle(8, 2, 14, 14, 2, 14);
        graphics.generateTexture('iceBolt', 16, 16);
        
        // Meteor
        graphics.clear();
        graphics.fillStyle(0xff6600, 1);
        graphics.fillCircle(16, 16, 12);
        graphics.fillStyle(0xffaa00, 0.8);
        graphics.fillCircle(14, 14, 8);
        graphics.generateTexture('meteor', 32, 32);
        
        // Grass tile
        graphics.clear();
        graphics.fillStyle(0x228822, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('grass', 32, 32);
        
        // Stone tile
        graphics.clear();
        graphics.fillStyle(0x666666, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('stone', 32, 32);
        
        // Dirt tile
        graphics.clear();
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('dirt', 32, 32);
        
        graphics.destroy();
    }

    createSorcererSprites(graphics) {
        // Sorcerer facing down (default/front view)
        graphics.clear();
        this.drawSorcerer(graphics, 'down');
        graphics.generateTexture('sorcerer_down', 32, 32);
        
        // Sorcerer facing up (back view)
        graphics.clear();
        this.drawSorcerer(graphics, 'up');
        graphics.generateTexture('sorcerer_up', 32, 32);
        
        // Sorcerer facing left
        graphics.clear();
        this.drawSorcerer(graphics, 'left');
        graphics.generateTexture('sorcerer_left', 32, 32);
        
        // Sorcerer facing right
        graphics.clear();
        this.drawSorcerer(graphics, 'right');
        graphics.generateTexture('sorcerer_right', 32, 32);
        
        // Default player texture (facing down)
        graphics.clear();
        this.drawSorcerer(graphics, 'down');
        graphics.generateTexture('player', 32, 32);
    }
    
    drawSorcerer(graphics, direction) {
        switch (direction) {
            case 'down': // Front view
                // Robe (dark blue/purple)
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(16, 22, 18, 20);
                
                // Belt
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(8, 18, 16, 3);
                
                // Arms
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(8, 16, 4);
                graphics.fillCircle(24, 16, 4);
                
                // Head (flesh tone)
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(16, 10, 6);
                
                // Hood/hat
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(16, 8, 12, 8);
                graphics.fillTriangle(16, 2, 12, 8, 20, 8);
                
                // Staff (right side)
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(25, 8, 2, 16);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(26, 6, 3);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(26, 6, 2);
                
                // Eyes
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(14, 9, 1);
                graphics.fillCircle(18, 9, 1);
                
                // Robe trim
                graphics.lineStyle(1, 0x4444aa, 1);
                graphics.strokeEllipse(16, 22, 18, 20);
                break;
                
            case 'up': // Back view
                // Robe back
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(16, 22, 18, 20);
                
                // Belt (back view)
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(8, 18, 16, 3);
                
                // Arms
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(8, 16, 4);
                graphics.fillCircle(24, 16, 4);
                
                // Head (back of head)
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(16, 10, 6);
                
                // Hood back
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(16, 8, 12, 8);
                
                // Staff (right side, held up)
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(25, 6, 2, 18);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(26, 4, 3);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(26, 4, 2);
                
                // Robe trim
                graphics.lineStyle(1, 0x4444aa, 1);
                graphics.strokeEllipse(16, 22, 18, 20);
                break;
                
            case 'left': // Side view left
                // Robe (side view)
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(16, 22, 16, 20);
                
                // Belt
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(9, 18, 14, 3);
                
                // Visible arm
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(12, 16, 4);
                
                // Head (profile)
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(14, 10, 6);
                
                // Hood/hat (side)
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(14, 8, 10, 8);
                graphics.fillTriangle(14, 2, 10, 8, 18, 8);
                
                // Staff (held to the side)
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(6, 10, 2, 14);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(7, 8, 3);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(7, 8, 2);
                
                // Eye
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(16, 9, 1);
                
                // Robe trim
                graphics.lineStyle(1, 0x4444aa, 1);
                graphics.strokeEllipse(16, 22, 16, 20);
                break;
                
            case 'right': // Side view right
                // Robe (side view)
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillEllipse(16, 22, 16, 20);
                
                // Belt
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(9, 18, 14, 3);
                
                // Visible arm
                graphics.fillStyle(0x2a1a5a, 1);
                graphics.fillCircle(20, 16, 4);
                
                // Head (profile)
                graphics.fillStyle(0xffdbac, 1);
                graphics.fillCircle(18, 10, 6);
                
                // Hood/hat (side)
                graphics.fillStyle(0x1a0a3a, 1);
                graphics.fillEllipse(18, 8, 10, 8);
                graphics.fillTriangle(18, 2, 14, 8, 22, 8);
                
                // Staff (held to the side)
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillRect(24, 10, 2, 14);
                graphics.fillStyle(0x00aaff, 1);
                graphics.fillCircle(25, 8, 3);
                graphics.fillStyle(0x88ddff, 0.6);
                graphics.fillCircle(25, 8, 2);
                
                // Eye
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(16, 9, 1);
                
                // Robe trim
                graphics.lineStyle(1, 0x4444aa, 1);
                graphics.strokeEllipse(16, 22, 16, 20);
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
        graphics.generateTexture('skeleton_down', 24, 24);
        
        // Skeletal warrior facing up (back view)
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'up');
        graphics.generateTexture('skeleton_up', 24, 24);
        
        // Skeletal warrior facing left
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'left');
        graphics.generateTexture('skeleton_left', 24, 24);
        
        // Skeletal warrior facing right
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'right');
        graphics.generateTexture('skeleton_right', 24, 24);
        
        // Default enemy texture (facing down)
        graphics.clear();
        this.drawSkeletalWarrior(graphics, 'down');
        graphics.generateTexture('enemy', 24, 24);
    }
    
    drawSkeletalWarrior(graphics, direction) {
        switch (direction) {
            case 'down': // Front view
                // Skeletal ribcage
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(12, 15, 10, 8);
                
                // Rib bones
                graphics.lineStyle(1, 0xd3d3d3, 1);
                graphics.lineBetween(8, 13, 16, 13);
                graphics.lineBetween(8, 15, 16, 15);
                graphics.lineBetween(8, 17, 16, 17);
                
                // Arms
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(5, 13, 3, 1);
                graphics.fillRect(4, 15, 3, 1);
                graphics.fillRect(16, 13, 3, 1);
                graphics.fillRect(17, 15, 3, 1);
                
                // Legs
                graphics.fillRect(9, 19, 2, 3);
                graphics.fillRect(13, 19, 2, 3);
                
                // Skull
                graphics.fillCircle(12, 8, 4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(10, 7, 1.5);
                graphics.fillCircle(14, 7, 1.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(10, 7, 0.8);
                graphics.fillCircle(14, 7, 0.8);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(12, 8, 11, 10, 13, 10);
                
                // Sword (right side)
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(19, 6, 2, 8);
                graphics.fillStyle(0x8b4513, 1);
                graphics.fillCircle(20, 8, 0.5);
                
                // Shield (left side)
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(4, 13, 3, 4);
                break;
                
            case 'up': // Back view
                // Skeletal back
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(12, 15, 10, 8);
                
                // Spine
                graphics.lineStyle(1, 0xd3d3d3, 1);
                graphics.lineBetween(12, 11, 12, 19);
                
                // Arms (back view)
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(5, 13, 3, 1);
                graphics.fillRect(16, 13, 3, 1);
                
                // Legs
                graphics.fillRect(9, 19, 2, 3);
                graphics.fillRect(13, 19, 2, 3);
                
                // Back of skull
                graphics.fillCircle(12, 8, 4);
                
                // Sword (held up)
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(19, 4, 2, 10);
                
                // Shield (back view)
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(4, 13, 3, 4);
                break;
                
            case 'left': // Side view left
                // Skeletal torso (side view)
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(12, 15, 8, 8);
                
                // Side ribs
                graphics.lineStyle(1, 0xd3d3d3, 1);
                graphics.lineBetween(9, 13, 15, 13);
                graphics.lineBetween(9, 15, 15, 15);
                graphics.lineBetween(9, 17, 15, 17);
                
                // Visible arm
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(8, 13, 3, 1);
                graphics.fillRect(7, 15, 3, 1);
                
                // Legs (side view)
                graphics.fillRect(10, 19, 2, 3);
                graphics.fillRect(12, 19, 2, 3);
                
                // Skull (profile)
                graphics.fillCircle(11, 8, 4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(13, 7, 1.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(13, 7, 0.8);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(13, 8, 12, 10, 14, 10);
                
                // Sword (held to the side)
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(5, 8, 2, 8);
                
                // Shield (side view)
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(17, 13, 2, 4);
                break;
                
            case 'right': // Side view right  
                // Skeletal torso (side view)
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillEllipse(12, 15, 8, 8);
                
                // Side ribs
                graphics.lineStyle(1, 0xd3d3d3, 1);
                graphics.lineBetween(9, 13, 15, 13);
                graphics.lineBetween(9, 15, 15, 15);
                graphics.lineBetween(9, 17, 15, 17);
                
                // Visible arm
                graphics.fillStyle(0xf5f5dc, 1);
                graphics.fillRect(13, 13, 3, 1);
                graphics.fillRect(14, 15, 3, 1);
                
                // Legs (side view)
                graphics.fillRect(10, 19, 2, 3);
                graphics.fillRect(12, 19, 2, 3);
                
                // Skull (profile)
                graphics.fillCircle(13, 8, 4);
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(11, 7, 1.5);
                graphics.fillStyle(0xff0000, 1);
                graphics.fillCircle(11, 7, 0.8);
                graphics.fillStyle(0x000000, 1);
                graphics.fillTriangle(11, 8, 10, 10, 12, 10);
                
                // Sword (held to the side)
                graphics.fillStyle(0xa0a0a0, 1);
                graphics.fillRect(17, 8, 2, 8);
                
                // Shield (side view)
                graphics.fillStyle(0x654321, 1);
                graphics.fillEllipse(7, 13, 2, 4);
                break;
        }
    }

    create() {
        this.scene.start('GameScene');
    }
}