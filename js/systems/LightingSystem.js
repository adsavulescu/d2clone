class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lightSources = [];
        this.tileSize = 32;
        this.worldWidth = 150;
        this.worldHeight = 150;
        
        // Create fog of war graphics layers
        this.createFogLayers();
        
        // Update settings
        this.updateInterval = 50; // Update every 50ms for smoother lighting
        this.lastUpdate = 0;
    }
    
    createFogLayers() {
        // Create a render texture for the light mask
        this.lightMask = this.scene.add.renderTexture(0, 0, 
            this.worldWidth * this.tileSize, 
            this.worldHeight * this.tileSize
        );
        
        // Create darkness rectangle
        this.darkness = this.scene.add.rectangle(
            0, 0,
            this.worldWidth * this.tileSize,
            this.worldHeight * this.tileSize,
            0x000000,
            0.85
        );
        this.darkness.setOrigin(0, 0);
        this.darkness.setDepth(999);
        
        // Apply mask to darkness - where mask is white, darkness is hidden
        this.darkness.setMask(this.lightMask.createBitmapMask());
        
        console.log('LightingSystem initialized with mask approach');
        
        // Initial update
        this.updateLighting();
    }
    
    addLightSource(x, y, radius, intensity = 1.0, color = 0xffffff) {
        const light = {
            x: x,
            y: y,
            radius: radius,
            intensity: intensity,
            color: color,
            active: true
        };
        this.lightSources.push(light);
        console.log('Added light source at', x, y, 'with radius', radius);
        
        // Immediately update
        this.updateLighting();
        
        return light;
    }
    
    removeLightSource(light) {
        const index = this.lightSources.indexOf(light);
        if (index > -1) {
            this.lightSources.splice(index, 1);
        }
    }
    
    updateLightPosition(light, x, y) {
        if (light) {
            light.x = x;
            light.y = y;
        }
    }
    
    update(time) {
        // Throttle updates for performance
        if (time - this.lastUpdate < this.updateInterval) {
            return;
        }
        this.lastUpdate = time;
        
        // Update lighting
        this.updateLighting();
    }
    
    updateLighting() {
        // Clear the mask
        this.lightMask.clear();
        
        // Fill with black (darkness)
        this.lightMask.fill(0x000000);
        
        // Create graphics for drawing lights
        const graphics = this.scene.add.graphics();
        
        // Draw each light source as white circles
        this.lightSources.forEach(light => {
            if (light.active) {
                // Draw gradient light
                const steps = 15;
                for (let i = 0; i < steps; i++) {
                    const ratio = 1 - (i / steps);
                    const radius = light.radius * ratio;
                    const alpha = Math.pow(ratio, 1.5) * light.intensity;
                    
                    graphics.fillStyle(0xffffff, alpha);
                    graphics.fillCircle(light.x, light.y, radius);
                }
            }
        });
        
        // Draw the lights to the mask
        this.lightMask.draw(graphics);
        graphics.destroy();
    }
    
    // Check if a position is visible (within any light radius)
    isPositionVisible(x, y) {
        // Check if any light source illuminates this position
        for (const light of this.lightSources) {
            if (light.active) {
                const dx = x - light.x;
                const dy = y - light.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= light.radius) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Clean up
    destroy() {
        if (this.lightMask) {
            this.lightMask.destroy();
        }
        if (this.darkness) {
            this.darkness.destroy();
        }
        this.lightSources = [];
    }
}