# Phase 3.0: Individual Tree Identity & Spacing System

## Problems

1. Trees merge together when growing near each other
2. Trees grow too close together, creating unrealistic dense clusters
3. No competition for space between trees

## Solutions

### 1. Tree Identity System (Partially Implemented)

Add unique IDs to track individual trees:
```javascript
// Tile properties
treeId: null,     // Unique identifier for each tree
trunkX: null,     // X position of main trunk
```

### 2. Minimum Tree Spacing

Prevent seeds from planting too close to existing trees:

```javascript
// Before planting a seed, check nearby area
function canPlantSeed(x, y, minDistance = 3) {
    // Check circular area around planting spot
    for (let dy = -minDistance; dy <= minDistance; dy++) {
        for (let dx = -minDistance; dx <= minDistance; dx++) {
            const checkX = x + dx;
            const checkY = y + dy;
            
            if (checkX >= 0 && checkX < WORLD_WIDTH && checkY >= 0 && checkY < WORLD_HEIGHT) {
                const checkIndex = checkY * WORLD_WIDTH + checkX;
                const checkTile = tiles[checkIndex];
                
                // Found existing tree trunk nearby
                if (checkTile.tileType === 'trunk' || 
                    (checkTile.treeId && checkTile.growth > 0.3)) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < minDistance) {
                        return false; // Too close to existing tree
                    }
                }
            }
        }
    }
    return true;
}
```

### 3. Growth Competition

Trees compete for resources based on proximity:

```javascript
// Calculate competition factor for a tile
function getCompetitionFactor(tile) {
    let competition = 0;
    const checkRadius = 5;
    
    for (let dy = -checkRadius; dy <= checkRadius; dy++) {
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = tile.x + dx;
            const ny = tile.y + dy;
            
            if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
                const neighborIndex = ny * WORLD_WIDTH + nx;
                const neighbor = tiles[neighborIndex];
                
                // Other trees compete for resources
                if (neighbor.treeId && neighbor.treeId !== tile.treeId) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    competition += neighbor.growth / (distance + 1);
                }
            }
        }
    }
    
    return Math.max(0, 1 - competition * 0.2); // Reduce growth by up to 80%
}
```

### 4. Canopy Interference

Prevent branches/leaves from growing into other trees:

```javascript
// Before growing branches or leaves
if (targetTile.treeId && targetTile.treeId !== tile.treeId) {
    // Don't grow into another tree's canopy
    continue;
}
```

### 5. Variable Spacing by Species

Different tree types require different spacing:

```javascript
const treeTypes = {
    oak: {
        minSpacing: 4,
        canopyRadius: 3,
        competitiveness: 0.8
    },
    pine: {
        minSpacing: 2,
        canopyRadius: 1,
        competitiveness: 0.6
    },
    willow: {
        minSpacing: 5,
        canopyRadius: 4,
        competitiveness: 0.9
    }
};
```

### 6. Seedling Mortality

Young trees die if too shaded by mature trees:

```javascript
// In growth update
if (tile.growth < 0.5 && tile.light < 0.3) {
    // Seedling dies from lack of light
    tile.growth -= 0.01;
    if (tile.growth <= 0) {
        // Reset tile
        tile.tileType = 'soil';
        tile.treeId = null;
        console.log('Seedling died from shade');
    }
}
```

## Implementation Priority

1. **Seed Spacing Check** - Prevent planting near existing trees
2. **Growth Competition** - Slow growth based on nearby trees
3. **Canopy Boundaries** - Prevent branch/leaf merging
4. **Seedling Mortality** - Kill shaded young trees
5. **Species Variation** - Different spacing requirements

## Expected Results

- Natural forest spacing with gaps between trees
- Emergent forest succession (pioneer species → climax forest)
- Competition creates varied tree sizes
- More realistic forest appearance
- Clear individual tree crowns