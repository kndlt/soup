# SOUP.js Analysis & Summary

## Overview
SOUP (Living Forest Prototype) is a 2D side-view emergence simulation where agents influence tile growth to create forest ecosystems. The prototype explores emotional-environmental interaction patterns.

## Architecture

### World Configuration
- **Grid**: 64x32 tiles (2048 total)
- **Canvas**: 512x512px (8px wide x 16px tall per tile)
- **Ground Level**: y=24 (soil below, air above)
- **Initial Agents**: 12

### Core Components

1. **Tiles** (Environmental Grid)
   - Types: air, soil, root, trunk, branch, leaf
   - Properties:
     - Physical: solid, climbable
     - Biological: water, nutrients, light
     - Emotional: mood (-1 to 1), visits, influence
     - Growth: 0-2+ (seed→growing→mature)

2. **Agents** (Emotional Entities)
   - Movement: platformer physics with gravity
   - Emotions: joy (+1) or sorrow (-1)
   - Behaviors: walk, jump, climb, seed planting
   - Influence radius: 3 tiles

3. **Game Loop**
   - Update agents (movement, physics)
   - Calculate tile influence from agents
   - Update tile growth based on resources
   - Resource diffusion (water/nutrients)
   - Fire risk mechanics
   - Render & UI updates

## Key Mechanics

### Growth System
1. **Seed Planting**: Joyful agents drop seeds on soil (5% chance)
2. **Resource Requirements**: water > 0.2, nutrients > 0.1, light > 0.1, mood > 0.05
3. **Growth Stages**:
   - Seeds sprout upward (trunk) and downward (roots)
   - Trunks grow vertically until reaching canopy height
   - Branches spawn randomly from mature trunks
   - Leaves form at tree tops and branch ends

### Influence System
- Agents spread emotional influence in 3-tile radius
- Influence strength = emotion × (1 - distance/radius) × 0.5
- Tiles accumulate mood from agent visits
- Mature plants spread influence to neighbors

### Resource Dynamics
- **Water**: Diffuses between tiles (10% flow rate), occasional "rain"
- **Nutrients**: Consumed by growth, enriched by leaf litter
- **Light**: Full above ground, reduced by canopy shade

### Emergence Patterns
1. **Emotional Forests**: Joyful agents create flourishing groves
2. **Decay Cycles**: Sorrowful agents trigger fire/clearing events
3. **Canopy Competition**: Taller trees shade out undergrowth
4. **Resource Networks**: Root systems share water/nutrients

## Controls
- Click: Spawn agent at position
- Space: Pause/unpause
- R: Reset world
- A: Add random agent
- D: Toggle debug mode
- S: Screenshot

## Notable Implementation Details
- Tile influence calculated per-frame, mood accumulates slowly
- Growth updates every 100ms for visible progression
- Fire risk increases with negative mood + mature vegetation
- Clearing events enrich soil for regrowth cycles
- Height-biased spreading creates realistic canopy shapes