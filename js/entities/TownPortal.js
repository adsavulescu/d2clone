class TownPortal extends Collidable {
    constructor(scene, x, y, isReturnPortal = false, returnData = null) {
        // First create the portal texture if it doesn't exist
        if (!scene.textures.exists('townportal')) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            
            // Offset to center the ellipses in the texture
            const centerX = 64;
            const centerY = 96;
            
            // Portal base (dark blue oval)
            graphics.fillStyle(0x000033, 0.8);
            graphics.fillEllipse(centerX, centerY, 64, 96);
            
            // Inner swirl (lighter blue)
            graphics.fillStyle(0x0066ff, 0.6);
            graphics.fillEllipse(centerX, centerY, 48, 72);
            
            // Core (bright blue)
            graphics.fillStyle(0x00aaff, 0.8);
            graphics.fillEllipse(centerX, centerY, 32, 48);
            
            // Generate texture with proper dimensions
            graphics.generateTexture('townportal', 128, 192);
            graphics.destroy();
        }
        
        // Now call parent constructor with the texture
        super(scene, x, y, 'townportal');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Portal properties
        this.isReturnPortal = isReturnPortal;
        this.returnData = returnData; // Store return position and world level
        
        // Set collision group
        this.setCollisionGroup(Collidable.Groups.PORTAL);
        this.setCollisionMask([Collidable.Groups.PLAYER]);
        
        // Setup collision handlers
        this.setupCollisionHandlers();
        
        // Make it static
        this.body.setImmovable(true);
        this.body.moves = false;
        
        // Portal appearance
        this.createPortalVisuals();
        
        // Animation
        this.createPortalAnimation();
        
        // Interaction zone - set proper collision box
        this.body.setSize(64, 96);
        // No offset needed since sprite is centered
        
        // Prevent multiple uses in quick succession
        this.cooldown = false;
        this.cooldownTime = 1000; // 1 second cooldown
    }
    
    createPortalVisuals() {
        // The texture is already created in the constructor
        this.setDepth(100);
        
        // Add glow effect
        this.glowEffect = this.scene.add.graphics();
        this.glowEffect.x = this.x;
        this.glowEffect.y = this.y;
        this.glowEffect.lineStyle(4, 0x0099ff, 0.5);
        this.glowEffect.strokeEllipse(0, 0, 68, 100);
        this.glowEffect.setDepth(99);
        
        // Make portal interactive for clicking
        this.setInteractive({ useHandCursor: true });
        
        // Add click handler
        this.on('pointerdown', () => {
            if (!this.cooldown && this.scene.player && !this.scene.player.isDead) {
                // Set this portal as the player's target to move towards it
                this.scene.playerTarget = { x: this.x, y: this.y };
                this.scene.player.targetPortal = this;
            }
        });
    }
    
    createPortalAnimation() {
        // Create swirling animation effect
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Pulsing glow effect
        this.scene.tweens.add({
            targets: this.glowEffect,
            alpha: { from: 0.3, to: 0.8 },
            duration: 1500,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
    
    setupCollisionHandlers() {
        // Use the collision callback system
        this.onCollisionEnter = (other, data) => {
            if (data.group === Collidable.Groups.PLAYER && !this.cooldown) {
                // Check if this portal is the player's target portal
                if (other.targetPortal === this) {
                    this.handlePortalUse(other);
                    other.targetPortal = null; // Clear the target portal
                }
            }
        };
        
        // Also handle collision stay in case the player stops exactly at the portal
        this.onCollisionStay = (other, data) => {
            if (data.group === Collidable.Groups.PLAYER && !this.cooldown) {
                // Check if this portal is the player's target portal
                if (other.targetPortal === this) {
                    this.handlePortalUse(other);
                    other.targetPortal = null; // Clear the target portal
                }
            }
        };
    }
    
    handlePortalUse(player) {
        // Prevent spam clicking
        if (this.cooldown) return;
        
        this.cooldown = true;
        this.scene.time.delayedCall(this.cooldownTime, () => {
            this.cooldown = false;
        });
        
        if (this.isReturnPortal && this.returnData) {
            // This is a return portal in town - go back to original location
            this.scene.returnFromTown(this.returnData);
            
            // Destroy both portals after use
            this.destroyPortal();
        } else {
            // This is the field portal - go to town
            const returnData = {
                x: player.x,
                y: player.y,
                worldLevel: this.scene.currentWorldLevel || 1
            };
            
            this.scene.teleportToTown(returnData);
        }
    }
    
    destroyPortal() {
        // Fade out effect
        this.scene.tweens.add({
            targets: [this, this.glowEffect],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.glowEffect.destroy();
                this.destroy();
            }
        });
    }
    
    destroy() {
        if (this.glowEffect && !this.glowEffect.destroyed) {
            this.glowEffect.destroy();
        }
        super.destroy();
    }
}