// SOUP - Living Forest Prototype
// Quick & dirty emergence experiment

// Global configuration
const WORLD_SIZE = 32; // Scaled up from 8x8 to 32x32
const TILE_COUNT = WORLD_SIZE * WORLD_SIZE; // 1024 tiles
const INITIAL_AGENT_COUNT = 12; // More agents for larger world

// Global state
let tiles = [];
let agents = [];
let ctx;
let canvas;

// Timing and performance
let lastTime = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let currentFps = 0;
let paused = false;
let debugMode = false;

// Statistics
let stats = {
    avgMood: 0,
    matureTiles: 0,
    totalVisits: 0
};

// Logging
function log(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        const timestamp = new Date().toLocaleTimeString();
        debugInfo.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        debugInfo.scrollTop = debugInfo.scrollHeight;
    }
}

// Initialize the world
function init() {
    console.log('🚀 Initializing SOUP prototype...');
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    createTiles();
    createAgents();
    
    // Setup event listeners after canvas is available
    setupEventListeners();
    
    console.log(`✅ Created ${TILE_COUNT.toLocaleString()} tiles`);
    console.log(`✅ Created ${agents.length} agents`);
    console.log('🌱 Starting emergence simulation...');
    
    // Start the main loop
    requestAnimationFrame(gameLoop);
}

// Setup all event listeners
function setupEventListeners() {
    // Mouse interaction
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        
        // Add agent at click position
        const newAgent = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            emotion: Math.random() > 0.5 ? 1 : -1,
            id: agents.length,
            energy: 1.0,
            age: 0
        };
        
        agents.push(newAgent);
        console.log(`🎯 Spawned agent ${newAgent.id} at (${x}, ${y}`);
        
        // Debug tile at click position
        if (debugMode) {
            const tileIndex = y * WORLD_SIZE + x;
            if (tileIndex >= 0 && tileIndex < tiles.length) {
                const tile = tiles[tileIndex];
                console.log(`Tile (${x},${y}):`, {
                    mood: tile.mood,
                    visits: tile.visits,
                    type: tile.type,
                    influence: tile.currentInfluence
                });
            }
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                togglePause();
                break;
            case 'r':
                resetWorld();
                break;
            case 'a':
                addRandomAgent();
                break;
            case 'd':
                toggleDebug();
                break;
            case 's':
                takeScreenshot();
                break;
        }
    });
}

// Create the tile grid
function createTiles() {
    tiles = [];
    
    for (let y = 0; y < WORLD_SIZE; y++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            tiles.push({
                x: x,
                y: y,
                mood: 0,              // -1 (decay) to 1 (flourish)
                visits: 0,            // agent visit count
                type: 0,              // 0=soil, 1=growing, 2=mature
                lastUpdate: 0,        // for growth timing
                currentInfluence: 0,  // this frame's influence
                
                // Biological parameters (Phase 2.4)
                water: 0.3 + Math.random() * 0.3,      // Moisture content (0.3-0.6)
                nutrients: 0.2 + Math.random() * 0.4,   // Soil nutrients (0.2-0.6)
                light: 1.0,                             // Light availability (starts full)
                height_from_ground: 0,                  // For growth bias
                
                // Fire/clearing mechanics
                fire_risk: 0,
                recovery_time: 0
            });
        }
    }
}

// Create initial agents
function createAgents() {
    agents = [];
    
    for (let i = 0; i < INITIAL_AGENT_COUNT; i++) {
        agents.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            vx: (Math.random() - 0.5) * 2,  // velocity -1 to 1
            vy: (Math.random() - 0.5) * 2,
            emotion: Math.random() > 0.5 ? 1 : -1,  // joy or sorrow
            id: i,
            energy: 1.0,
            age: 0
        });
    }
}

// Main game loop
function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Update FPS counter
    updateFPS();
    
    if (!paused) {
        update(deltaTime);
    }
    
    render();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Update FPS counter
