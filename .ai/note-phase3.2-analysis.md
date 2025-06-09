# Phase 3.2 Implementation Analysis

## Current Code Analysis

### 1. Resource Consumption During Growth
**Current Implementation (Lines 700-703):**
```javascript
// Consume resources
tile.water -= 0.005;
tile.nutrients -= 0.003;
```

**Issues:**
- Fixed consumption rates for all tile types
- No variation based on growth stage or tile type
- No consumption of light (photosynthesis not modeled)

**Changes Needed:**
- Add type-specific consumption rates
- Scale consumption with growth stage
- Add light consumption for photosynthesis

### 2. Resource Diffusion Function
**Current Implementation (Lines 792-827):**
```javascript
function updateResourceDiffusion() {
    // Only handles water diffusion
    // No nutrient diffusion
    // No root-based water uptake
}
```

**Issues:**
- Only diffuses water, not nutrients
- No special handling for roots
- No upward transport through trunk/branches

**Changes Needed:**
- Add nutrient diffusion
- Implement root water/nutrient uptake
- Add vascular transport system

### 3. Growth Conditions
**Current Implementation (Lines 454-460):**
```javascript
const hasWater = tile.water > 0.2;
const hasNutrients = tile.nutrients > 0.1;
const hasLight = tile.light > 0.1;
const hasMood = tile.mood > 0.05;

if (hasWater && hasNutrients && hasLight && hasMood && tile.visits > 0) {
    // Growth logic
}
```

**Issues:**
- Same thresholds for all tile types
- Binary conditions (has/doesn't have)
- No consideration of resource balance

**Changes Needed:**
- Type-specific resource requirements
- Gradient-based growth rates
- Resource balance considerations

### 4. Light Calculation
**Current Implementation (Lines 763-790):**
```javascript
function updateTileLight(tile, tileIndex) {
    // Simple shadow casting from above
    // Fixed shade factor
    // No consideration of canopy density
}
```

**Issues:**
- Simple binary shading
- No light competition between trees
- No seasonal/time variation

**Changes Needed:**
- Canopy density-based shading
- Light competition mechanics
- More sophisticated shadow casting

## Implementation Plan

### Phase 3.2a: Resource Consumption System
1. **Define consumption rates by type** (After line 9)
2. **Implement variable consumption** (Replace lines 700-703)
3. **Add photosynthesis mechanics**

### Phase 3.2b: Enhanced Resource Diffusion
1. **Add nutrient diffusion** (Extend updateResourceDiffusion)
2. **Implement root uptake** (New function)
3. **Add vascular transport** (New function)

### Phase 3.2c: Dynamic Growth Conditions
1. **Type-specific thresholds** (Replace lines 454-460)
2. **Gradient-based growth** (Modify line 462)
3. **Resource balance checks**

### Phase 3.2d: Advanced Light System
1. **Canopy density calculation** (New function)
2. **Light competition** (Enhance updateTileLight)
3. **Seasonal variations** (Optional)

## Key Variables to Add

```javascript
// Resource consumption rates by type
const RESOURCE_CONSUMPTION = {
    'soil': { water: 0, nutrients: 0, light: 0 },
    'root': { water: 0.002, nutrients: 0.001, light: 0 },
    'trunk': { water: 0.003, nutrients: 0.002, light: 0.001 },
    'branch': { water: 0.004, nutrients: 0.002, light: 0.002 },
    'leaf': { water: 0.006, nutrients: 0.003, light: 0.005 }
};

// Growth requirements by type
const GROWTH_REQUIREMENTS = {
    'root': { water: 0.1, nutrients: 0.05, light: 0 },
    'trunk': { water: 0.2, nutrients: 0.1, light: 0.1 },
    'branch': { water: 0.25, nutrients: 0.15, light: 0.3 },
    'leaf': { water: 0.3, nutrients: 0.2, light: 0.5 }
};
```

## Potential Conflicts

1. **Performance Impact**: More complex calculations in hot loops
2. **Balance Issues**: Need careful tuning of consumption/production rates
3. **Existing Growth Logic**: Lines 471-698 may need refactoring
4. **Tree Identity System**: Need to ensure resources flow within same tree

## Next Steps

1. Start with resource consumption rates (simplest change)
2. Test and balance consumption before moving to diffusion
3. Implement diffusion incrementally (water first, then nutrients)
4. Finally tackle the light system (most complex)