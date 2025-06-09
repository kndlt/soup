# Phase 3.2: Minimal Resource Competition Implementation

## Goal
Implement natural tree spacing through simple resource depletion, using only existing tile properties and neighbor checks.

## Core Implementation (3 Simple Changes)

### 1. Resource Consumption During Growth

In `updateTileGrowth()`, add resource consumption:

```javascript
// After successful growth (line ~540)
if (tile.growth > oldGrowth) {
    // Growing plants consume local resources
    tile.water -= 0.02 * growthRate;
    tile.nutrients -= 0.01 * growthRate;
    
    // Mature plants consume more
    if (tile.growth > 1.0) {
        tile.water -= 0.01;
        tile.nutrients -= 0.01;
    }
    
    // Clamp to valid range
    tile.water = Math.max(0, tile.water);
    tile.nutrients = Math.max(0, tile.nutrients);
}
```

### 2. Simple Resource Diffusion

In `updateResourceDiffusion()`, improve the existing function:

```javascript
function updateResourceDiffusion() {
    const changes = new Float32Array(TILE_COUNT * 2); // water and nutrient changes
    
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (tile.tileType !== 'soil' && tile.tileType !== 'root') continue;
        
        // Only check immediate neighbors (4-way)
        const neighbors = [
            i - WORLD_WIDTH, // up
            i + WORLD_WIDTH, // down
            i - 1,           // left
            i + 1            // right
        ];
        
        let waterDiff = 0;
        let nutrientDiff = 0;
        let validNeighbors = 0;
        
        for (let ni of neighbors) {
            if (ni >= 0 && ni < TILE_COUNT) {
                const neighbor = tiles[ni];
                if (neighbor.tileType === 'soil' || neighbor.tileType === 'root') {
                    waterDiff += (neighbor.water - tile.water);
                    nutrientDiff += (neighbor.nutrients - tile.nutrients);
                    validNeighbors++;
                }
            }
        }
        
        // Flow rate based on gradient
        if (validNeighbors > 0) {
            changes[i * 2] = waterDiff * 0.1;      // 10% water flow
            changes[i * 2 + 1] = nutrientDiff * 0.05; // 5% nutrient flow
        }
    }
    
    // Apply changes
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].water = Math.max(0, Math.min(1, tiles[i].water + changes[i * 2]));
        tiles[i].nutrients = Math.max(0, Math.min(1, tiles[i].nutrients + changes[i * 2 + 1]));
    }
}
```

### 3. Prevent Growth in Poor Conditions

In `updateTileGrowth()`, modify growth conditions (line ~450):

```javascript
// Check basic resources before allowing growth
const hasWater = tile.water > 0.15;      // Need 15% water minimum
const hasNutrients = tile.nutrients > 0.1; // Need 10% nutrients minimum
const hasLight = tile.light > 0.1;
const hasMood = tile.mood > 0.05;

if (hasWater && hasNutrients && hasLight && hasMood && tile.visits > 0) {
    // Calculate growth rate with resource penalty
    const resourceFactor = Math.min(tile.water * 2, tile.nutrients * 3, tile.light);
    const growthRate = 0.1 * resourceFactor;
    
    // Seedlings die in poor conditions
    if (tile.growth < 0.3 && resourceFactor < 0.3) {
        tile.growth -= 0.01;
        if (tile.growth <= 0) {
            // Reset to soil
            tile.tileType = 'soil';
            tile.treeId = null;
            // Dead plants return some nutrients
            tile.nutrients = Math.min(1, tile.nutrients + 0.2);
        }
    } else {
        // Normal growth
        tile.growth = Math.min(tile.growth + growthRate, 2);
    }
}
```

## Light Calculation (Simplified)

Replace the complex `updateTileLight()` with a single-pass system:

```javascript
function updateLightLevels() {
    // Single pass from top to bottom
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const index = y * WORLD_WIDTH + x;
            const tile = tiles[index];
            
            // Start with full light
            tile.light = 1.0;
            
            // Check tile directly above
            if (y > 0) {
                const aboveIndex = (y - 1) * WORLD_WIDTH + x;
                const above = tiles[aboveIndex];
                
                // Inherit reduced light from above
                tile.light = above.light;
                
                // Further reduce based on what's above
                if (above.tileType === 'leaf') {
                    tile.light *= 0.3;
                } else if (above.tileType === 'branch') {
                    tile.light *= 0.7;
                } else if (above.tileType === 'trunk') {
                    tile.light *= 0.9;
                }
            }
        }
    }
}
```

## Expected Behavior

1. **Seeds can plant anywhere** - No artificial spacing rules
2. **Trees deplete soil** - Creating resource-poor zones
3. **Seedlings die in poor soil** - Natural spacing emerges
4. **Resources flow locally** - Creating gradients
5. **Shade kills undergrowth** - Canopy competition

## Implementation Order

1. Add resource consumption to growth (5 lines)
2. Fix resource diffusion to actually work (20 lines)
3. Make growth check resources (10 lines)
4. Replace light calculation with simple version (15 lines)

Total: ~50 lines of changes to existing code

## Testing

1. Plant seeds close together - watch them compete
2. Mature trees should create "dead zones"
3. Forest gaps should allow new growth
4. Shaded seedlings should die
5. Resource gradients should be visible in debug mode

## Detailed Implementation Plan

Based on analysis of soup.js structure:

### Step 1: Add Resource Constants (After line 9)
```javascript
// Resource consumption rates
const WATER_CONSUMPTION_RATE = 0.02;
const NUTRIENT_CONSUMPTION_RATE = 0.01;
const MATURE_CONSUMPTION_BONUS = 0.01;
const MIN_WATER_FOR_GROWTH = 0.15;
const MIN_NUTRIENTS_FOR_GROWTH = 0.1;
```