function updateFPS() {
    frameCount++;
    const now = performance.now();
    
    if (now - lastFpsUpdate > 1000) {
        currentFps = Math.round(frameCount * 1000 / (now - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = now;
    }
}

// Main update function
function update(deltaTime) {
    updateAgents(deltaTime);
    updateTileInfluence();
    updateTileGrowth(performance.now());
    updateResourceDiffusion();
    updateFireRisk();
    updateStatistics();
}

// Update agent movement with gravity
function updateAgents(deltaTime) {
    const speed = 0.004; // pixels per millisecond (scaled for 32x32)
    const gravity = 0.0008; // downward acceleration
    const friction = 0.98; // air resistance
    
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Random walk with reduced strength
        agent.vx += (Math.random() - 0.5) * 0.04;
        agent.vy += (Math.random() - 0.5) * 0.04;
        
        // Apply gravity
        agent.vy += gravity * deltaTime;
        
        // Apply friction
        agent.vx *= friction;
        agent.vy *= friction;
        
        // Clamp velocity
        const maxSpeed = 2.0; // Increased for larger world
        agent.vx = Math.max(-maxSpeed, Math.min(maxSpeed, agent.vx));
        agent.vy = Math.max(-maxSpeed, Math.min(maxSpeed, agent.vy));
        
        // Move
        agent.x += agent.vx * speed * deltaTime;
        agent.y += agent.vy * speed * deltaTime;
        
        // Bounce off walls
        if (agent.x < 0 || agent.x >= WORLD_SIZE) {
            agent.vx *= -0.8; // slight energy loss on bounce
            agent.x = Math.max(0, Math.min(WORLD_SIZE - 1, agent.x));
        }
        
        // Ground collision (bounce)
        if (agent.y >= WORLD_SIZE - 0.1) {
            agent.vy *= -0.7; // energy loss on ground bounce
            agent.y = WORLD_SIZE - 0.1;
            
            // Small chance to jump when on ground
            if (Math.random() < 0.01) {
                agent.vy = -1.2; // jump force (scaled for larger world)
            }
        }
        
        // Ceiling collision
        if (agent.y < 0) {
            agent.vy *= -0.5;
            agent.y = 0;
        }
        
        // Age the agent
        agent.age += deltaTime;
        
        // Occasionally change emotion (adds dynamism)
        if (Math.random() < 0.001) {
            agent.emotion *= -1;
            console.log(`🎭 Agent ${agent.id} changed emotion to ${agent.emotion > 0 ? 'joy' : 'sorrow'}`);
        }
    }
}

// Update tile influence from agents
function updateTileInfluence() {
    // Reset influence for this frame
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].currentInfluence = 0;
    }
    
    // Calculate agent influence on tiles
    for (let a = 0; a < agents.length; a++) {
        const agent = agents[a];
        const agentX = Math.floor(agent.x);
        const agentY = Math.floor(agent.y);
        const influenceRadius = 3; // Increased for 32x32 grid
        
        // Check tiles in radius (brute force)
        for (let y = agentY - influenceRadius; y <= agentY + influenceRadius; y++) {
            for (let x = agentX - influenceRadius; x <= agentX + influenceRadius; x++) {
                if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
                    const tileIndex = y * WORLD_SIZE + x;
                    const tile = tiles[tileIndex];
                    
                    // Manhattan distance
                    const distance = Math.abs(x - agentX) + Math.abs(y - agentY);
                    
                    if (distance <= influenceRadius) {
                        const influence = agent.emotion * (1 - distance / influenceRadius) * 0.5;
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
        tile.mood += tile.currentInfluence * 0.02; // slow accumulation
        tile.mood = Math.max(-1, Math.min(1, tile.mood)); // clamp to [-1, 1]
    }
}

// Update tile growth and spreading
function updateTileGrowth(currentTime) {
    const growthInterval = 400; // milliseconds between growth updates (increased for performance)
    
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        
        // Only update if enough time has passed
        if (currentTime - tile.lastUpdate > growthInterval) {
            tile.lastUpdate = currentTime;
            
            // Resource-driven growth conditions (Phase 2.4)
            const hasWater = tile.water > 0.3;
            const hasNutrients = tile.nutrients > 0.2;
            const hasLight = tile.light > 0.1;
            const hasMood = tile.mood > 0.1;
            
            if (hasWater && hasNutrients && hasLight && hasMood && tile.visits > 1) {
                // Calculate growth rate based on resources
                const resourceFactor = Math.min(tile.water, tile.nutrients, tile.light);
                const growthRate = 0.02 * resourceFactor * (1 - tile.type / 2); // slower as it matures
                
                // Update type and height
                const oldType = tile.type;
                tile.type = Math.min(tile.type + growthRate, 2);
                
                // Update height as plant grows
                if (tile.type > oldType) {
                    tile.height_from_ground = Math.floor(tile.type * 10);
                }
                
                // Consume resources
                tile.water -= 0.005;
                tile.nutrients -= 0.003;
                
                // Spread influence to neighbors
                if (tile.type > 0.5) {
                    spreadToNeighbors(tile);
                }
            }
            
            // Update light based on nearby canopy
            updateTileLight(tile, i);
            
            // Slow decay if no recent influence
            if (tile.currentInfluence === 0) {
                tile.mood *= 0.9995; // very slow decay
                tile.type *= 0.9998; // even slower type decay
            }
        }
    }
}

// Spread influence to neighboring tiles with height-based bias
function spreadToNeighbors(sourceTile) {
    const spreadRadius = 1; // Reduced for performance on larger grid
    const spreadAmount = 0.02; // Increased to compensate for smaller radius
    
    // Height-based growth bias (Phase 2.4 - Pixel's insight)
    const horizontalBias = sourceTile.height_from_ground * 0.1;
    
    for (let dy = -spreadRadius; dy <= spreadRadius; dy++) {
        for (let dx = -spreadRadius; dx <= spreadRadius; dx++) {
            const nx = sourceTile.x + dx;
            const ny = sourceTile.y + dy;
            
            if (nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
                const neighborIndex = ny * WORLD_SIZE + nx;
                const neighbor = tiles[neighborIndex];
                
                // Distance-based spreading
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= spreadRadius && distance > 0) {
                    // Apply horizontal bias - taller plants spread more horizontally
                    const isHorizontal = Math.abs(dx) > Math.abs(dy);
                    const biasMultiplier = isHorizontal ? (1 + horizontalBias) : (1 - horizontalBias * 0.5);
                    
                    const spreadInfluence = spreadAmount * sourceTile.mood * (1 - distance / spreadRadius) * biasMultiplier;
                    neighbor.mood += spreadInfluence;
                    neighbor.mood = Math.max(-1, Math.min(1, neighbor.mood));
                    
                    // Also spread some nutrients (leaf litter from mature trees)
                    if (sourceTile.type > 1.5) {
                        neighbor.nutrients += 0.001;
                        neighbor.nutrients = Math.min(1, neighbor.nutrients);
                    }
                }
            }
        }
    }
}

