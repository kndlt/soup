# Phase 1.2: SOUP Prototype Bootstrap Plan

## 🚀 JavaScript Rapid Prototyping Strategy

### Core Principle
**Ship the smallest possible demo that shows emergent forest behavior.** No frameworks, no build systems, no complexity—just HTML + JavaScript + Canvas.

## 📁 Minimal Repository Structure

```
soup/
├── docs/                    # Documentation (current)
├── index.html              # Single-page prototype
├── src/
│   ├── core/
│   │   ├── tile.js         # SoupTile class with biological properties
│   │   ├── world.js        # Grid management and tick loop
│   │   └── agent.js        # Simple agent (Promiser-like) behavior
│   ├── systems/
│   │   ├── growth.js       # Growth simulation algorithms
│   │   ├── memory.js       # Event tagging and decay system
│   │   └── emotion.js      # Emotional influence calculations
│   ├── rendering/
│   │   ├── canvas.js       # Canvas rendering with tile colors/animations
│   │   └── debug.js        # Debug overlays for memory, mood, growth
│   └── main.js             # Application entry point
└── README.md               # Quick start instructions
```

## 🎯 Minimum Viable Forest (MVF)

### Target Demo
**512x512 tile grid (262,144 tiles) with 10-50 agents showing emergent forest patterns over 5 minutes**

Scale is critical for emergence—we need room for patterns to develop and spread organically.

### Core Components

#### 1. SoupTile (tile.js)
```javascript
class SoupTile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = "soil";           // soil → root → trunk → canopy
    this.fertility = 0.5;         // 0-1
    this.moisture = 0.5;          // 0-1  
    this.mood = 0;                // -1 to 1
    this.growthStage = 0;         // 0-5
    this.memory = new Map();      // "event" → {strength, decay}
    this.lastUpdate = 0;
  }
}
```

#### 2. Simple Agent (agent.js)
```javascript
class SimpleAgent {
  constructor(x, y, emotion = "neutral") {
    this.x = x;
    this.y = y;
    this.emotion = emotion;       // "joy", "sorrow", "neutral"
    this.trail = [];              // movement history for bridge logic
  }
}
```

#### 3. Growth System (growth.js)
Implements Pixel's algorithms:
- **Sparse simulation**: Only update "active" tiles
- **Growth rate formula**: `rate = baseRate * (1 - growthStage / maxStage)`
- **Neighbor influence**: Adjacent tiles affect growth potential

#### 4. Memory System (memory.js)
- **Event tagging**: "agent_joy", "agent_sorrow", "repeated_visit"
- **Decay with reinforcement**: Memories fade unless reinforced
- **Bridge emergence**: Track traversal patterns for vine growth

## 🎨 Visual Design

### Rendering Strategy
- **Canvas 2D** for simplicity (no WebGL complexity)
- **Tile colors** represent biological state:
  - Hue = mood (-1 red → 0 gray → 1 green)
  - Saturation = fertility (0 dull → 1 vibrant)
  - Brightness = growth stage (0 dark → 5 bright)
- **Agent rendering** as simple colored circles
- **Debug overlay** showing memory events as text

### Visual Progression Demo
1. **T=0min**: Gray barren 512x512 world, 10-20 agents spawn randomly
2. **T=1min**: Emotional influence creates colored patches around agent paths
3. **T=2min**: Growth begins - patches start connecting and spreading
4. **T=3min**: Distinct biome regions emerge (root networks, canopy areas)
5. **T=5min**: Bridge pathways connect distant regions, clear forest structure visible

## 🔧 Technical Implementation

### No-Framework Approach
- **Vanilla JavaScript** only (ES6+ features OK)
- **Single HTML file** that loads everything
- **requestAnimationFrame** for rendering loop
- **setInterval** for growth tick (slower than render)

### Development Workflow
1. **Live reload**: Simple HTTP server (`python -m http.server`)
2. **Browser dev tools**: Console for debugging tile states
3. **Parameter tweaking**: Global variables for easy experimentation
4. **Visual debugging**: Click tiles to see memory/mood in console

### Performance Targets
- **60fps rendering** on 5x5 grid (trivial)
- **1-10fps growth ticks** (adjustable for demo speed)
- **Instant parameter changes** (no build step)

## 📊 Success Metrics

### Emergence Indicators
1. **Visible patterns** emerge from agent movement
2. **Growth spreads** organically based on emotional influence
3. **Memory effects** are observable (repeated visits → stronger growth)
4. **Bridge formation** occurs between frequently connected tiles

### Demo Checkpoints
- [ ] **Day 1**: Static tile grid with color-coded mood/fertility
- [ ] **Day 2**: Agent movement affects nearby tile mood
- [ ] **Day 3**: Growth algorithm creates visible tile type changes
- [ ] **Day 4**: Memory system creates lasting patterns
- [ ] **Day 5**: Bridge emergence connects distant tiles

## 🧪 Experimentation Framework

### Parameter Exposure
Global variables for live tuning:
```javascript
window.SOUP_CONFIG = {
  growthRate: 0.1,
  emotionInfluence: 0.3,
  memoryDecayRate: 0.95,
  bridgeThreshold: 5,
  tickInterval: 100,  // ms
};
```

### Debug Tools
- **Click tile**: Log full tile state to console
- **Spacebar**: Pause/resume simulation
- **Number keys**: Change agent emotions
- **Arrow keys**: Move agents manually

## 🎯 Implementation Priority

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 | Core structure | Tile grid + agent movement |
| 2 | Emotional influence | Mood changes from agent proximity |
| 3 | Growth mechanics | Visible tile type evolution |
| 4 | Memory system | Persistent pattern formation |
| 5 | Bridge emergence | Connection growth between tiles |

## 📝 Documentation Strategy

### Code Documentation
- **Inline comments** explaining biological concepts
- **Parameter documentation** for all tunable values
- **Algorithm notes** linking to Pixel's technical solutions

### Experiment Log
- **Daily progress** screenshots showing emergence
- **Parameter discoveries** (what values create best emergence)
- **Failure documentation** (what doesn't work and why)

## 🔄 Migration Path to Machi

### Data Structure Mapping
- `SoupTile` → Rust struct with identical properties
- Growth algorithms → Direct Rust translation
- Memory system → Event-driven architecture in WASM

### Performance Learnings
- Which calculations can be batched/cached
- Optimal tick intervals for perceived emergence
- Memory management patterns that work

### Visual Integration
- Color mapping strategies
- Animation timing that feels organic
- Debug visualization patterns

---

## Next Action Items

1. **Set up basic HTML + Canvas structure**
2. **Implement SoupTile class with visual debugging**
3. **Add simple agent that affects tile mood**
4. **Create growth tick loop with visible changes**
5. **Document emergence patterns as they appear**

The goal is rapid iteration toward visible emergence, not perfect code architecture. Once we see the forest come alive, we replicate the learnings in Machi's production environment.