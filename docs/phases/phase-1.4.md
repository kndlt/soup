# SOUP Prototype - Detailed Implementation Plan

## 🎯 Implementation Strategy

### Phase 1: Foundation (Day 1)
**Goal**: 512x512 grid rendering with basic structure

#### Step 1.1: HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
    <title>SOUP Prototype</title>
    <style>
        body { margin: 0; background: #000; overflow: hidden; }
        canvas { border: 1px solid #333; }
        #info { position: absolute; top: 10px; left: 10px; color: white; font-family: monospace; }
    </style>
</head>
<body>
    <canvas id="canvas" width="512" height="512"></canvas>
    <div id="info">SOUP Prototype - Initializing...</div>
    <script src="soup.js"></script>
</body>
</html>
```

#### Step 1.2: Basic JavaScript Structure
```javascript
// Global state
const WORLD_SIZE = 512;
const TILE_COUNT = WORLD_SIZE * WORLD_SIZE;
let tiles = [];
let agents = [];
let ctx;
let lastTime = 0;

// Initialize
function init() {
    const canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Create tile grid
    createTiles();
    
    // Start render loop
    requestAnimationFrame(gameLoop);
}

function createTiles() {
    tiles = [];
    for (let y = 0; y < WORLD_SIZE; y++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            tiles.push({
                x: x,
                y: y,
                mood: 0,        // -1 to 1
                visits: 0,      // agent visit count
                type: 0,        // 0=soil, 1=growing, 2=mature
                lastUpdate: 0   // for growth timing
            });
        }
    }
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

init();
```

#### Step 1.3: Basic Rendering
```javascript
function render() {
    // Clear canvas
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);
    
    // Render tiles
    renderTiles();
    
    // Update info
    updateInfo();
}

function renderTiles() {
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const color = getTileColor(tile);
        
        ctx.fillStyle = color;
        ctx.fillRect(tile.x, tile.y, 1, 1);
    }
}

function getTileColor(tile) {
    // Map mood to color: red (-1) -> gray (0) -> green (1)
    if (tile.mood < 0) {
        const intensity = Math.abs(tile.mood) * 255;
        return `rgb(${intensity}, 0, 0)`;
    } else if (tile.mood > 0) {
        const intensity = tile.mood * 255;
        return `rgb(0, ${intensity}, 0)`;
    } else {
        return '#444';  // neutral gray
    }
}

function updateInfo() {
    const info = document.getElementById('info');
    info.textContent = `Tiles: ${TILE_COUNT}, FPS: ${Math.round(1000 / (performance.now() - lastTime))}`;
}
```

### Phase 2: Agent Movement (Day 2)
**Goal**: Agents moving randomly across the grid

#### Step 2.1: Agent Creation
```javascript
function createAgents() {
    agents = [];
    const agentCount = 20;
    
    for (let i = 0; i < agentCount; i++) {
        agents.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            vx: (Math.random() - 0.5) * 2,  // velocity -1 to 1
            vy: (Math.random() - 0.5) * 2,
            emotion: Math.random() > 0.5 ? 1 : -1,  // joy or sorrow
            id: i
        });
    }
}

function updateAgents(deltaTime) {
    const speed = 0.5;  // pixels per millisecond
    
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Random walk with momentum
        agent.vx += (Math.random() - 0.5) * 0.1;
        agent.vy += (Math.random() - 0.5) * 0.1;
        
        // Clamp velocity
        const maxSpeed = 1;
        agent.vx = Math.max(-maxSpeed, Math.min(maxSpeed, agent.vx));
        agent.vy = Math.max(-maxSpeed, Math.min(maxSpeed, agent.vy));
        
        // Move
        agent.x += agent.vx * speed * deltaTime;
        agent.y += agent.vy * speed * deltaTime;
        
        // Bounce off walls
        if (agent.x < 0 || agent.x >= WORLD_SIZE) {
            agent.vx *= -1;
            agent.x = Math.max(0, Math.min(WORLD_SIZE - 1, agent.x));
        }
        if (agent.y < 0 || agent.y >= WORLD_SIZE) {
            agent.vy *= -1;
            agent.y = Math.max(0, Math.min(WORLD_SIZE - 1, agent.y));
        }
    }
}