// Update light availability based on nearby canopy
function updateTileLight(tile, tileIndex) {
    // Reset to full light
    tile.light = 1.0;
    
    // Check for canopy above and around
    const checkRadius = 2; // Reduced for performance
    for (let dy = -checkRadius; dy <= checkRadius; dy++) {
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            const nx = tile.x + dx;
            const ny = tile.y + dy;
            
            if (nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
                const neighborIndex = ny * WORLD_SIZE + nx;
                const neighbor = tiles[neighborIndex];
                
                // Taller, mature plants cast shade
                if (neighbor.type > 1 && neighbor.height_from_ground > tile.height_from_ground) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const shadeFactor = (1 - distance / checkRadius) * (neighbor.type / 2);
                    tile.light -= shadeFactor * 0.2;
                }
            }
        }
    }
    
    tile.light = Math.max(0.1, tile.light); // Always some ambient light
}

// Water and nutrient diffusion (Phase 2.4)
function updateResourceDiffusion() {
    // Create a copy for simultaneous update
    const waterChanges = new Float32Array(TILE_COUNT);
    
    // Calculate water flow
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const neighbors = getNeighborIndices(tile.x, tile.y);
        
        // Calculate average water level of neighbors
        let totalWater = tile.water;
        let count = 1;
        
        for (let ni of neighbors) {
            totalWater += tiles[ni].water;
            count++;
        }
        
        const avgWater = totalWater / count;
        const flow = (avgWater - tile.water) * 0.1; // 10% flow rate
        waterChanges[i] = flow;
    }
    
    // Apply water changes
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].water += waterChanges[i];
        tiles[i].water = Math.max(0, Math.min(1, tiles[i].water));
        
        // Add small amount of water from "rain" occasionally
        if (Math.random() < 0.0005) { // Reduced frequency for larger grid
            tiles[i].water += 0.1;
            tiles[i].water = Math.min(1, tiles[i].water);
        }
    }
}

