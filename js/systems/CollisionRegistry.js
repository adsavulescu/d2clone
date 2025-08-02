class CollisionRegistry {
    constructor(scene) {
        this.scene = scene;
        this.groups = new Map();
        this.colliders = new Map();
        this.overlaps = new Map();
        this.eventBus = CollisionEventBus.getInstance();
        this.processCallbacks = new Map();
        this.activeCollisions = new Map(); // Track ongoing collisions
    }

    // Register a physics group
    registerGroup(name, config = {}) {
        const defaultConfig = {
            classType: config.classType || Phaser.GameObjects.Sprite,
            maxSize: config.maxSize || -1,
            runChildUpdate: config.runChildUpdate !== false,
            createCallback: config.createCallback || null,
            removeCallback: config.removeCallback || null
        };

        const group = this.scene.physics.add.group(defaultConfig);
        
        this.groups.set(name, {
            group: group,
            config: config,
            entities: new Set()
        });

        return group;
    }

    // Get a registered group
    getGroup(name) {
        const groupData = this.groups.get(name);
        return groupData ? groupData.group : null;
    }

    // Add entity to a group
    addToGroup(entity, groupName) {
        const groupData = this.groups.get(groupName);
        if (!groupData) {
            console.warn(`Group ${groupName} not registered`);
            return false;
        }

        groupData.group.add(entity);
        groupData.entities.add(entity);
        
        // Set collision group on entity if it's collidable
        if (entity.setCollisionGroup) {
            entity.setCollisionGroup(groupName);
        }

        return true;
    }

    // Remove entity from a group
    removeFromGroup(entity, groupName) {
        const groupData = this.groups.get(groupName);
        if (!groupData) return false;

        groupData.group.remove(entity);
        groupData.entities.delete(entity);

        return true;
    }

    // Add collision rule between two groups
    addCollisionRule(group1Name, group2Name, type = 'collider', handler = null) {
        const group1 = this.getGroup(group1Name);
        const group2 = this.getGroup(group2Name);

        if (!group1 || !group2) {
            console.warn(`Cannot add collision rule: missing group ${!group1 ? group1Name : group2Name}`);
            return null;
        }

        const key = `${group1Name}_${group2Name}`;
        
        // Create process callback that handles enter/stay/exit events
        const processCallback = (obj1, obj2) => {
            if (!obj1 || !obj2 || !obj1.active || !obj2.active) return false;
            if (!obj1.scene || !obj2.scene) return false;
            
            // Check if entities have collision enabled
            if (obj1.collisionActive === false || obj2.collisionActive === false) {
                return false;
            }

            // Track collision state
            const collisionKey = `${obj1.id || obj1.x}_${obj2.id || obj2.x}`;
            const wasColliding = this.activeCollisions.has(collisionKey);
            
            if (!wasColliding) {
                // New collision - emit enter events
                this.activeCollisions.set(collisionKey, { obj1, obj2, startTime: this.scene.time.now });
                
                if (obj1.handleCollisionEnter) {
                    obj1.handleCollisionEnter(obj2, { group: group2Name });
                }
                if (obj2.handleCollisionEnter) {
                    obj2.handleCollisionEnter(obj1, { group: group1Name });
                }
                
                // Emit event bus events
                const eventType = `${group1Name}_${group2Name}`;
                this.eventBus.emit(eventType, { obj1, obj2, type: 'enter' });
            } else {
                // Ongoing collision - emit stay events
                if (obj1.handleCollisionStay) {
                    obj1.handleCollisionStay(obj2, { group: group2Name });
                }
                if (obj2.handleCollisionStay) {
                    obj2.handleCollisionStay(obj1, { group: group1Name });
                }
                
                const eventType = `${group1Name}_${group2Name}`;
                this.eventBus.emit(eventType, { obj1, obj2, type: 'stay' });
            }

            return true;
        };

        // Create the appropriate collision handler
        let collisionHandler;
        if (type === 'collider') {
            collisionHandler = this.scene.physics.add.collider(
                group1, 
                group2, 
                handler,
                processCallback,
                this.scene
            );
            this.colliders.set(key, collisionHandler);
        } else {
            collisionHandler = this.scene.physics.add.overlap(
                group1, 
                group2, 
                handler,
                processCallback,
                this.scene
            );
            this.overlaps.set(key, collisionHandler);
        }

        return collisionHandler;
    }

    // Add collision between single object and group
    addObjectGroupCollision(object, groupName, type = 'collider', handler = null) {
        const group = this.getGroup(groupName);
        if (!group) {
            console.warn(`Cannot add collision: group ${groupName} not found`);
            return null;
        }

        const key = `obj_${object.id || Math.random()}_${groupName}`;
        
        const processCallback = (obj1, obj2) => {
            if (!obj1.active || !obj2.active) return false;
            
            if (obj1.collisionActive === false || obj2.collisionActive === false) {
                return false;
            }

            // Handle collision events
            const isObjectFirst = obj1 === object;
            const collidable = isObjectFirst ? obj1 : obj2;
            const other = isObjectFirst ? obj2 : obj1;
            
            if (collidable.handleCollisionEnter) {
                collidable.handleCollisionEnter(other, { group: groupName });
            }

            return true;
        };

        let collisionHandler;
        if (type === 'collider') {
            collisionHandler = this.scene.physics.add.collider(
                object,
                group,
                handler,
                processCallback,
                this.scene
            );
            this.colliders.set(key, collisionHandler);
        } else {
            collisionHandler = this.scene.physics.add.overlap(
                object,
                group,
                handler,
                processCallback,
                this.scene
            );
            this.overlaps.set(key, collisionHandler);
        }

        return collisionHandler;
    }

    // Update collision exit events
    update() {
        // Check for collision exits
        const toRemove = [];
        
        this.activeCollisions.forEach((collision, key) => {
            const { obj1, obj2 } = collision;
            
            // Check if objects still exist and are active
            if (!obj1.active || !obj2.active || obj1.destroyed || obj2.destroyed) {
                toRemove.push(key);
                
                // Emit exit events
                if (obj1.active && !obj1.destroyed && obj1.handleCollisionExit) {
                    obj1.handleCollisionExit(obj2);
                }
                if (obj2.active && !obj2.destroyed && obj2.handleCollisionExit) {
                    obj2.handleCollisionExit(obj1);
                }
            } else {
                // Check if they're still overlapping
                const bounds1 = obj1.getBounds();
                const bounds2 = obj2.getBounds();
                
                if (!Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2)) {
                    toRemove.push(key);
                    
                    // Emit exit events
                    if (obj1.handleCollisionExit) {
                        obj1.handleCollisionExit(obj2);
                    }
                    if (obj2.handleCollisionExit) {
                        obj2.handleCollisionExit(obj1);
                    }
                }
            }
        });
        
        toRemove.forEach(key => this.activeCollisions.delete(key));
    }

    // Remove specific collision handler
    removeCollision(key) {
        if (this.colliders.has(key)) {
            this.colliders.get(key).destroy();
            this.colliders.delete(key);
        }
        if (this.overlaps.has(key)) {
            this.overlaps.get(key).destroy();
            this.overlaps.delete(key);
        }
    }

    // Clear all collisions for a specific group
    clearGroupCollisions(groupName) {
        const keysToRemove = [];
        
        // Find all collisions involving this group
        this.colliders.forEach((collider, key) => {
            if (key.includes(groupName)) {
                keysToRemove.push(key);
            }
        });
        
        this.overlaps.forEach((overlap, key) => {
            if (key.includes(groupName)) {
                keysToRemove.push(key);
            }
        });
        
        // Remove found collisions
        keysToRemove.forEach(key => this.removeCollision(key));
    }

    // Clean up all collisions and groups
    cleanup() {
        // Destroy all colliders
        this.colliders.forEach(collider => collider.destroy());
        this.colliders.clear();
        
        // Destroy all overlaps
        this.overlaps.forEach(overlap => overlap.destroy());
        this.overlaps.clear();
        
        // Clear active collisions
        this.activeCollisions.clear();
        
        // Clear groups
        this.groups.forEach(groupData => {
            groupData.group.clear(true, true);
        });
        this.groups.clear();
        
        // Clear event bus
        this.eventBus.clear();
    }

    // Get statistics
    getStats() {
        return {
            groups: this.groups.size,
            colliders: this.colliders.size,
            overlaps: this.overlaps.size,
            activeCollisions: this.activeCollisions.size,
            entities: Array.from(this.groups.values()).reduce((sum, g) => sum + g.entities.size, 0)
        };
    }
}