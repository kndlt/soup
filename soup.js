// SOUP - Living Forest Prototype
// Quick & dirty emergence experiment

// Global configuration
const WORLD_SIZE = 512;
const TILE_COUNT = WORLD_SIZE * WORLD_SIZE; // 262,144 tiles
const INITIAL_AGENT_COUNT = 20;

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
    const logElement = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString();
    const className = type === 'emergence' ? 'emergence' : type === 'warning' ? 'warning' : '';
    logElement.innerHTML += `<div class="${className}">[${timestamp}] ${message}</div>`;
    logElement.scrollTop = logElement.scrollHeight;
}

// Initialize the world
function init() {
    log('🚀 Initializing SOUP prototype...', 'emergence');
    
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    createTiles();
    createAgents();
    
    // Setup event listeners after canvas is available
    setupEventListeners();
    
    log(`✅ Created ${TILE_COUNT.toLocaleString()} tiles`);
    log(`✅ Created ${agents.length} agents`);
    log('🌱 Starting emergence simulation...', 'emergence');
    
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
        log(`🎯 Spawned agent ${newAgent.id} at (${x}, ${y})`);
        
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
                currentInfluence: 0   // this frame's influence
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
    updateStatistics();
}

// Update agent movement
function updateAgents(deltaTime) {
    const speed = 0.3; // pixels per millisecond
    
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Random walk with momentum
        agent.vx += (Math.random() - 0.5) * 0.1;
        agent.vy += (Math.random() - 0.5) * 0.1;
        
        // Clamp velocity
        const maxSpeed = 1.5;
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
        if (agent.y < 0 || agent.y >= WORLD_SIZE) {
            agent.vy *= -0.8;
            agent.y = Math.max(0, Math.min(WORLD_SIZE - 1, agent.y));
        }
        
        // Age the agent
        agent.age += deltaTime;
        
        // Occasionally change emotion (adds dynamism)
        if (Math.random() < 0.0001) {
            agent.emotion *= -1;
            log(`🎭 Agent ${agent.id} changed emotion to ${agent.emotion > 0 ? 'joy' : 'sorrow'}`);
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
        const influenceRadius = 8;
        
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
    const growthInterval = 200; // milliseconds between growth updates
    
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        
        // Only update if enough time has passed
        if (currentTime - tile.lastUpdate > growthInterval) {
            tile.lastUpdate = currentTime;
            
            // Growth conditions
            if (tile.mood > 0.2 && tile.visits > 1) {
                // Increase type (soil -> growing -> mature)
                const growthRate = 0.01 * (1 - tile.type / 2); // slower as it matures
                tile.type = Math.min(tile.type + growthRate, 2);
                
                // Spread influence to neighbors
                if (tile.type > 0.5) {
                    spreadToNeighbors(tile);
                }
            }
            
            // Slow decay if no recent influence
            if (tile.currentInfluence === 0) {
                tile.mood *= 0.9995; // very slow decay
                tile.type *= 0.9998; // even slower type decay
            }
        }
    }
}

// Spread influence to neighboring tiles
function spreadToNeighbors(sourceTile) {
    const spreadRadius = 2;
    const spreadAmount = 0.01;
    
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
                    const spreadInfluence = spreadAmount * sourceTile.mood * (1 - distance / spreadRadius);
                    neighbor.mood += spreadInfluence;
                    neighbor.mood = Math.max(-1, Math.min(1, neighbor.mood));
                }
            }
        }
    }
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
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);
    
    renderTiles();
    renderAgents();
    
    if (debugMode) {
        renderDebugInfo();
    }
}

// Render all tiles
function renderTiles() {
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const color = getTileColor(tile);
        
        ctx.fillStyle = color;
        ctx.fillRect(tile.x, tile.y, 1, 1);
    }
}

// Get color for a tile based on its state
function getTileColor(tile) {
    const baseIntensity = Math.abs(tile.mood) * 100;
    const typeBonus = tile.type * 80; // brighter for more mature tiles
    const totalIntensity = Math.min(255, baseIntensity + typeBonus);
    
    if (tile.mood < -0.1) {
        // Red for negative mood
        return `rgb(${totalIntensity}, 0, 0)`;
    } else if (tile.mood > 0.1) {
        // Green for positive mood
        return `rgb(0, ${totalIntensity}, 0)`;
    } else {
        // Gray for neutral, with slight brightness for type
        const gray = 16 + tile.type * 32;
        return `rgb(${gray}, ${gray}, ${gray})`;
    }
}

// Render all agents
function renderAgents() {
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        const x = Math.floor(agent.x);
        const y = Math.floor(agent.y);
        
        // Agent color based on emotion
        ctx.fillStyle = agent.emotion > 0 ? '#ffff00' : '#ff00ff'; // yellow joy, magenta sorrow
        
        // Draw agent as a small square
        ctx.fillRect(x - 1, y - 1, 3, 3);
        
        // Draw influence radius in debug mode
        if (debugMode) {
            ctx.strokeStyle = agent.emotion > 0 ? '#ffff0033' : '#ff00ff33';
            ctx.strokeRect(x - 8, y - 8, 16, 16);
        }
    }
}

// Render debug information
function renderDebugInfo() {
    // Show tile coordinates on hover (simplified)
    // Additional debug rendering would go here
}

// Update UI elements
function updateUI() {
    document.getElementById('fps').textContent = currentFps;
    document.getElementById('tileCount').textContent = TILE_COUNT.toLocaleString();
    document.getElementById('agentCount').textContent = agents.length;
    document.getElementById('avgMood').textContent = stats.avgMood.toFixed(4);
    document.getElementById('matureTiles').textContent = stats.matureTiles.toLocaleString();
}

// Control functions
function togglePause() {
    paused = !paused;
    log(paused ? '⏸️ Simulation paused' : '▶️ Simulation resumed');
}

function resetWorld() {
    log('🔄 Resetting world...', 'warning');
    createTiles();
    createAgents();
    log('✅ World reset complete', 'emergence');
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
    log(`➕ Added agent ${newAgent.id} with ${newAgent.emotion > 0 ? 'joy' : 'sorrow'}`);
}

function toggleDebug() {
    debugMode = !debugMode;
    log(debugMode ? '🔍 Debug mode enabled' : '🔍 Debug mode disabled');
}

function takeScreenshot() {
    const link = document.createElement('a');
    link.download = `soup-emergence-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    log('📷 Screenshot saved', 'emergence');
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
    
    log('💾 State exported', 'emergence');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);