// Fire risk and clearing mechanics (Phase 2.4)
function updateFireRisk() {
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        
        // Fire risk increases with negative mood and mature vegetation
        if (tile.mood < -0.7 && tile.type > 1) {
            tile.fire_risk += 0.01;
            
            // Trigger clearing event
            if (tile.fire_risk > 0.1 && Math.random() < 0.05) {
                clearTile(tile, i);
            }
        } else if (tile.fire_risk > 0) {
            // Slowly reduce fire risk if mood improves
            tile.fire_risk *= 0.99;
        }
    }
}

// Clear a tile and spread clearing to neighbors
function clearTile(tile, tileIndex) {
    // Reset tile to cleared state
    tile.type = 0;
    tile.height_from_ground = 0;
    tile.fire_risk = 0;
    tile.mood = 0.1; // Slight positive mood for regrowth
    tile.recovery_time = 100;
    
    // Enrich soil after clearing (fire enrichment)
    tile.nutrients += 0.2;
    tile.nutrients = Math.min(1, tile.nutrients);
    
    // Spread clearing to nearby tiles
    const neighbors = getNeighborIndices(tile.x, tile.y);
    for (let ni of neighbors) {
        const neighbor = tiles[ni];
        if (neighbor.type > 1 && Math.random() < 0.3) {
            clearTile(neighbor, ni);
        }
    }
    
    console.log(`🔥 Clearing event at (${tile.x}, ${tile.y}) - emotional fire triggered`);
}

// Get neighbor tile indices
function getNeighborIndices(x, y) {
    const indices = [];
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
                indices.push(ny * WORLD_SIZE + nx);
            }
        }
    }
    return indices;
}

// Update statistics
function updateStatistics() {
    let totalMood = 0;
    let matureCount = 0;
    let totalVisits = 0;
    
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        totalMood += tile.mood;
        totalVisits += tile.visits;
        if (tile.type > 1.5) matureCount++;
    }
    
    stats.avgMood = totalMood / TILE_COUNT;
    stats.matureTiles = matureCount;
    stats.totalVisits = totalVisits;
}

// Render the world
function render() {
    const SCALE = 16; // Scale factor to make 32x32 grid visible (512/32 = 16)
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 512);
    
    renderTiles(SCALE);
    renderAgents(SCALE);
    
    if (debugMode) {
        renderDebugInfo(SCALE);
    }
}

// Render all tiles
function renderTiles(scale) {
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const color = getTileColor(tile);
        
        ctx.fillStyle = color;
        ctx.fillRect(tile.x * scale, tile.y * scale, scale, scale);
        
        // Draw grid lines in debug mode
        if (debugMode) {
            ctx.strokeStyle = '#333';
            ctx.strokeRect(tile.x * scale, tile.y * scale, scale, scale);
        }
    }
}

// Get color for a tile based on its state
function getTileColor(tile) {
    // Base color influenced by type and mood
    const growthIntensity = tile.type * 100;
    const moodInfluence = tile.mood * 50;
    
    // Fire risk shows as orange/red tinge
    if (tile.fire_risk > 0.05) {
        const fireIntensity = tile.fire_risk * 255;
        return `rgb(${Math.min(255, 100 + fireIntensity)}, ${Math.min(255, 50 + growthIntensity)}, 0)`;
    }
    
    // Water-stressed plants show brown
    if (tile.type > 0 && tile.water < 0.2) {
        const brownIntensity = growthIntensity * 0.6;
        return `rgb(${brownIntensity}, ${brownIntensity * 0.7}, ${brownIntensity * 0.3})`;
    }
    
    // Healthy growth is green, intensity based on maturity and resources
    if (tile.type > 0) {
        const resourceHealth = Math.min(tile.water, tile.nutrients, tile.light);
        const greenIntensity = Math.min(255, growthIntensity + moodInfluence + resourceHealth * 50);
        const redComponent = Math.max(0, 20 - tile.type * 10); // Less red as it matures
        const blueComponent = Math.max(0, 10 + tile.height_from_ground * 2); // Slight blue for tall plants
        
        return `rgb(${redComponent}, ${greenIntensity}, ${blueComponent})`;
    }
    
    // Bare soil color varies by nutrient content
    const soilBase = 20 + tile.nutrients * 30;
    return `rgb(${soilBase}, ${soilBase * 0.8}, ${soilBase * 0.6})`;
}