function renderAgents() {
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        ctx.fillStyle = agent.emotion > 0 ? '#ffff00' : '#ff00ff';  // yellow joy, magenta sorrow
        ctx.fillRect(Math.floor(agent.x) - 1, Math.floor(agent.y) - 1, 3, 3);
    }
}
```

#### Step 2.2: Update Game Loop
```javascript
function update(deltaTime) {
    updateAgents(deltaTime);
}

function render() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);
    
    renderTiles();
    renderAgents();
    updateInfo();
}
```

### Phase 3: Agent Influence (Day 3)
**Goal**: Agents affect nearby tiles

#### Step 3.1: Influence System
```javascript
function updateTileInfluence() {
    // Reset tile influence for this frame
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].currentInfluence = 0;
    }
    
    // Calculate agent influence on tiles
    for (let a = 0; a < agents.length; a++) {
        const agent = agents[a];
        const agentX = Math.floor(agent.x);
        const agentY = Math.floor(agent.y);
        const influenceRadius = 5;
        
        // Check tiles in radius (brute force)
        for (let y = agentY - influenceRadius; y <= agentY + influenceRadius; y++) {
            for (let x = agentX - influenceRadius; x <= agentX + influenceRadius; x++) {
                if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
                    const tileIndex = y * WORLD_SIZE + x;
                    const tile = tiles[tileIndex];
                    
                    // Manhattan distance
                    const distance = Math.abs(x - agentX) + Math.abs(y - agentY);
                    
                    if (distance <= influenceRadius) {
                        const influence = agent.emotion * (1 - distance / influenceRadius);
                        tile.currentInfluence += influence;
                        tile.visits++;
                    }
                }
            }
        }
    }
    
    // Apply influence to tile mood
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        tile.mood += tile.currentInfluence * 0.01;  // slow accumulation
        tile.mood = Math.max(-1, Math.min(1, tile.mood));  // clamp to [-1, 1]
    }
}
```

#### Step 3.2: Update Game Loop
```javascript
function update(deltaTime) {
    updateAgents(deltaTime);
    updateTileInfluence();
}
```

### Phase 4: Tile Growth (Day 4)
**Goal**: Tiles spread influence to neighbors and evolve types

#### Step 4.1: Growth System
```javascript
function updateTileGrowth(currentTime) {
    const growthInterval = 100;  // milliseconds between growth updates
    
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        
        // Only update if enough time has passed
        if (currentTime - tile.lastUpdate > growthInterval) {
            tile.lastUpdate = currentTime;
            
            // Growth conditions
            if (tile.mood > 0.3 && tile.visits > 2) {
                // Increase type (soil -> growing -> mature)
                tile.type = Math.min(tile.type + 0.01, 2);
                
                // Spread influence to neighbors
                spreadToNeighbors(tile);
            }
            
            // Decay over time if no recent influence
            if (tile.currentInfluence === 0) {
                tile.mood *= 0.999;  // very slow decay
                tile.type *= 0.9999;  // even slower type decay
            }
        }
    }
}

function spreadToNeighbors(sourceTile) {
    const spreadRadius = 1;
    const spreadAmount = 0.02;
    
    for (let dy = -spreadRadius; dy <= spreadRadius; dy++) {
        for (let dx = -spreadRadius; dx <= spreadRadius; dx++) {
            const nx = sourceTile.x + dx;
            const ny = sourceTile.y + dy;
            
            if (nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
                const neighborIndex = ny * WORLD_SIZE + nx;
                const neighbor = tiles[neighborIndex];
                
                // Spread positive mood
                if (sourceTile.mood > 0) {
                    neighbor.mood += spreadAmount * sourceTile.mood;
                    neighbor.mood = Math.min(1, neighbor.mood);
                }
            }
        }
    }
}
```

#### Step 4.2: Enhanced Rendering
```javascript
function getTileColor(tile) {
    const baseIntensity = Math.abs(tile.mood) * 128;
    const typeBonus = tile.type * 64;  // brighter for more mature tiles
    const totalIntensity = Math.min(255, baseIntensity + typeBonus);
    
    if (tile.mood < 0) {
        return `rgb(${totalIntensity}, 0, 0)`;  // red for negative
    } else if (tile.mood > 0) {
        return `rgb(0, ${totalIntensity}, 0)`;  // green for positive
    } else {
        const gray = 32 + tile.type * 16;  // slightly brighter gray for higher types
        return `rgb(${gray}, ${gray}, ${gray})`;
    }
}
```

#### Step 4.3: Update Game Loop
```javascript
function update(deltaTime) {
    updateAgents(deltaTime);
    updateTileInfluence();
    updateTileGrowth(performance.now());
}
```

### Phase 5: Optimization & Polish (Day 5)
**Goal**: Make it run smoothly and document emergence

#### Step 5.1: Performance Monitoring
```javascript
let frameCount = 0;
let lastFpsUpdate = 0;
let currentFps = 0;