### Step 2: Modify Resource Consumption (Lines 700-703)
Replace current fixed consumption with:
```javascript
// Consume resources based on growth activity
if (tile.growth > oldGrowth) {
    const consumptionMultiplier = tile.growth > 1.0 ? 2.0 : 1.0;
    tile.water -= WATER_CONSUMPTION_RATE * growthRate * consumptionMultiplier;
    tile.nutrients -= NUTRIENT_CONSUMPTION_RATE * growthRate * consumptionMultiplier;
    
    // Clamp values
    tile.water = Math.max(0, tile.water);
    tile.nutrients = Math.max(0, tile.nutrients);
}
```

### Step 3: Fix Resource Diffusion (Lines 792-827)
Extend existing water diffusion to handle nutrients:
```javascript
function updateResourceDiffusion() {
    const waterChanges = new Float32Array(TILE_COUNT);
    const nutrientChanges = new Float32Array(TILE_COUNT);
    
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (tile.tileType !== 'soil' && tile.tileType !== 'root') continue;
        
        const neighbors = getNeighborIndices(tile.x, tile.y);
        let waterGradient = 0;
        let nutrientGradient = 0;
        let validNeighbors = 0;
        
        for (let ni of neighbors) {
            const neighbor = tiles[ni];
            if (neighbor.tileType === 'soil' || neighbor.tileType === 'root') {
                waterGradient += (neighbor.water - tile.water);
                nutrientGradient += (neighbor.nutrients - tile.nutrients);
                validNeighbors++;
            }
        }
        
        if (validNeighbors > 0) {
            waterChanges[i] = waterGradient * 0.1 / validNeighbors;
            nutrientChanges[i] = nutrientGradient * 0.05 / validNeighbors;
        }
        
        // Roots actively uptake water
        if (tile.tileType === 'root') {
            waterChanges[i] += 0.02; // Active uptake
        }
    }
    
    // Apply changes
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].water = Math.max(0, Math.min(1, tiles[i].water + waterChanges[i]));
        tiles[i].nutrients = Math.max(0, Math.min(1, tiles[i].nutrients + nutrientChanges[i]));
    }
}
```

### Step 4: Modify Growth Conditions (Lines 454-460)
Replace binary checks with gradient-based growth:
```javascript
// Resource availability affects growth rate
const waterAvailability = Math.max(0, (tile.water - MIN_WATER_FOR_GROWTH) / (1 - MIN_WATER_FOR_GROWTH));
const nutrientAvailability = Math.max(0, (tile.nutrients - MIN_NUTRIENTS_FOR_GROWTH) / (1 - MIN_NUTRIENTS_FOR_GROWTH));
const lightAvailability = tile.light;

const resourceFactor = Math.min(waterAvailability, nutrientAvailability, lightAvailability);

if (resourceFactor > 0 && tile.mood > 0.05 && tile.visits > 0) {
    const baseGrowthRate = 0.1;
    const growthRate = baseGrowthRate * resourceFactor;
    
    // Seedling mortality in poor conditions
    if (tile.growth < 0.3 && resourceFactor < 0.2) {
        tile.growth -= 0.01;
        if (tile.growth <= 0) {
            // Death and nutrient return
            tile.tileType = 'soil';
            tile.treeId = null;
            tile.nutrients = Math.min(1, tile.nutrients + 0.15);
            console.log(`Seedling died at (${tile.x}, ${tile.y}) - poor resources`);
        }
    } else {
        // Apply growth with resource factor
        const oldGrowth = tile.growth;
        tile.growth = Math.min(tile.growth + growthRate, 2);
    }
} else if (tile.growth > 0 && tile.growth < 0.3) {
    // No resources = seedling death
    tile.growth -= 0.005;
}
```

### Step 5: Simplify Light Calculation (Lines 763-790)
Replace complex neighbor checking with vertical propagation:
```javascript
function updateLightLevels() {
    // Single downward pass
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const index = y * WORLD_WIDTH + x;
            const tile = tiles[index];
            
            if (y === 0) {
                tile.light = 1.0; // Full light at top
            } else {
                const aboveIndex = (y - 1) * WORLD_WIDTH + x;
                const above = tiles[aboveIndex];
                
                // Start with light from above
                tile.light = above.light;
                
                // Reduce based on what's above
                switch(above.tileType) {
                    case 'leaf':
                        tile.light *= 0.2; // 80% blocked
                        break;
                    case 'branch':
                        tile.light *= 0.6; // 40% blocked
                        break;
                    case 'trunk':
                        tile.light *= 0.85; // 15% blocked
                        break;
                }
            }
            
            // Minimum ambient light
            tile.light = Math.max(0.05, tile.light);
        }
    }
}
```

### Step 6: Update Main Loop (Line 231)
Replace `updateTileLight(tile, i);` with:
```javascript
updateLightLevels(); // Run once per frame instead of per tile
```

### Debugging Additions
Add to `renderDebugInfo()` around line 900:
```javascript
// Show resource levels on tiles
if (debugMode) {
    ctx.font = '8px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`W:${Math.floor(tile.water * 100)}`, x * scaleX, y * scaleY + 8);
    ctx.fillText(`N:${Math.floor(tile.nutrients * 100)}`, x * scaleX, y * scaleY + 16);
}
```

## Total Changes
- ~15 lines for constants and variables
- ~20 lines for resource consumption
- ~35 lines for diffusion improvement  
- ~25 lines for growth conditions
- ~30 lines for light calculation
- ~10 lines for debugging

**Total: ~135 lines** (more than estimated, but comprehensive)