// Render all agents
function renderAgents(scale) {
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Agent position in pixels
        const x = agent.x * scale;
        const y = agent.y * scale;
        
        // Agent color based on emotion
        ctx.fillStyle = agent.emotion > 0 ? '#ffff00' : '#ff00ff'; // yellow joy, magenta sorrow
        
        // Draw agent as a circle
        ctx.beginPath();
        ctx.arc(x, y, scale * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw velocity vector in debug mode
        if (debugMode) {
            ctx.strokeStyle = agent.emotion > 0 ? '#ffff00' : '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + agent.vx * scale * 10, y + agent.vy * scale * 10);
            ctx.stroke();
            
            // Draw influence radius
            ctx.strokeStyle = agent.emotion > 0 ? '#ffff0033' : '#ff00ff33';
            ctx.strokeRect(
                (agent.x - 2) * scale, 
                (agent.y - 2) * scale, 
                4 * scale, 
                4 * scale
            );
        }
    }
}

// Render debug information
function renderDebugInfo(scale) {
    // Draw coordinate labels
    ctx.font = '10px monospace';
    ctx.fillStyle = '#666';
    
    for (let y = 0; y < WORLD_SIZE; y++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            ctx.fillText(`${x},${y}`, x * scale + 2, y * scale + 10);
        }
    }
}

// Update UI elements
function updateUI() {
    const fpsCounter = document.getElementById('fpsCounter');
    if (fpsCounter) fpsCounter.textContent = `FPS: ${currentFps}`;
    
    const agentCount = document.getElementById('agentCount');
    if (agentCount) agentCount.textContent = agents.length;
    
    const activeTiles = document.getElementById('activeTiles');
    if (activeTiles) {
        const active = tiles.filter(t => t.type > 0).length;
        activeTiles.textContent = active.toLocaleString();
    }
    
    const growingTiles = document.getElementById('growingTiles');
    if (growingTiles) {
        const growing = tiles.filter(t => t.type > 0 && t.type < 1).length;
        growingTiles.textContent = growing.toLocaleString();
    }
    
    const matureTiles = document.getElementById('matureTiles');
    if (matureTiles) matureTiles.textContent = stats.matureTiles.toLocaleString();
    
    const simTime = document.getElementById('simTime');
    if (simTime) simTime.textContent = `${Math.floor(performance.now() / 1000)}s`;
}

// Control functions
function togglePause() {
    paused = !paused;
    console.log(paused ? '⏸️ Simulation paused' : '▶️ Simulation resumed');
}

function resetWorld() {
    console.log('🔄 Resetting world...');
    createTiles();
    createAgents();
    console.log('✅ World reset complete');
}

function addRandomAgent() {
    const newAgent = {
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        emotion: Math.random() > 0.5 ? 1 : -1,
        id: agents.length,
        energy: 1.0,
        age: 0
    };
    
    agents.push(newAgent);
    console.log(`➕ Added agent ${newAgent.id} with ${newAgent.emotion > 0 ? 'joy' : 'sorrow'}`);
}

function toggleDebug() {
    debugMode = !debugMode;
    console.log(debugMode ? '🔍 Debug mode enabled' : '🔍 Debug mode disabled');
}

function takeScreenshot() {
    const link = document.createElement('a');
    link.download = `soup-emergence-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    console.log('📷 Screenshot saved');
}

function exportState() {
    const state = {
        timestamp: Date.now(),
        stats: stats,
        agentCount: agents.length,
        matureTiles: stats.matureTiles,
        avgMood: stats.avgMood
    };
    
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `soup-state-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('💾 State exported');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Setup control button listeners
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetWorld);
    
    const stepBtn = document.getElementById('stepBtn');
    if (stepBtn) stepBtn.addEventListener('click', () => {
        if (paused) {
            update(16); // Single frame update
            render();
            updateUI();
        }
    });
    
    const addAgentBtn = document.getElementById('addAgentBtn');
    if (addAgentBtn) addAgentBtn.addEventListener('click', addRandomAgent);
    
    const toggleDebugBtn = document.getElementById('toggleDebugBtn');
    if (toggleDebugBtn) toggleDebugBtn.addEventListener('click', toggleDebug);
    
    const agentSpeed = document.getElementById('agentSpeed');
    const speedValue = document.getElementById('speedValue');
    if (agentSpeed && speedValue) {
        agentSpeed.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value;
            // You could implement agent speed multiplier here
        });
    }
});