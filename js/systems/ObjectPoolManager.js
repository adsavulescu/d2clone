class ObjectPoolManager {
    constructor(scene) {
        this.scene = scene;
        
        // Enemy pool - will handle multiple enemy types
        this.enemyPool = this.scene.add.group({
            classType: Enemy,
            maxSize: 100,
            runChildUpdate: true,
            createCallback: (enemy) => {
                enemy.setActive(false);
                enemy.setVisible(false);
            }
        });
        
        // Projectile pools for different types
        this.projectilePools = new Map();
        
        // Item pool
        this.itemPool = this.scene.add.group({
            classType: Item,
            maxSize: 50,
            runChildUpdate: false,
            createCallback: (item) => {
                item.setActive(false);
                item.setVisible(false);
            }
        });
        
        // Track active objects for cleanup
        this.activeEnemies = new Set();
        this.activeProjectiles = new Set();
        this.activeItems = new Set();
    }
    
    // Get or create a projectile pool for a specific type
    getProjectilePool(projectileClass) {
        const className = projectileClass.name;
        
        if (!this.projectilePools.has(className)) {
            const pool = this.scene.add.group({
                classType: projectileClass,
                maxSize: 50,
                runChildUpdate: true,
                createCallback: (projectile) => {
                    projectile.setActive(false);
                    projectile.setVisible(false);
                }
            });
            this.projectilePools.set(className, pool);
        }
        
        return this.projectilePools.get(className);
    }
    
    // Spawn an enemy from the pool
    spawnEnemy(x, y, level, enemyType = 'skeleton', collisionRegistry) {
        let enemy = this.enemyPool.get();
        
        if (!enemy) {
            // Pool is full, create new enemy
            enemy = new Enemy(this.scene, x, y, enemyType, level);
            this.enemyPool.add(enemy);
        } else {
            // Reset and reuse existing enemy
            enemy.reset(x, y, enemyType, level);
        }
        
        enemy.setActive(true);
        enemy.setVisible(true);
        this.activeEnemies.add(enemy);
        
        return enemy;
    }
    
    // Despawn an enemy back to the pool
    despawnEnemy(enemy) {
        if (!enemy || enemy.destroyed) return;
        
        // Remove from active set
        this.activeEnemies.delete(enemy);
        
        // Reset enemy state
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.body.setVelocity(0, 0);
        
        // Clear any active effects or timers
        if (enemy.attackTimer) {
            enemy.attackTimer.remove();
            enemy.attackTimer = null;
        }
        
        if (enemy.projectileTimer) {
            enemy.projectileTimer.remove();
            enemy.projectileTimer = null;
        }
        
        // Return to pool
        this.enemyPool.killAndHide(enemy);
    }
    
    // Spawn a projectile from the appropriate pool
    spawnProjectile(projectileClass, x, y, targetX, targetY, damage, owner) {
        const pool = this.getProjectilePool(projectileClass);
        let projectile = pool.get();
        
        if (!projectile) {
            // Pool is full, create new projectile
            projectile = new projectileClass(this.scene, x, y, targetX, targetY, damage, owner);
            pool.add(projectile);
        } else {
            // Reset and reuse existing projectile
            if (projectile.reset) {
                projectile.reset(x, y, targetX, targetY, damage, owner);
            } else {
                // Fallback if reset method doesn't exist
                projectile.setPosition(x, y);
                projectile.damage = damage;
                projectile.owner = owner;
                
                // Recalculate velocity
                const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
                const speed = projectile.speed || 300;
                projectile.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        }
        
        projectile.setActive(true);
        projectile.setVisible(true);
        this.activeProjectiles.add(projectile);
        
        return projectile;
    }
    
    // Despawn a projectile back to its pool
    despawnProjectile(projectile) {
        if (!projectile || projectile.destroyed) return;
        
        // Remove from active set
        this.activeProjectiles.delete(projectile);
        
        // Reset projectile state
        projectile.setActive(false);
        projectile.setVisible(false);
        projectile.body.setVelocity(0, 0);
        
        // Get the appropriate pool and return projectile
        const className = projectile.constructor.name;
        const pool = this.projectilePools.get(className);
        if (pool) {
            pool.killAndHide(projectile);
        }
    }
    
    // Spawn an item from the pool
    spawnItem(x, y, itemData) {
        let item = this.itemPool.get();
        
        if (!item) {
            // Pool is full, create new item
            item = new Item(this.scene, x, y, itemData);
            this.itemPool.add(item);
        } else {
            // Reset and reuse existing item
            if (item.reset) {
                item.reset(x, y, itemData);
            } else {
                // Fallback reset
                item.setPosition(x, y);
                item.itemData = itemData;
            }
        }
        
        item.setActive(true);
        item.setVisible(true);
        this.activeItems.add(item);
        
        return item;
    }
    
    // Despawn an item back to the pool
    despawnItem(item) {
        if (!item || item.destroyed) return;
        
        // Remove from active set
        this.activeItems.delete(item);
        
        // Reset item state
        item.setActive(false);
        item.setVisible(false);
        
        // Return to pool
        this.itemPool.killAndHide(item);
    }
    
    // Clear all active objects (for world transitions)
    clearAll() {
        // Clear all active enemies
        this.activeEnemies.forEach(enemy => {
            this.despawnEnemy(enemy);
        });
        this.activeEnemies.clear();
        
        // Clear all active projectiles
        this.activeProjectiles.forEach(projectile => {
            this.despawnProjectile(projectile);
        });
        this.activeProjectiles.clear();
        
        // Clear all active items
        this.activeItems.forEach(item => {
            this.despawnItem(item);
        });
        this.activeItems.clear();
    }
    
    // Get statistics about pool usage
    getStats() {
        const stats = {
            enemies: {
                total: this.enemyPool.getLength(),
                active: this.activeEnemies.size,
                available: this.enemyPool.countInactive()
            },
            projectiles: {},
            items: {
                total: this.itemPool.getLength(),
                active: this.activeItems.size,
                available: this.itemPool.countInactive()
            }
        };
        
        // Get stats for each projectile type
        this.projectilePools.forEach((pool, className) => {
            stats.projectiles[className] = {
                total: pool.getLength(),
                active: pool.countActive(),
                available: pool.countInactive()
            };
        });
        
        return stats;
    }
    
    // Clean up the pool manager
    destroy() {
        this.clearAll();
        
        // Destroy all groups
        this.enemyPool.destroy(true);
        this.itemPool.destroy(true);
        
        this.projectilePools.forEach(pool => {
            pool.destroy(true);
        });
        this.projectilePools.clear();
    }
}