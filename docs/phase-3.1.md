# Phase 3.1: Emergent Tree Spacing Through Resource Competition

## Principle

Seeds can be planted anywhere, but survival depends on available resources. Trees naturally space themselves through resource depletion, not artificial distance checks.

## Core Mechanics

### 1. Resource Depletion by Trees

Trees consume and deplete local resources:

```javascript
// In tile growth update
if (tile.tileType === 'trunk' || tile.tileType === 'root') {
    // Roots extract water and nutrients
    const extractionRate = tile.growth * 0.02;
    tile.water = Math.max(0, tile.water - extractionRate);
    tile.nutrients = Math.max(0, tile.nutrients - extractionRate * 0.7);
    
    // Mature trees deplete more
    if (tile.growth > 1.0) {
        tile.nutrients = Math.max(0, tile.nutrients - 0.01);
    }
}
```

### 2. Local Resource Diffusion

Resources flow between adjacent tiles only:

```javascript
// For each tile, exchange with immediate neighbors
const neighbors = [
    {dx: -1, dy: 0}, {dx: 1, dy: 0},
    {dx: 0, dy: -1}, {dx: 0, dy: 1}
];

let waterDelta = 0;
let nutrientDelta = 0;

for (let n of neighbors) {
    const nx = tile.x + n.dx;
    const ny = tile.y + n.dy;
    
    if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
        const neighbor = tiles[ny * WORLD_WIDTH + nx];
        
        // Water flows toward drier tiles
        waterDelta += (neighbor.water - tile.water) * 0.1;
        
        // Nutrients diffuse slowly
        nutrientDelta += (neighbor.nutrients - tile.nutrients) * 0.05;
    }
}

tile.water += waterDelta;
tile.nutrients += nutrientDelta;
```

### 3. Growth Inhibition from Resource Scarcity

Trees can't grow without resources:

```javascript
// Modify growth conditions
const minWater = 0.15;      // Need 15% water
const minNutrients = 0.1;   // Need 10% nutrients

if (tile.water < minWater || tile.nutrients < minNutrients) {
    // Stunted growth
    growthRate *= 0.1;
    
    // Seedlings die
    if (tile.growth < 0.3) {
        tile.growth -= 0.005;
        if (tile.growth <= 0) {
            // Seedling dies, returns to soil
            tile.tileType = 'soil';
            tile.treeId = null;
            // Decomposition adds some nutrients back
            tile.nutrients = Math.min(1, tile.nutrients + 0.1);
        }
    }
}
```

### 4. Root Competition Zone

Roots create nutrient-poor zones:

```javascript
// When roots grow
if (tile.tileType === 'root') {
    // Heavily deplete the tile
    tile.nutrients *= 0.95;
    tile.water *= 0.97;
    
    // Mark as "root zone" - harder for new seeds
    tile.rootDensity = Math.min(1, (tile.rootDensity || 0) + 0.1);
}

// Seeds struggle in dense root zones
if (tile.rootDensity > 0.5) {
    seedGrowthRate *= (1 - tile.rootDensity);
}
```

### 5. Light Scarcity Through Vertical Propagation

Light flows downward, accumulating shade:

```javascript
// Phase 1: Reset all tiles to full light
for (let i = 0; i < tiles.length; i++) {
    tiles[i].light = 1.0;
}

// Phase 2: Propagate shade downward (single pass from top)
for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
        const index = y * WORLD_WIDTH + x;
        const tile = tiles[index];
        
        // Check tile directly above
        if (y > 0) {
            const aboveIndex = (y - 1) * WORLD_WIDTH + x;
            const aboveTile = tiles[aboveIndex];
            
            // Inherit shade from above
            tile.light = Math.min(tile.light, aboveTile.light);
            
            // Cast additional shade if this tile blocks light
            if (tile.tileType === 'leaf') {
                tile.light *= 0.3;  // Heavy shade
            } else if (tile.tileType === 'branch') {
                tile.light *= 0.7;  // Moderate shade
            } else if (tile.tileType === 'trunk') {
                tile.light *= 0.9;  // Light shade
            }
        }
    }
}

// Light affects growth directly
if (tile.light < 0.2) {
    growthRate *= 0.1;  // Nearly no growth in deep shade
} else if (tile.light < 0.5) {
    growthRate *= 0.5;  // Reduced growth in shade
}
```

### 5.1 Shade Accumulation for Realism

To simulate overlapping canopies without complex lookups:

```javascript
// Add shade influence to tiles
if (tile.tileType === 'leaf' || tile.tileType === 'branch') {
    // Mark this tile as casting shade
    tile.shadeStrength = (tile.tileType === 'leaf') ? 0.7 : 0.3;
    
    // Spread shade influence to immediate neighbors only
    const neighbors = [{dx: -1, dy: 0}, {dx: 1, dy: 0}];
    for (let n of neighbors) {
        const nx = tile.x + n.dx;
        if (nx >= 0 && nx < WORLD_WIDTH) {
            const nIndex = tile.y * WORLD_WIDTH + nx;
            tiles[nIndex].neighborShade = Math.max(
                tiles[nIndex].neighborShade || 0,
                tile.shadeStrength * 0.5
            );
        }
    }
}

// Apply accumulated shade when calculating light
tile.light *= (1 - (tile.neighborShade || 0));
```

### 5.2 Light-Dependent Processes

Different growth stages need different light:

```javascript
// Seedlings are shade intolerant
if (tile.growth < 0.3 && tile.light < 0.4) {
    tile.growth -= 0.01;  // Die in shade
}

// Mature trees are shade tolerant
if (tile.growth > 1.0 && tile.light > 0.1) {
    // Can maintain but grow slowly
    growthRate *= tile.light;
}

// Soil processes need some light
if (tile.tileType === 'soil' && tile.light < 0.3) {
    // Reduce nutrient generation in deep shade
    tile.nutrients *= 0.99;
}
```

### 6. Natural Recharge

Resources slowly regenerate:

```javascript
// Rain and decomposition
if (Math.random() < 0.01) {
    tile.water = Math.min(1, tile.water + 0.05);
}

// Leaf litter from mature trees
if (tile.tileType === 'soil' && tile.y === GROUND_LEVEL) {
    const aboveIndex = (tile.y - 1) * WORLD_WIDTH + tile.x;
    if (tile.y > 0 && tiles[aboveIndex].tileType === 'leaf') {
        tile.nutrients = Math.min(1, tile.nutrients + 0.001);
    }
}
```

## Emergent Behaviors

1. **Natural Spacing** - Trees deplete local resources, creating dead zones where new seeds can't thrive
2. **Pioneer Succession** - First trees thrive, later ones struggle unless gaps appear
3. **Forest Gaps** - When trees die, resources recover, allowing new growth
4. **Edge Effects** - Trees on edges of groups grow better (more resources)
5. **Stunted Growth** - Trees too close together remain small

## Advantages

- No distance calculations beyond immediate neighbors
- Realistic resource-based competition
- Emergent spacing patterns
- Natural forest succession
- Computationally efficient

## Implementation Notes

- All checks are local (immediate neighbors only)
- Resource flow creates gradients naturally
- Competition emerges from resource scarcity
- Seeds can plant anywhere but survival varies
- Creates realistic patchy forest patterns