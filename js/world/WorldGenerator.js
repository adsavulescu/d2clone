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
        
        // Initialize the map
        this.map = [];
        for (let y = 0; y < height; y++) {
            this.map[y] = [];
            for (let x = 0; x < width; x++) {
                this.map[y][x] = this.TILE_WALL;
            }
        }
        
        // Town configuration - place in top-left corner
        this.townCenter = {
            x: 20,
            y: 20
        };
        this.townRadius = 15; // Smaller town
        
        // Exit portal location will be set during generation
        this.exitPoint = null;
        
        // Dungeon generation parameters
        this.roomMinSize = 8;
        this.roomMaxSize = 16;
        this.maxRooms = 25 + worldLevel * 3;
        this.rooms = [];
        
        // Wall collision group
        this.wallGroup = null;
        
        // NPC storage
        this.npcs = [];
    }
    
    generate() {
        // Generate the town first
        this.generateTown();
        
        // Generate dungeon rooms
        this.generateDungeon();
        
        // Connect rooms with corridors
        this.connectRooms();
        
        // Ensure town exit connects to dungeon
        this.connectTownToDungeon();
        
        // Place exit portal in the furthest room
        this.placeExitPortal();
        
        // Create the visual tiles and walls
        const tileGroup = this.createTiles();
        
        // Add town structures and NPCs
        this.addTownElements(tileGroup);
        
        // Create exit portal visual
        this.createExitPortal(tileGroup);
        
        return tileGroup;
    }
    
    generateTown() {
        const centerX = this.townCenter.x;
        const centerY = this.townCenter.y;
        
        // Create town walls (square shape like Diablo 2 Act 1)
        const townSize = this.townRadius;
        const wallThickness = 2;
        
        // Clear the town area first
        for (let y = centerY - townSize; y <= centerY + townSize; y++) {
            for (let x = centerX - townSize; x <= centerX + townSize; x++) {
                if (this.isInBounds(x, y)) {
                    this.map[y][x] = this.TILE_TOWN_FLOOR;
                }
            }
        }
        
        // Add town walls
        for (let y = centerY - townSize; y <= centerY + townSize; y++) {
            for (let x = centerX - townSize; x <= centerX + townSize; x++) {
                if (!this.isInBounds(x, y)) continue;
                
                // Check if on wall perimeter
                const onHorizontalWall = (y >= centerY - townSize && y < centerY - townSize + wallThickness) ||
                                       (y > centerY + townSize - wallThickness && y <= centerY + townSize);
                const onVerticalWall = (x >= centerX - townSize && x < centerX - townSize + wallThickness) ||
                                     (x > centerX + townSize - wallThickness && x <= centerX + townSize);
                
                if (onHorizontalWall || onVerticalWall) {
                    this.map[y][x] = this.TILE_TOWN_WALL;
                }
            }
        }
        
        // Create single town gate (on the right side, leading into the dungeon)
        const gateWidth = 5;
        const gateY = centerY;
        
        // East gate only
        for (let y = gateY - gateWidth/2; y <= gateY + gateWidth/2; y++) {
            for (let x = centerX + townSize - wallThickness; x <= centerX + townSize + 1; x++) {
                if (this.isInBounds(x, Math.floor(y))) {
                    this.map[Math.floor(y)][x] = this.TILE_PATH;
                }
            }
        }
        
        // Add path from gate to center
        this.createPath(centerX + townSize - wallThickness, centerY, centerX, centerY);
        
        // Town is the first "room"
        this.rooms.push({
            x: centerX - townSize,
            y: centerY - townSize,
            width: townSize * 2,
            height: townSize * 2,
            centerX: centerX,
            centerY: centerY,
            isTown: true
        });
    }
    
    generateDungeon() {
        // First, ensure we have at least one room near the town exit
        const townRoom = this.rooms[0];
        const firstRoomX = townRoom.centerX + this.townRadius + 15;
        const firstRoomY = townRoom.centerY;
        
        // Create first room near town exit
        const firstRoom = {
            x: firstRoomX - 5,
            y: firstRoomY - 5,
            width: 10,
            height: 10,
            centerX: firstRoomX,
            centerY: firstRoomY
        };
        
        // Only add if it doesn't overlap with town
        if (!this.roomsOverlap(firstRoom, townRoom, 3)) {
            this.carveRoom(firstRoom);
            this.rooms.push(firstRoom);
        }
        
        // Generate additional rooms
        let attempts = 0;
        
        while (this.rooms.length < this.maxRooms && attempts < 1000) {
            const roomWidth = Phaser.Math.Between(this.roomMinSize, this.roomMaxSize);
            const roomHeight = Phaser.Math.Between(this.roomMinSize, this.roomMaxSize);
            const x = Phaser.Math.Between(2, this.width - roomWidth - 2);
            const y = Phaser.Math.Between(2, this.height - roomHeight - 2);
            
            const newRoom = {
                x: x,
                y: y,
                width: roomWidth,
                height: roomHeight,
                centerX: Math.floor(x + roomWidth / 2),
                centerY: Math.floor(y + roomHeight / 2)
            };
            
            // Check if room overlaps with existing rooms or town
            let canPlace = true;
            for (const room of this.rooms) {
                if (this.roomsOverlap(newRoom, room, 3)) {
                    canPlace = false;
                    break;
                }
            }
            
            if (canPlace) {
                this.carveRoom(newRoom);
                this.rooms.push(newRoom);
            }
            
            attempts++;
        }
    }
    
    roomsOverlap(room1, room2, padding = 0) {
        return !(room1.x + room1.width + padding < room2.x ||
                room2.x + room2.width + padding < room1.x ||
                room1.y + room1.height + padding < room2.y ||
                room2.y + room2.height + padding < room1.y);
    }
    
    carveRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (this.isInBounds(x, y)) {
                    this.map[y][x] = this.TILE_FLOOR;
                }
            }
        }
    }
    
    connectRooms() {
        // First, ensure all rooms are connected (excluding town)
        if (this.rooms.length <= 1) return; // Only town exists
        
        const connected = new Set([1]); // Start with first dungeon room
        const unconnected = new Set();
        
        for (let i = 2; i < this.rooms.length; i++) {
            unconnected.add(i);
        }
        
        // Connect all dungeon rooms using minimum spanning tree approach
        while (unconnected.size > 0) {
            let minDistance = Infinity;
            let closestConnected = -1;
            let closestUnconnected = -1;
            
            // Find closest pair between connected and unconnected
            for (const connectedIdx of connected) {
                for (const unconnectedIdx of unconnected) {
                    const distance = this.getDistance(this.rooms[connectedIdx], this.rooms[unconnectedIdx]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestConnected = connectedIdx;
                        closestUnconnected = unconnectedIdx;
                    }
                }
            }
            
            // Connect the closest pair
            if (closestUnconnected !== -1) {
                const room1 = this.rooms[closestConnected];
                const room2 = this.rooms[closestUnconnected];
                this.createCorridor(room1.centerX, room1.centerY, room2.centerX, room2.centerY);
                
                connected.add(closestUnconnected);
                unconnected.delete(closestUnconnected);
            } else {
                break;
            }
        }
    }
    
    connectTownToDungeon() {
        if (this.rooms.length <= 1) return; // Only town exists
        
        const townRoom = this.rooms[0];
        const townExitX = townRoom.centerX + this.townRadius + 2;
        const townExitY = townRoom.centerY;
        
        // Find the closest dungeon room to the town exit
        let closestRoom = null;
        let minDistance = Infinity;
        
        for (let i = 1; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            const dx = room.centerX - townExitX;
            const dy = room.centerY - townExitY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestRoom = room;
            }
        }
        
        // Create a corridor from town exit to the closest room
        if (closestRoom) {
            // Clear a path from town exit
            const corridorWidth = 5;
            
            // First, create a small starting area outside the town gate
            for (let x = townExitX; x < townExitX + 8; x++) {
                for (let y = townExitY - corridorWidth/2; y <= townExitY + corridorWidth/2; y++) {
                    if (this.isInBounds(x, Math.floor(y))) {
                        this.map[Math.floor(y)][x] = this.TILE_FLOOR;
                    }
                }
            }
            
            // Then connect to the nearest room
            this.createCorridor(townExitX + 5, townExitY, closestRoom.centerX, closestRoom.centerY);
        }
    }
    
    createCorridor(x1, y1, x2, y2) {
        const corridorWidth = 3;
        
        // Horizontal first, then vertical
        if (Math.random() < 0.5) {
            // Horizontal
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                for (let w = -Math.floor(corridorWidth/2); w <= Math.floor(corridorWidth/2); w++) {
                    if (this.isInBounds(x, y1 + w)) {
                        if (this.map[y1 + w][x] === this.TILE_WALL) {
                            this.map[y1 + w][x] = this.TILE_FLOOR;
                        }
                    }
                }
            }
            // Vertical
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                for (let w = -Math.floor(corridorWidth/2); w <= Math.floor(corridorWidth/2); w++) {
                    if (this.isInBounds(x2 + w, y)) {
                        if (this.map[y][x2 + w] === this.TILE_WALL) {
                            this.map[y][x2 + w] = this.TILE_FLOOR;
                        }
                    }
                }
            }
        } else {
            // Vertical first
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                for (let w = -Math.floor(corridorWidth/2); w <= Math.floor(corridorWidth/2); w++) {
                    if (this.isInBounds(x1 + w, y)) {
                        if (this.map[y][x1 + w] === this.TILE_WALL) {
                            this.map[y][x1 + w] = this.TILE_FLOOR;
                        }
                    }
                }
            }
            // Horizontal
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                for (let w = -Math.floor(corridorWidth/2); w <= Math.floor(corridorWidth/2); w++) {
                    if (this.isInBounds(x, y2 + w)) {
                        if (this.map[y2 + w][x] === this.TILE_WALL) {
                            this.map[y2 + w][x] = this.TILE_FLOOR;
                        }
                    }
                }
            }
        }
    }
    
    createPath(x1, y1, x2, y2) {
        const pathWidth = 5;
        
        // Simple straight paths for town
        if (x1 === x2) {
            // Vertical path
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                for (let w = -Math.floor(pathWidth/2); w <= Math.floor(pathWidth/2); w++) {
                    if (this.isInBounds(x1 + w, y)) {
                        this.map[y][x1 + w] = this.TILE_PATH;
                    }
                }
            }
        } else if (y1 === y2) {
            // Horizontal path
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                for (let w = -Math.floor(pathWidth/2); w <= Math.floor(pathWidth/2); w++) {
                    if (this.isInBounds(x, y1 + w)) {
                        this.map[y1 + w][x] = this.TILE_PATH;
                    }
                }
            }
        }
    }
    
    placeExitPortal() {
        // Find the room furthest from town, but ensure it's accessible
        let furthestRoom = null;
        let maxDistance = 0;
        
        const townRoom = this.rooms[0];
        
        for (let i = 1; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            const distance = this.getDistance(room, townRoom);
            // Ensure room is far enough from town (at least 50 tiles)
            if (distance > maxDistance && distance > 50) {
                maxDistance = distance;
                furthestRoom = room;
            }
        }
        
        if (furthestRoom) {
            this.exitPoint = {
                x: furthestRoom.centerX,
                y: furthestRoom.centerY
            };
        } else if (this.rooms.length > 1) {
            // Fallback to any room far from town
            for (let i = this.rooms.length - 1; i >= 1; i--) {
                const room = this.rooms[i];
                const distance = this.getDistance(room, townRoom);
                if (distance > 30) {
                    this.exitPoint = {
                        x: room.centerX,
                        y: room.centerY
                    };
                    break;
                }
            }
        }
        
        // Last resort fallback
        if (!this.exitPoint) {
            this.exitPoint = {
                x: this.width - 20,
                y: this.height - 20
            };
        }
    }
    
    createTiles() {
        const tileGroup = this.scene.add.group();
        
        // Ensure physics is available
        if (!this.scene.physics || !this.scene.physics.add) {
            console.error('Physics not available in scene!');
            return tileGroup;
        }
        
        this.wallGroup = this.scene.physics.add.staticGroup();
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const worldX = x * this.tileSize;
                const worldY = y * this.tileSize;
                const tileType = this.map[y][x];
                
                let tileTexture;
                let isWall = false;
                
                switch (tileType) {
                    case this.TILE_FLOOR:
                        tileTexture = 'dungeon_floor';
                        break;
                    case this.TILE_WALL:
                        tileTexture = 'dungeon_wall';
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
                        tileTexture = 'town_path';
                        break;
                    default:
                        tileTexture = 'dungeon_floor';
                }
                
                if (isWall) {
                    // Create both visual and collision wall
                    const wall = this.wallGroup.create(
                        worldX + this.tileSize/2, 
                        worldY + this.tileSize/2, 
                        tileTexture
                    );
                    wall.setDisplaySize(this.tileSize, this.tileSize);
                    // Physics body size is configured by the static group
                } else {
                    // Create non-collidable floor tile
                    const tile = this.scene.add.image(worldX, worldY, tileTexture);
                    tile.setOrigin(0, 0);
                    tileGroup.add(tile);
                }
            }
        }
        
        // Configure all wall bodies for optimal collision
        this.wallGroup.children.entries.forEach(wall => {
            if (wall.body) {
                // Use exact tile size for clean collision boundaries
                wall.body.setSize(this.tileSize, this.tileSize);
                wall.body.setOffset(0, 0);
                
                // Ensure walls are immovable and have proper physics settings
                wall.body.immovable = true;
                wall.body.moves = false;
            }
        });
        
        return tileGroup;
    }
    
    addTownElements(tileGroup) {
        const centerX = this.townCenter.x * this.tileSize;
        const centerY = this.townCenter.y * this.tileSize;
        
        // Grand town center fountain - much bigger and fancier
        const fountain = this.scene.add.graphics();
        
        // Outer decorative ring (stone platform)
        fountain.fillStyle(0x5a5a5a, 1);
        fountain.fillCircle(centerX, centerY, 32);
        fountain.lineStyle(3, 0x2f2f2f, 1);
        fountain.strokeCircle(centerX, centerY, 32);
        
        // Middle stone ring
        fountain.fillStyle(0x696969, 1);
        fountain.fillCircle(centerX, centerY, 26);
        fountain.lineStyle(2, 0x2f4f4f, 1);
        fountain.strokeCircle(centerX, centerY, 26);
        
        // Inner fountain rim
        fountain.fillStyle(0x708090, 1);
        fountain.fillCircle(centerX, centerY, 20);
        fountain.lineStyle(2, 0x4682b4, 0.8);
        fountain.strokeCircle(centerX, centerY, 20);
        
        // Water basin (larger)
        fountain.fillStyle(0x4682b4, 0.9);
        fountain.fillCircle(centerX, centerY, 18);
        
        // Decorative water rings
        fountain.fillStyle(0x87ceeb, 0.4);
        fountain.fillCircle(centerX, centerY, 15);
        fountain.fillStyle(0x4682b4, 0.6);
        fountain.fillCircle(centerX, centerY, 12);
        
        // Central ornate pillar (bigger)
        fountain.fillStyle(0xf5f5dc, 1);
        fountain.fillCircle(centerX, centerY, 8);
        fountain.lineStyle(2, 0xdaa520, 1);
        fountain.strokeCircle(centerX, centerY, 8);
        
        // Inner decorative core
        fountain.fillStyle(0xdaa520, 0.8);
        fountain.fillCircle(centerX, centerY, 5);
        
        // Ornate details on pillar
        fountain.fillStyle(0xffd700, 1);
        fountain.fillCircle(centerX, centerY - 6, 2);
        fountain.fillCircle(centerX, centerY + 6, 2);
        fountain.fillCircle(centerX - 6, centerY, 2);
        fountain.fillCircle(centerX + 6, centerY, 2);
        
        // More water sparkles (distributed around larger area)
        fountain.fillStyle(0x87ceeb, 0.8);
        fountain.fillCircle(centerX - 8, centerY - 6, 2);
        fountain.fillCircle(centerX + 7, centerY + 8, 1.5);
        fountain.fillCircle(centerX + 10, centerY - 4, 2);
        fountain.fillCircle(centerX - 6, centerY + 10, 1.5);
        fountain.fillCircle(centerX - 12, centerY + 3, 1);
        fountain.fillCircle(centerX + 4, centerY - 11, 1.5);
        fountain.fillCircle(centerX + 13, centerY + 5, 1);
        fountain.fillCircle(centerX - 9, centerY - 12, 1.5);
        
        // Magical glow effect
        fountain.fillStyle(0x87ceeb, 0.2);
        fountain.fillCircle(centerX, centerY, 35);
        
        fountain.setDepth(100);
        tileGroup.add(fountain);
        
        // Town buildings and NPCs removed for cleaner town
        
        // Beautiful town sign with decorative elements (wider for text)
        const signPost = this.scene.add.graphics();
        
        // Wooden sign post (taller and sturdier)
        signPost.fillStyle(0x8b4513, 1);
        signPost.fillRect(centerX - 3, centerY - 80, 6, 40);
        
        // Sign board background (extra wide and tall for plenty of text space)
        signPost.fillStyle(0x654321, 1);
        signPost.fillRoundedRect(centerX - 90, centerY - 90, 180, 50, 5);
        signPost.lineStyle(3, 0x4a2c17, 1);
        signPost.strokeRoundedRect(centerX - 90, centerY - 90, 180, 50, 5);
        
        // Decorative metal bands
        signPost.lineStyle(2, 0x2f2f2f, 1);
        signPost.strokeRoundedRect(centerX - 85, centerY - 85, 170, 40, 3);
        
        // Decorative corners (brass studs)
        signPost.fillStyle(0xdaa520, 1);
        signPost.fillCircle(centerX - 80, centerY - 80, 3);
        signPost.fillCircle(centerX + 80, centerY - 80, 3);
        signPost.fillCircle(centerX - 80, centerY - 50, 3);
        signPost.fillCircle(centerX + 80, centerY - 50, 3);
        
        // Corner decorative elements
        signPost.fillStyle(0x8b4513, 1);
        signPost.fillCircle(centerX - 82, centerY - 82, 2);
        signPost.fillCircle(centerX + 82, centerY - 82, 2);
        signPost.fillCircle(centerX - 82, centerY - 48, 2);
        signPost.fillCircle(centerX + 82, centerY - 48, 2);
        
        signPost.setDepth(101);
        tileGroup.add(signPost);
        
        // Sign text (with proper spacing)
        const signText = this.scene.add.text(centerX, centerY - 65, `Rogue Encampment\nWorld ${this.worldLevel}`, {
            fontSize: '14px',
            fill: '#f4e4bc',
            fontWeight: 'bold',
            align: 'center',
            stroke: '#2a1810',
            strokeThickness: 1,
            lineSpacing: 2
        }).setOrigin(0.5).setDepth(102);
        tileGroup.add(signText);
    }
    
    addTownBuildings(tileGroup) {
        const townSize = this.townRadius - 3;
        const centerX = this.townCenter.x;
        const centerY = this.townCenter.y;
        
        // Stash (left side)
        const stashX = (centerX - townSize/2) * this.tileSize;
        const stashY = centerY * this.tileSize;
        const stash = this.scene.add.graphics();
        stash.fillStyle(0x8b4513, 1);
        stash.fillRect(stashX - 15, stashY - 15, 30, 30);
        stash.lineStyle(2, 0x654321, 1);
        stash.strokeRect(stashX - 15, stashY - 15, 30, 30);
        stash.setDepth(100);
        tileGroup.add(stash);
        
        const stashLabel = this.scene.add.text(stashX, stashY - 25, 'Stash', {
            fontSize: '10px',
            fill: '#ffff00'
        }).setOrigin(0.5).setDepth(101);
        tileGroup.add(stashLabel);
        
        // Blacksmith (top)
        const smithX = centerX * this.tileSize;
        const smithY = (centerY - townSize/2) * this.tileSize;
        const smith = this.scene.add.graphics();
        smith.fillStyle(0x696969, 1);
        smith.fillRect(smithX - 20, smithY - 15, 40, 30);
        smith.lineStyle(2, 0x2f4f4f, 1);
        smith.strokeRect(smithX - 20, smithY - 15, 40, 30);
        smith.fillStyle(0xff4500, 1);
        smith.fillCircle(smithX, smithY, 6);
        smith.setDepth(100);
        tileGroup.add(smith);
        
        const smithLabel = this.scene.add.text(smithX, smithY - 25, 'Blacksmith', {
            fontSize: '10px',
            fill: '#ffa500'
        }).setOrigin(0.5).setDepth(101);
        tileGroup.add(smithLabel);
        
        // Merchant (bottom)
        const merchantX = centerX * this.tileSize;
        const merchantY = (centerY + townSize/2) * this.tileSize;
        const merchant = this.scene.add.graphics();
        merchant.fillStyle(0x4682b4, 1);
        merchant.fillRect(merchantX - 20, merchantY - 20, 40, 40);
        merchant.lineStyle(2, 0x191970, 1);
        merchant.strokeRect(merchantX - 20, merchantY - 20, 40, 40);
        merchant.setDepth(100);
        tileGroup.add(merchant);
        
        const merchantLabel = this.scene.add.text(merchantX, merchantY - 30, 'Merchant', {
            fontSize: '10px',
            fill: '#87ceeb'
        }).setOrigin(0.5).setDepth(101);
        tileGroup.add(merchantLabel);
    }
    
    addTownNPCs(tileGroup) {
        const npcsData = [
            { name: 'Kashya', x: -8, y: -5, color: 0xff6b6b, role: 'Captain' },
            { name: 'Akara', x: 8, y: -5, color: 0x6b6bff, role: 'Priestess' },
            { name: 'Warriv', x: -5, y: 8, color: 0x6bff6b, role: 'Caravan' },
            { name: 'Charsi', x: 0, y: -10, color: 0xffaa00, role: 'Blacksmith' },
            { name: 'Gheed', x: 0, y: 10, color: 0xffff00, role: 'Merchant' }
        ];
        
        const centerX = this.townCenter.x * this.tileSize;
        const centerY = this.townCenter.y * this.tileSize;
        
        npcsData.forEach(npcData => {
            const npcX = centerX + npcData.x * this.tileSize / 2;
            const npcY = centerY + npcData.y * this.tileSize / 2;
            
            // NPC body
            const npc = this.scene.add.graphics();
            npc.fillStyle(npcData.color, 1);
            npc.fillCircle(npcX, npcY, 10);
            npc.lineStyle(2, 0x000000, 1);
            npc.strokeCircle(npcX, npcY, 10);
            npc.setDepth(100);
            
            // NPC label
            const label = this.scene.add.text(npcX, npcY - 20, npcData.name, {
                fontSize: '10px',
                fill: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setDepth(101);
            
            tileGroup.add(npc);
            tileGroup.add(label);
            
            this.npcs.push({
                graphics: npc,
                label: label,
                data: npcData,
                x: npcX,
                y: npcY
            });
        });
    }
    
    createExitPortal(tileGroup) {
        if (!this.exitPoint) return;
        
        const portalX = this.exitPoint.x * this.tileSize;
        const portalY = this.exitPoint.y * this.tileSize;
        
        // Create portal visual with glow effect
        const portal = this.scene.add.graphics();
        
        // Outer glow
        portal.fillStyle(0x9400d3, 0.3);
        portal.fillCircle(portalX, portalY, 30);
        
        // Main portal
        portal.fillStyle(0x9400d3, 0.8);
        portal.fillCircle(portalX, portalY, 20);
        portal.lineStyle(3, 0xff00ff, 1);
        portal.strokeCircle(portalX, portalY, 20);
        
        // Inner swirl
        portal.fillStyle(0x000000, 0.6);
        portal.fillCircle(portalX, portalY, 12);
        
        // Add swirling effect
        portal.lineStyle(2, 0xffffff, 0.8);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = portalX + Math.cos(angle) * 15;
            const startY = portalY + Math.sin(angle) * 15;
            const endX = portalX + Math.cos(angle + 0.5) * 10;
            const endY = portalY + Math.sin(angle + 0.5) * 10;
            portal.lineBetween(startX, startY, endX, endY);
        }
        
        portal.setDepth(100);
        
        // Store portal reference
        portal.isExitPortal = true;
        portal.worldX = portalX;
        portal.worldY = portalY;
        
        tileGroup.add(portal);
        
        // Add portal label
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
    
    getDistance(room1, room2) {
        const dx = room1.centerX - room2.centerX;
        const dy = room1.centerY - room2.centerY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    isInSafeZone(x, y) {
        // Check if in town area
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
        if (this.exitPoint) {
            return {
                x: this.exitPoint.x * this.tileSize,
                y: this.exitPoint.y * this.tileSize
            };
        }
        return null;
    }
    
    getSpawnablePositions(count) {
        const positions = [];
        let attempts = 0;
        const maxAttempts = count * 20;
        
        while (positions.length < count && attempts < maxAttempts) {
            // Pick a random room (excluding town)
            if (this.rooms.length > 1) {
                const roomIndex = Phaser.Math.Between(1, this.rooms.length - 1);
                const room = this.rooms[roomIndex];
                
                const x = Phaser.Math.Between(room.x + 2, room.x + room.width - 2) * this.tileSize;
                const y = Phaser.Math.Between(room.y + 2, room.y + room.height - 2) * this.tileSize;
                
                positions.push({ x, y });
            }
            
            attempts++;
        }
        
        return positions;
    }
    
    getWallGroup() {
        return this.wallGroup;
    }
}