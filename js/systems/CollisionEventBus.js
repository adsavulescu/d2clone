class CollisionEventBus {
    constructor() {
        this.events = new Map();
        this.globalHandlers = new Set();
    }

    // Subscribe to specific collision events
    on(eventType, handler, context = null) {
        if (!this.events.has(eventType)) {
            this.events.set(eventType, new Set());
        }
        
        const boundHandler = context ? handler.bind(context) : handler;
        boundHandler._original = handler;
        boundHandler._context = context;
        
        this.events.get(eventType).add(boundHandler);
        
        // Return unsubscribe function
        return () => this.off(eventType, handler, context);
    }

    // Subscribe to all collision events
    onAll(handler, context = null) {
        const boundHandler = context ? handler.bind(context) : handler;
        boundHandler._original = handler;
        boundHandler._context = context;
        
        this.globalHandlers.add(boundHandler);
        
        return () => this.offAll(handler, context);
    }

    // Unsubscribe from specific event
    off(eventType, handler, context = null) {
        if (!this.events.has(eventType)) return;
        
        const handlers = this.events.get(eventType);
        handlers.forEach(boundHandler => {
            if (boundHandler._original === handler && boundHandler._context === context) {
                handlers.delete(boundHandler);
            }
        });
        
        if (handlers.size === 0) {
            this.events.delete(eventType);
        }
    }

    // Unsubscribe from all events
    offAll(handler, context = null) {
        this.globalHandlers.forEach(boundHandler => {
            if (boundHandler._original === handler && boundHandler._context === context) {
                this.globalHandlers.delete(boundHandler);
            }
        });
    }

    // Emit collision event
    emit(eventType, data) {
        // Call specific handlers
        if (this.events.has(eventType)) {
            this.events.get(eventType).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in collision event handler for ${eventType}:`, error);
                }
            });
        }
        
        // Call global handlers
        this.globalHandlers.forEach(handler => {
            try {
                handler(eventType, data);
            } catch (error) {
                console.error(`Error in global collision event handler:`, error);
            }
        });
    }

    // Clear all event listeners
    clear() {
        this.events.clear();
        this.globalHandlers.clear();
    }

    // Get all active event types
    getActiveEventTypes() {
        return Array.from(this.events.keys());
    }
}

// Collision event types
CollisionEventBus.Events = {
    // Entity collisions
    PLAYER_ENEMY: 'player_enemy',
    PLAYER_WALL: 'player_wall',
    PLAYER_ITEM: 'player_item',
    PLAYER_PORTAL: 'player_portal',
    
    // Projectile collisions
    PROJECTILE_ENEMY: 'projectile_enemy',
    PROJECTILE_WALL: 'projectile_wall',
    PROJECTILE_PLAYER: 'projectile_player',
    
    // Enemy collisions
    ENEMY_ENEMY: 'enemy_enemy',
    ENEMY_WALL: 'enemy_wall',
    
    // Area effect collisions
    AREA_ENEMY: 'area_enemy',
    AREA_PLAYER: 'area_player',
    
    // Special events
    COLLISION_START: 'collision_start',
    COLLISION_END: 'collision_end',
    COLLISION_STAY: 'collision_stay'
};

// Singleton instance
CollisionEventBus.instance = null;

CollisionEventBus.getInstance = function() {
    if (!CollisionEventBus.instance) {
        CollisionEventBus.instance = new CollisionEventBus();
    }
    return CollisionEventBus.instance;
};