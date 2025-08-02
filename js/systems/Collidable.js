// Base class for all collidable entities
class Collidable extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        
        // Collision properties
        this.collisionGroup = null;
        this.collisionMask = [];
        this.collisionActive = true;
        this.collisionEvents = new Map(); // Track active collisions
        
        // Collision callbacks
        this.onCollisionEnter = null;
        this.onCollisionStay = null;
        this.onCollisionExit = null;
    }

    // Set collision group this entity belongs to
    setCollisionGroup(group) {
        this.collisionGroup = group;
        return this;
    }

    // Set which groups this entity can collide with
    setCollisionMask(groups) {
        this.collisionMask = Array.isArray(groups) ? groups : [groups];
        return this;
    }

    // Enable/disable collision detection
    setCollisionActive(active) {
        this.collisionActive = active;
        if (this.body) {
            this.body.enable = active;
        }
        return this;
    }

    // Handle collision start
    handleCollisionEnter(other, data = {}) {
        if (!this.collisionActive || !this.scene || !this.active) return;
        
        const collisionId = this.getCollisionId(other);
        
        if (!this.collisionEvents.has(collisionId)) {
            this.collisionEvents.set(collisionId, {
                other: other,
                startTime: this.scene.time.now,
                data: data
            });
            
            if (this.onCollisionEnter) {
                this.onCollisionEnter(other, data);
            }
        }
    }

    // Handle ongoing collision
    handleCollisionStay(other, data = {}) {
        if (!this.collisionActive || !this.scene || !this.active) return;
        
        const collisionId = this.getCollisionId(other);
        
        if (this.collisionEvents.has(collisionId)) {
            const collision = this.collisionEvents.get(collisionId);
            collision.data = data;
            
            if (this.onCollisionStay) {
                this.onCollisionStay(other, collision.startTime, data);
            }
        } else {
            // If we don't have a record, treat as enter
            this.handleCollisionEnter(other, data);
        }
    }

    // Handle collision end
    handleCollisionExit(other) {
        if (!this.collisionActive) return;
        
        const collisionId = this.getCollisionId(other);
        
        if (this.collisionEvents.has(collisionId)) {
            const collision = this.collisionEvents.get(collisionId);
            this.collisionEvents.delete(collisionId);
            
            if (this.onCollisionExit) {
                this.onCollisionExit(other, collision.data);
            }
        }
    }

    // Generate unique collision ID
    getCollisionId(other) {
        // Use object references for ID
        return `${this.constructor.name}_${other.constructor.name}_${other.id || other.x + '_' + other.y}`;
    }

    // Check if currently colliding with specific object
    isCollidingWith(other) {
        const collisionId = this.getCollisionId(other);
        return this.collisionEvents.has(collisionId);
    }

    // Get all current collisions
    getActiveCollisions() {
        return Array.from(this.collisionEvents.values());
    }

    // Clear all collision events
    clearCollisions() {
        this.collisionEvents.forEach((collision, id) => {
            if (this.onCollisionExit) {
                this.onCollisionExit(collision.other, collision.data);
            }
        });
        this.collisionEvents.clear();
    }

    // Override destroy to clean up
    destroy() {
        this.clearCollisions();
        super.destroy();
    }
}

// Collision groups enum
Collidable.Groups = {
    PLAYER: 'player',
    ENEMY: 'enemy',
    PLAYER_PROJECTILE: 'player_projectile',
    ENEMY_PROJECTILE: 'enemy_projectile',
    WALL: 'wall',
    ITEM: 'item',
    PORTAL: 'portal',
    AREA_EFFECT: 'area_effect',
    TRIGGER: 'trigger'
};

// Utility class for collision configuration
class CollisionConfig {
    constructor() {
        this.groups = new Map();
        this.initializeGroups();
    }

    initializeGroups() {
        // Define collision relationships
        this.addGroup(Collidable.Groups.PLAYER, {
            collidesWith: [
                Collidable.Groups.ENEMY,
                Collidable.Groups.WALL,
                Collidable.Groups.ITEM,
                Collidable.Groups.PORTAL,
                Collidable.Groups.ENEMY_PROJECTILE,
                Collidable.Groups.AREA_EFFECT
            ]
        });

        this.addGroup(Collidable.Groups.ENEMY, {
            collidesWith: [
                Collidable.Groups.PLAYER,
                Collidable.Groups.ENEMY,
                Collidable.Groups.WALL,
                Collidable.Groups.PLAYER_PROJECTILE,
                Collidable.Groups.AREA_EFFECT
            ]
        });

        this.addGroup(Collidable.Groups.PLAYER_PROJECTILE, {
            collidesWith: [
                Collidable.Groups.ENEMY,
                Collidable.Groups.WALL
            ]
        });

        this.addGroup(Collidable.Groups.ENEMY_PROJECTILE, {
            collidesWith: [
                Collidable.Groups.PLAYER,
                Collidable.Groups.WALL
            ]
        });

        this.addGroup(Collidable.Groups.WALL, {
            collidesWith: [] // Walls don't initiate collisions
        });

        this.addGroup(Collidable.Groups.ITEM, {
            collidesWith: [Collidable.Groups.PLAYER]
        });

        this.addGroup(Collidable.Groups.PORTAL, {
            collidesWith: [Collidable.Groups.PLAYER]
        });

        this.addGroup(Collidable.Groups.AREA_EFFECT, {
            collidesWith: [
                Collidable.Groups.PLAYER,
                Collidable.Groups.ENEMY
            ]
        });
    }

    addGroup(name, config) {
        this.groups.set(name, config);
    }

    getGroupConfig(name) {
        return this.groups.get(name);
    }

    canCollide(group1, group2) {
        const config1 = this.groups.get(group1);
        const config2 = this.groups.get(group2);
        
        if (!config1 || !config2) return false;
        
        return config1.collidesWith.includes(group2) || 
               config2.collidesWith.includes(group1);
    }
}

// Global collision configuration instance
CollisionConfig.instance = new CollisionConfig();