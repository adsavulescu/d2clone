class WorldGenerator {
    constructor(scene, width, height, tileSize, worldLevel = 1) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.worldLevel = worldLevel;
        this.tiles = ['grass', 'dirt', 'stone'];
        
        // Town hall is always in the center
        this.townHallCenter = {
            x: Math.floor(this.width / 2),
            y: Math.floor(this.height / 2)
        };
        
        // Safe zone radius around town hall (in tiles)
        this.safeZoneRadius = 24;
        
        // Generate random exit point (not near town hall)
        this.generateExitPoint();
        
        // Ensure deterministic random seed based on world level for consistency
        this.worldSeed = worldLevel * 12345;
    }
    
    generate() {
        const noiseScale = 0.1;
        const tileGroup = this.scene.add.group();
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const worldX = x * this.tileSize;
                const worldY = y * this.tileSize;
                
                let tileType;
                
                // Check if we're in town hall area
                if (this.isInTownHall(x, y)) {
                    tileType = this.getTownHallTile(x, y);
                } else {
                    // Normal terrain generation
                    const noiseValue = this.perlinNoise(x * noiseScale, y * noiseScale);
                    
                    if (noiseValue < 0.3) {
                        tileType = 'stone';
                    } else if (noiseValue < 0.6) {
                        tileType = 'dirt';
                    } else {
                        tileType = 'grass';
                    }
                }
                
                const tile = this.scene.add.image(worldX, worldY, tileType);
                tile.setOrigin(0, 0);
                tileGroup.add(tile);
            }
        }
        
        // Add town hall structures
        this.generateTownHallStructures(tileGroup);
        
        // Add exit portal
        this.generateExitPortal(tileGroup);
        
        return tileGroup;
    }
    
    perlinNoise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];
        
        return this.lerp(v,
            this.lerp(u, this.grad(this.p[aa], x, y), this.grad(this.p[ba], x - 1, y)),
            this.lerp(u, this.grad(this.p[ab], x, y - 1), this.grad(this.p[bb], x - 1, y - 1))
        );
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    get p() {
        if (!this._p) {
            const p = [];
            for (let i = 0; i < 256; i++) {
                p[i] = i;
            }
            
            for (let i = 255; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [p[i], p[j]] = [p[j], p[i]];
            }
            
            this._p = new Array(512);
            for (let i = 0; i < 512; i++) {
                this._p[i] = p[i & 255];
            }
        }
        return this._p;
    }
    
    generateExitPoint() {
        // Generate exit point far from town hall
        const minDistance = 40; // minimum distance from town hall in tiles (safe zone + buffer)
        let attempts = 0;
        
        do {
            this.exitPoint = {
                x: Phaser.Math.Between(5, this.width - 5),
                y: Phaser.Math.Between(5, this.height - 5)
            };
            attempts++;
        } while (this.getDistanceToTownHall(this.exitPoint.x, this.exitPoint.y) < minDistance && attempts < 100);
    }
    
    isInTownHall(x, y) {
        const distance = this.getDistanceToTownHall(x, y);
        return distance <= 18; // Town hall radius (3x bigger)
    }
    
    isInSafeZone(x, y) {
        const distance = this.getDistanceToTownHall(x, y);
        return distance <= this.safeZoneRadius;
    }
    
    getDistanceToTownHall(x, y) {
        const dx = x - this.townHallCenter.x;
        const dy = y - this.townHallCenter.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getTownHallTile(x, y) {
        const distance = this.getDistanceToTownHall(x, y);
        const dx = x - this.townHallCenter.x;
        const dy = y - this.townHallCenter.y;
        
        // Center building (3x bigger)
        if (distance <= 6) {
            return 'stone';
        }
        // Inner courtyard (3x bigger)
        else if (distance <= 12) {
            // Create paths
            if (Math.abs(dx) <= 3 || Math.abs(dy) <= 3) {
                return 'dirt';
            }
            return 'grass';
        }
        // Outer town area
        else {
            return 'grass';
        }
    }
    
    generateTownHallStructures(tileGroup) {
        const centerX = this.townHallCenter.x * this.tileSize;
        const centerY = this.townHallCenter.y * this.tileSize;
        
        // Main town hall building (visual marker - 3x bigger)
        const townHall = this.scene.add.graphics();
        townHall.fillStyle(0x8B4513, 1); // Brown color
        townHall.fillRect(centerX - 96, centerY - 96, 192, 192);
        townHall.lineStyle(3, 0x654321, 1);
        townHall.strokeRect(centerX - 96, centerY - 96, 192, 192);
        
        // Add roof (3x bigger)
        townHall.fillStyle(0x654321, 1);
        townHall.fillTriangle(
            centerX - 120, centerY - 96,
            centerX + 120, centerY - 96,
            centerX, centerY - 150
        );
        
        // Add door (3x bigger)
        townHall.fillStyle(0x2F1B14, 1);
        townHall.fillRect(centerX - 24, centerY + 48, 48, 48);
        
        townHall.setDepth(100);
        tileGroup.add(townHall);
        
        // Add town hall label
        const label = this.scene.add.text(centerX, centerY - 60, `Town Hall\nWorld ${this.worldLevel}`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold',
            align: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(101);
        tileGroup.add(label);
    }
    
    generateExitPortal(tileGroup) {
        const portalX = this.exitPoint.x * this.tileSize;
        const portalY = this.exitPoint.y * this.tileSize;
        
        // Create portal visual with glow effect
        const portal = this.scene.add.graphics();
        
        // Outer glow
        portal.fillStyle(0x9400D3, 0.3);
        portal.fillCircle(portalX, portalY, 30);
        
        // Main portal
        portal.fillStyle(0x9400D3, 0.8);
        portal.fillCircle(portalX, portalY, 20);
        portal.lineStyle(3, 0xFF00FF, 1);
        portal.strokeCircle(portalX, portalY, 20);
        
        // Inner swirl
        portal.fillStyle(0x000000, 0.6);
        portal.fillCircle(portalX, portalY, 12);
        
        // Add swirling effect
        portal.lineStyle(2, 0xFFFFFF, 0.8);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = portalX + Math.cos(angle) * 15;
            const startY = portalY + Math.sin(angle) * 15;
            const endX = portalX + Math.cos(angle + 0.5) * 10;
            const endY = portalY + Math.sin(angle + 0.5) * 10;
            portal.lineBetween(startX, startY, endX, endY);
        }
        
        portal.setDepth(100);
        
        // Store portal reference for collision detection
        portal.isExitPortal = true;
        portal.worldX = portalX;
        portal.worldY = portalY;
        
        tileGroup.add(portal);
        
        // Add portal label with better visibility
        const label = this.scene.add.text(portalX, portalY - 40, `Exit to World ${this.worldLevel + 1}`, {
            fontSize: '14px',
            fill: '#ffff00',
            fontWeight: 'bold',
            backgroundColor: 'rgba(148, 0, 211, 0.8)',
            padding: { x: 8, y: 4 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setDepth(101);
        tileGroup.add(label);
        
        return portal;
    }
    
    getTownHallSpawnPosition() {
        return {
            x: this.townHallCenter.x * this.tileSize,
            y: this.townHallCenter.y * this.tileSize
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
        const margin = 100;
        let attempts = 0;
        const maxAttempts = count * 10;
        
        while (positions.length < count && attempts < maxAttempts) {
            const x = Phaser.Math.Between(margin, this.width * this.tileSize - margin);
            const y = Phaser.Math.Between(margin, this.height * this.tileSize - margin);
            
            // Convert to tile coordinates for safe zone check
            const tileX = Math.floor(x / this.tileSize);
            const tileY = Math.floor(y / this.tileSize);
            
            // Only spawn if not in safe zone
            if (!this.isInSafeZone(tileX, tileY)) {
                positions.push({ x, y });
            }
            
            attempts++;
        }
        
        return positions;
    }
}