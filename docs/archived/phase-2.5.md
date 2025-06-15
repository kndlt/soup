# Phase 2.5: Side-View Transformation

## Overview

Transform SOUP from a top-down grid view to a side-scrolling 2D tilemap perspective, creating a more traditional platformer-style forest visualization where gravity, terrain, and vertical growth become primary gameplay elements.

## Current State Analysis

### Top-Down Limitations
- No visual representation of height/depth
- Tree growth appears as color intensity rather than vertical structures
- Agent movement lacks platforming dynamics
- Gravity feels artificial in top-down view

### Opportunities
- Natural tree growth visualization (roots down, canopy up)
- Terrain features (hills, valleys, cliffs)
- More intuitive gravity and physics
- Layered forest depths (foreground/background)

## Core Changes

### 1. Coordinate System Transformation
```javascript
// Current: x,y represents position on ground plane
// New: x = horizontal position, y = vertical height
// Bottom row (y = WORLD_HEIGHT - 1) = ground level
```

### 2. Tile Types Expansion
- **Soil/Ground**: Base terrain tiles at bottom
- **Roots**: Underground growth system
- **Trunk**: Vertical tree segments
- **Branches**: Horizontal growth from trunks
- **Canopy**: Leafy top sections
- **Air**: Empty space tiles

### 3. Agent Physics Overhaul
- True platformer physics
- Jump mechanics with proper arcs
- Climbing on tree trunks/branches
- Fall damage or energy loss
- Wall-sliding on tree trunks

## Implementation Plan

### Phase 2.5.1: Grid Restructuring
1. Change grid from 32x32 to 64x32 (width x height)
2. Define ground level at y = 24-31 (variable terrain)
3. Reserve y = 0-7 for deep canopy
4. Implement terrain generation algorithm

### Phase 2.5.2: Tile System Redesign
```javascript
tile = {
    type: 'air|soil|root|trunk|branch|leaf',
    solid: boolean,      // Can agents stand on it?
    climbable: boolean,  // Can agents climb it?
    growthPotential: {   // What can grow from this tile?
        up: boolean,
        down: boolean,
        left: boolean,
        right: boolean
    }
}
```

### Phase 2.5.3: Growth Patterns
1. **Seeds**: Start at ground level
2. **Roots**: Grow downward into soil
3. **Shoots**: Grow upward from seeds
4. **Trunks**: Vertical growth with occasional branching
5. **Branches**: Horizontal growth at certain heights
6. **Canopy**: Leafy growth at tree tops

### Phase 2.5.4: Visual Representation
```
Sky/Canopy Layer (y=0-7):    . . @@@ . . @@@
                              . @@@@@@ . @@@@
Upper Growth (y=8-15):        . . ||| . . ||
                              . . |B|--- |B|
Mid Growth (y=16-23):         . . ||| . . ||
                              ---B||| . . ||
Ground Level (y=24-27):       ████|█████████
                              ████|█████████
Root Layer (y=28-31):         ████r█████████
                              ████r█████████

Legend: @ = leaves, | = trunk, B = branch point,
        - = branch, █ = soil, r = roots, . = air
```

### Phase 2.5.5: Agent Behaviors
- **Platforming**: Jump between branches, climb trunks
- **Seed Dispersal**: Drop seeds while on branches
- **Emotional Zones**: Create growth auras at their position
- **Pathfinding**: Navigate around solid tiles

## Technical Considerations

### Rendering Updates
```javascript
function renderSideView() {
    // Draw from back to front for depth
    // 1. Background sky gradient
    // 2. Far trees (dimmed)
    // 3. Main tile grid
    // 4. Agents
    // 5. Foreground elements
}
```

### Performance Optimizations
- Chunk-based rendering (only visible sections)
- Tile type lookup tables
- Cached growth patterns
- Spatial hashing for collision detection

### Camera System
- Follow primary agent
- Smooth scrolling
- Bounds checking
- Zoom levels for overview

## Migration Strategy

1. **Dual Mode**: Implement side-view alongside top-down
2. **Toggle Key**: 'V' to switch between views
3. **Data Preservation**: Same underlying data model
4. **Gradual Features**: Add side-view features incrementally

## Expected Outcomes

### Visual Impact
- Trees look like actual trees
- Natural forest layers visible
- Depth and perspective
- More engaging agent movement

### Gameplay Emergence
- Canopy highways (branch connections)
- Underground root networks
- Vertical ecosystems
- Natural clearings and groves

### Biological Accuracy
- Phototropism (growing toward light)
- Root competition for nutrients
- Canopy shade effects
- Natural forest stratification

## Success Metrics

1. **Performance**: Maintain 30+ FPS with larger grid
2. **Emergence**: Complex forest structures form naturally
3. **Playability**: Agents navigate environment intuitively
4. **Aesthetics**: Recognizable as forest ecosystem

## Next Steps

1. Create proof-of-concept with basic side-view
2. Test agent physics in new perspective
3. Implement basic tree growth patterns
4. Add terrain generation
5. Polish visual representation

## Notes

This transformation aligns with the project's emergence philosophy - side-view isn't just a visual change, but enables new emergent behaviors through vertical space utilization and more realistic physics interactions.