function updateInfo() {
    frameCount++;
    const now = performance.now();
    
    if (now - lastFpsUpdate > 1000) {
        currentFps = Math.round(frameCount * 1000 / (now - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = now;
    }
    
    const avgMood = tiles.reduce((sum, tile) => sum + tile.mood, 0) / tiles.length;
    const activeAgents = agents.length;
    const matureTiles = tiles.filter(tile => tile.type > 1).length;
    
    const info = document.getElementById('info');
    info.textContent = `FPS: ${currentFps} | Agents: ${activeAgents} | Avg Mood: ${avgMood.toFixed(3)} | Mature: ${matureTiles}`;
}
```

#### Step 5.2: Interactive Controls
```javascript
function setupControls() {
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':  // spacebar
                togglePause();
                break;
            case 'r':  // reset
                resetWorld();
                break;
            case 'a':  // add agent
                addRandomAgent();
                break;
        }
    });
    
    document.getElementById('canvas').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addAgentAt(x, y);
    });
}

let paused = false;

function togglePause() {
    paused = !paused;
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    if (!paused) {
        update(deltaTime);
    }
    
    render();
    requestAnimationFrame(gameLoop);
}
```

## 🎯 Implementation Checklist

### Day 1: Foundation
- [ ] HTML structure with canvas
- [ ] Basic tile grid creation (262k tiles)
- [ ] Rendering loop with colored tiles
- [ ] FPS counter
- [ ] Performance baseline

### Day 2: Movement
- [ ] Agent creation system
- [ ] Random walk movement
- [ ] Boundary collision
- [ ] Agent rendering (different colors for emotions)

### Day 3: Influence
- [ ] Agent proximity detection (brute force)
- [ ] Mood influence system
- [ ] Visit counting
- [ ] Visual feedback (tiles changing color)

### Day 4: Growth
- [ ] Neighbor spreading algorithm
- [ ] Tile type evolution (soil -> growing -> mature)
- [ ] Growth timing system
- [ ] Enhanced visual representation

### Day 5: Polish
- [ ] Performance monitoring
- [ ] Interactive controls (pause, reset, add agents)
- [ ] Documentation of emergent patterns
- [ ] Parameter tuning for best emergence

## 🔍 Debugging Strategy

### Console Logging
```javascript
function debugTile(x, y) {
    const tileIndex = y * WORLD_SIZE + x;
    const tile = tiles[tileIndex];
    console.log(`Tile (${x},${y}):`, {
        mood: tile.mood,
        visits: tile.visits,
        type: tile.type,
        influence: tile.currentInfluence
    });
}

// Click to debug
canvas.addEventListener('click', (e) => {
    const x = Math.floor(e.offsetX);
    const y = Math.floor(e.offsetY);
    debugTile(x, y);
});
```

### Visual Debugging
```javascript
function renderDebugInfo() {
    // Show agent influence radius
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        ctx.strokeStyle = agent.emotion > 0 ? '#ffff0033' : '#ff00ff33';
        ctx.strokeRect(agent.x - 5, agent.y - 5, 10, 10);
    }
}
```

## 📊 Success Metrics

### Performance Targets
- **30+ FPS** on modern browser
- **Visible patterns** within 60 seconds
- **Stable simulation** running for 10+ minutes

### Emergence Indicators
- **Color clustering** around agent paths
- **Pattern persistence** after agents move away
- **Organic growth** spreading outward
- **Differentiated regions** (mature vs growing areas)

## 🚀 Ready to Implement

This plan provides step-by-step implementation with:
- ✅ Exact code structure
- ✅ Progressive complexity
- ✅ Performance considerations
- ✅ Debug tools
- ✅ Success criteria

Each day builds on the previous, ensuring we always have a working demo while adding new emergence behaviors.

Ready to start coding!