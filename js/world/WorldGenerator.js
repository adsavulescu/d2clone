class WorldGenerator {
    constructor(scene, width, height, tileSize, worldLevel = 1) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.worldLevel = worldLevel;
        
        // Tile types
        this.TILE_FLOOR = 0;
        this.TILE_WALL = 1;
        this.TILE_TOWN_FLOOR = 2;
        this.TILE_TOWN_WALL = 3;
        this.TILE_PATH = 4;
        
        // Initialize the map - start with all floor tiles
        this.map = [];
        for (let y = 0; y < height; y++) {
            this.map[y] = [];
            for (let x = 0; x < width; x++) {
                this.map[y][x] = this.TILE_FLOOR;
            }
        }
        
        // Town configuration - place in center-left
        this.townCenter = {
            x: 20,
            y: Math.floor(height / 2)
        };
        this.townRadius = 15;
        
        // Wall collision group
        this.wallGroup = null;
        
        // Simple exit point (right side of map)
        this.exitPoint = {
            x: width - 5,
            y: Math.floor(height / 2)
        };
    }
    
    generate() {
        // Generate the simple town
        this.generateSimpleTown();
        
        // Add world borders
        this.addWorldBorders();
        
        // Create the visual tiles and walls
        const tileGroup = this.createTiles();
        
        // Add simple town elements
        this.addSimpleTownElements(tileGroup);
        
        // Create simple exit portal
        this.createSimpleExitPortal(tileGroup);
        
        return tileGroup;
    }
    
    generateSimpleTown() {
        const centerX = this.townCenter.x;
        const centerY = this.townCenter.y;
        const radius = this.townRadius;
        
        // Create town floor area (square)
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (this.isInBounds(x, y)) {
                    this.map[y][x] = this.TILE_TOWN_FLOOR;
                }
            }
        }
        
        // Add town walls around the perimeter
        const wallThickness = 2;
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (this.isInBounds(x, y)) {
                    // Check if this position should be a wall
                    const isOnEdge = 
                        y === centerY - radius || y === centerY + radius ||
                        x === centerX - radius || x === centerX + radius;
                    
                    const isNearEdge = 
                        y <= centerY - radius + wallThickness - 1 || 
                        y >= centerY + radius - wallThickness + 1 ||
                        x <= centerX - radius + wallThickness - 1 || 
                        x >= centerX + radius - wallThickness + 1;
                    
                    // Don't place walls in the exit area (right side, center)
                    const isExitArea = (x >= centerX + radius - 1) && (y >= centerY - 2) && (y <= centerY + 2);
                    
                    if ((isOnEdge || isNearEdge) && !isExitArea) {
                        this.map[y][x] = this.TILE_TOWN_WALL;
                    }
                }
            }
        }
        
        // Create town exit and path (on the right side) - do this AFTER walls
        const exitX = centerX + radius;
        const exitY = centerY;
        for (let i = -2; i <= 2; i++) {
            // Clear exit area - make sure it's town floor
            if (this.isInBounds(exitX, exitY + i)) {
                this.map[exitY + i][exitX] = this.TILE_TOWN_FLOOR;
            }
            // Create path leading out of town
            for (let pathX = exitX + 1; pathX <= exitX + 5; pathX++) {
                if (this.isInBounds(pathX, exitY + i)) {
                    this.map[exitY + i][pathX] = this.TILE_PATH;
                }
            }
        }
    }
    
    addWorldBorders() {
        // Add walls around the entire world border
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    this.map[y][x] = this.TILE_WALL;
                }
            }
        }
    }
    
    createTiles() {
        const tileGroup = this.scene.add.group();
        this.wallGroup = this.scene.physics.add.staticGroup();
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tileType = this.map[y][x];
                const worldX = x * this.tileSize;
                const worldY = y * this.tileSize;
                
                let tileTexture = 'grass';
                let isWall = false;
                
                switch (tileType) {
                    case this.TILE_FLOOR:
                        tileTexture = 'grass';
                        break;
                    case this.TILE_WALL:
                        tileTexture = 'stone';
                        isWall = true;
                        break;
                    case this.TILE_TOWN_FLOOR:
                        tileTexture = 'town_floor';
                        break;
                    case this.TILE_TOWN_WALL:
                        tileTexture = 'town_wall';
                        isWall = true;
                        break;
                    case this.TILE_PATH:
                        tileTexture = 'dirt';
                        break;
                }
                
                const tile = this.scene.add.sprite(worldX, worldY, tileTexture);
                tile.setOrigin(0, 0);
                tile.setDepth(0);
                tileGroup.add(tile);
                
                if (isWall) {
                    const wallSprite = this.scene.physics.add.staticSprite(worldX, worldY, tileTexture);
                    wallSprite.setOrigin(0, 0);
                    wallSprite.body.setSize(this.tileSize, this.tileSize);
                    wallSprite.setDepth(1);
                    this.wallGroup.add(wallSprite);
                }
            }
        }
        
        return tileGroup;
    }
    
    addSimpleTownElements(tileGroup) {
        const centerX = this.townCenter.x * this.tileSize;
        const centerY = this.townCenter.y * this.tileSize;
        
        // Simple town fountain in center
        const fountain = this.scene.add.graphics();
        fountain.fillStyle(0x4444ff, 1);
        fountain.fillCircle(centerX, centerY, 16);
        fountain.lineStyle(2, 0x0000ff, 1);
        fountain.strokeCircle(centerX, centerY, 16);
        fountain.setDepth(100);
        tileGroup.add(fountain);
        
        // Simple town sign
        const sign = this.scene.add.graphics();
        sign.fillStyle(0x8b4513, 1);
        sign.fillRect(centerX - 40, centerY - 60, 80, 30);
        sign.lineStyle(2, 0x654321, 1);
        sign.strokeRect(centerX - 40, centerY - 60, 80, 30);
        sign.setDepth(100);
        tileGroup.add(sign);
        
        const signText = this.scene.add.text(centerX, centerY - 45, 'TOWN', {
            fontSize: '12px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(101);
        tileGroup.add(signText);
    }
    
    createSimpleExitPortal(tileGroup) {
        const portalX = this.exitPoint.x * this.tileSize;
        const portalY = this.exitPoint.y * this.tileSize;
        
        // Simple portal visual
        const portal = this.scene.add.graphics();
        portal.fillStyle(0x9400d3, 0.8);
        portal.fillCircle(portalX, portalY, 24);
        portal.lineStyle(3, 0xff00ff, 1);
        portal.strokeCircle(portalX, portalY, 24);
        portal.setDepth(100);
        tileGroup.add(portal);
        
        // Portal text
        const portalText = this.scene.add.text(portalX, portalY + 40, 'EXIT', {
            fontSize: '10px',
            fill: '#ff00ff',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(101);
        tileGroup.add(portalText);
    }
    
    // Utility methods
    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    isInTown(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
            const tileType = this.map[tileY][tileX];
            return tileType === this.TILE_TOWN_FLOOR || 
                   tileType === this.TILE_TOWN_WALL;
        }
        return false;
    }
    
    isInSafeZone(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
            const tileType = this.map[tileY][tileX];
            return tileType === this.TILE_TOWN_FLOOR || 
                   tileType === this.TILE_TOWN_WALL || 
                   tileType === this.TILE_PATH;
        }
        return false;
    }
    
    getTownHallSpawnPosition() {
        return {
            x: this.townCenter.x * this.tileSize,
            y: this.townCenter.y * this.tileSize
        };
    }
    
    getExitPortalPosition() {
        return {
            x: this.exitPoint.x * this.tileSize,
            y: this.exitPoint.y * this.tileSize
        };
    }
    
    getSpawnablePositions(count) {
        const positions = [];
        const maxAttempts = count * 10;
        let attempts = 0;
        
        while (positions.length < count && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * (this.width - 4)) + 2;
            const y = Math.floor(Math.random() * (this.height - 4)) + 2;
            const worldX = x * this.tileSize;
            const worldY = y * this.tileSize;
            
            // Only spawn outside town and on floor tiles
            if (this.map[y][x] === this.TILE_FLOOR && !this.isInTown(worldX, worldY)) {
                positions.push({ x: worldX, y: worldY });
            }
            attempts++;
        }
        
        return positions;
    }
    
    getWallGroup() {
        return this.wallGroup;
    }
}