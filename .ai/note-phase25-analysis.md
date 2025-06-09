# Phase 2.5 Side-View Analysis

## Key Areas to Change

### 1. World Size & Grid Structure
- **Current**: `WORLD_SIZE = 32` (32x32 grid)
- **Target**: 64x32 (width x height)
- **Lines**: 5-6, all grid calculations

### 2. Coordinate System
- **Current**: Y-axis has no meaning for height (top-down view)
- **Target**: Y-axis represents vertical position (0=sky, 31=underground)
- **Ground level**: Y = 24-27 (variable terrain)

### 3. Tile System (lines 127-153)
- Add new tile properties:
  - `solid`: boolean for collision
  - `climbable`: boolean for agent climbing
  - `tileType`: 'air|soil|root|trunk|branch|leaf'
- Modify growth patterns for vertical growth

### 4. Agent Movement (lines 213-274)
- **Current**: Gravity just pulls down, agents bounce
- **Target**: Platformer physics with:
  - Jump mechanics
  - Climbing on trunks/branches
  - Collision with solid tiles
  - No passing through solid objects

### 5. Rendering (lines 555-669)
- Complete overhaul needed:
  - Draw sky gradient background
  - Layer-based rendering (back to front)
  - Different sprites for tile types
  - Side-view agent sprites

### 6. Growth Mechanics (lines 318-408)
- **Current**: Spreads in all directions equally
- **Target**:
  - Seeds grow UP (shoots) and DOWN (roots)
  - Trunks grow vertically
  - Branches grow horizontally at certain heights
  - Canopy spreads at top

### 7. Resource Flow (lines 439-474)
- Water should flow DOWN through soil
- Light blocked by canopy ABOVE
- Nutrients concentrate in soil layers

### 8. Camera System (new)
- Add viewport tracking
- Follow primary agent
- Scrolling boundaries

## Implementation Order
1. Grid restructuring (64x32)
2. Tile type system
3. Basic side-view rendering
4. Agent platformer physics
5. Vertical growth patterns
6. Resource flow adjustments
7. Camera system
8. Polish & optimization