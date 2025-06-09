# Phase 1.3: SOUP Simplified Prototype

## 🧪 QUICK & DIRTY EMERGENCE

**Goal**: See forest emergence in 512x512 grid with minimal code complexity.

## 📁 Ultra-Simple Structure

```
soup/
├── index.html              # Everything in one file
└── soup.js                 # All logic in one file
```

That's it. Two files total.

## 🎯 Minimum Viable Demo

**512x512 colored squares + random agents = emergent patterns**

### What We're Building
1. **Grid**: 512x512 tiles (262k colored rectangles)
2. **Agents**: 10-20 dots moving randomly
3. **Influence**: Agents change tile colors based on proximity
4. **Growth**: Tiles spread their influence to neighbors
5. **Emergence**: Patterns appear over time

## 🔧 Dead Simple Implementation

### Tile Object (Minimal)
```javascript
const tile = {
  x: 0,
  y: 0,
  mood: 0,        // -1 to 1 (red to green)
  visits: 0,      // how many times agents passed near
  type: 0         // 0=soil, 1=growing, 2=mature
};
```

### Agent Object (Minimal)
```javascript
const agent = {
  x: 256,
  y: 256,
  emotion: 1,     // 1=joy, -1=sorrow
  vx: 0,
  vy: 0
};
```

### Core Loop (Brute Force)
```javascript
function update() {
  // Move agents randomly
  agents.forEach(moveAgent);
  
  // Check every tile for agent influence (brute force)
  for (let i = 0; i < tiles.length; i++) {
    checkAgentInfluence(tiles[i]);
  }
  
  // Grow tiles based on neighbors (brute force)
  for (let i = 0; i < tiles.length; i++) {
    growTile(tiles[i]);
  }
  
  // Render everything (brute force)
  renderGrid();
  renderAgents();
}
```

## 🎨 Brain-Dead Simple Rendering

### Canvas Strategy
- **Canvas 2D** with `fillRect()` for each tile
- **No optimization** - just draw 262k rectangles
- **Simple colors**: 
  - Red = negative mood
  - Gray = neutral
  - Green = positive mood
  - Brightness = growth stage

### No Performance Tricks
- No viewport culling
- No ImageData manipulation  
- No level-of-detail
- Just raw canvas drawing

If it's slow, we'll deal with it later.

## 📊 5-Day Implementation

| Day | Goal | Code |
|-----|------|------|
| 1 | **Grid renders** | 512x512 colored squares |
| 2 | **Agents move** | Random walk dots |
| 3 | **Influence works** | Agents change nearby tile colors |
| 4 | **Growth spreads** | Tiles affect neighbors |
| 5 | **Document patterns** | Screenshot emergent behaviors |

## 🔥 Complexity Eliminated

### What We're NOT Building
- ❌ File organization (everything in 2 files)
- ❌ Spatial indexing (brute force distance checks)
- ❌ Memory systems (just visit counters)
- ❌ Priority queues (linear iteration)
- ❌ Bridge algorithms (too complex for v1)
- ❌ Chunk processing (just run everything each frame)
- ❌ Debug overlays (console.log is enough)
- ❌ Parameter tweaking UI (just edit constants in code)

### What We ARE Building
- ✅ Grid of tiles that change color
- ✅ Agents that move and influence tiles
- ✅ Growth that spreads between neighbors
- ✅ Visual emergence over time

## 🧬 Core Algorithms (Simplified)

### Agent Influence
```javascript
function checkAgentInfluence(tile) {
  agents.forEach(agent => {
    const distance = Math.abs(tile.x - agent.x) + Math.abs(tile.y - agent.y);
    if (distance < 5) {  // Manhattan distance
      tile.mood += agent.emotion * 0.1;
      tile.visits++;
    }
  });
}
```

### Tile Growth
```javascript
function growTile(tile) {
  if (tile.mood > 0.5 && tile.visits > 3) {
    tile.type = Math.min(tile.type + 0.01, 2);
    
    // Spread to neighbors
    neighbors.forEach(neighbor => {
      neighbor.mood += 0.05;
    });
  }
}
```

### Rendering
```javascript
function renderGrid() {
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const color = moodToColor(tile.mood, tile.type);
    ctx.fillStyle = color;
    ctx.fillRect(tile.x, tile.y, 1, 1);
  }
}
```

## 🎮 Interaction (Optional)

- **Mouse click**: Spawn agent at cursor
- **Spacebar**: Pause/unpause
- **R key**: Reset world

## 📈 Success = Visual Patterns

We know it's working when we see:
1. **Colored patches** around agent paths
2. **Growth spreading** outward from high-activity areas  
3. **Persistent patterns** that remain after agents move away
4. **Organic shapes** that look forest-like

## 🚀 Performance Expectations

### Reality Check
- **262k tiles × 60fps = 15.7M operations/second**
- Modern browsers can handle this with simple operations
- If it's too slow, we'll add ONE optimization at a time
- Prototype first, optimize never (until Machi rewrite)

### Acceptable Performance
- **10-30fps**: Totally fine for prototype
- **Visible patterns**: More important than smooth animation
- **Quick iteration**: More important than optimal code

## 📝 Documentation Strategy

### Daily Screenshots
Take screenshots every hour showing:
- Agent movement patterns
- Color evolution
- Emergent structures
- Unexpected behaviors

### Parameter Log
Document what values create interesting emergence:
- Agent count (10-50?)
- Influence radius (3-10 tiles?)
- Growth thresholds (mood > 0.5?)
- Spread rates (0.01-0.1 per frame?)

## 🎯 Migration to Machi

Once we see emergence, document:
1. **Core algorithm** that creates the patterns
2. **Key parameters** that control emergence
3. **Visual indicators** that show forest "aliveness"
4. **Performance bottlenecks** we encountered

Then throw this code away and implement properly in Machi's Rust/WASM architecture.

---

## Next Actions

1. **Create index.html** with canvas element
2. **Create soup.js** with tile array and agent array
3. **Implement random agent movement**
4. **Add agent-tile influence**
5. **Add tile-tile growth spreading**
6. **Watch for emergent patterns**

Remember: We're building a throwaway demo to prove emergence is possible, not a production system.