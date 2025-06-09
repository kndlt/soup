// SOUP - Living Forest Prototype
// Quick & dirty emergence experiment

// Global configuration
const WORLD_WIDTH = 64; // Wider world for side-view
const WORLD_HEIGHT = 32; // Height represents vertical space
const TILE_COUNT = WORLD_WIDTH * WORLD_HEIGHT; // 2048 tiles
const INITIAL_AGENT_COUNT = 12; // More agents for larger world
const GROUND_LEVEL = 24; // Ground starts at y=24

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
            vy: 0,
            emotion: Math.random() > 0.5 ? 1 : -1,
            id: agents.length,
            energy: 1.0,
            age: 0,
            grounded: false,
            climbing: false
        };
        
        agents.push(newAgent);
        console.log(`🎯 Spawned agent ${newAgent.id} at (${x}, ${y}`);
        
        // Debug tile at click position
        if (debugMode) {
            const tileIndex = y * WORLD_WIDTH + x;
            if (tileIndex >= 0 && tileIndex < tiles.length) {
                const tile = tiles[tileIndex];
                console.log(`Tile (${x},${y}):`, {
                    mood: tile.mood,
                    visits: tile.visits,
                    growth: tile.growth,
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
    
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            // Determine initial tile type based on position
            let tileType = 'air';
            let solid = false;
            let climbable = false;
            
            // Ground level and below is soil
            if (y >= GROUND_LEVEL) {
                tileType = 'soil';
                solid = true;
            }
            
            tiles.push({
                x: x,
                y: y,
                tileType: tileType,       // 'air', 'soil', 'root', 'trunk', 'branch', 'leaf'
                solid: solid,             // Can agents stand on it?
                climbable: climbable,     // Can agents climb it?
                mood: 0,                  // -1 (decay) to 1 (flourish)
                visits: 0,                // agent visit count
                growth: 0,                // 0=empty, 0-1=growing, 1+=mature
                lastUpdate: 0,            // for growth timing
                currentInfluence: 0,      // this frame's influence
                
                // Biological parameters (Phase 2.4)
                water: y >= GROUND_LEVEL ? 0.3 + Math.random() * 0.3 : 0,  // Moisture in soil
                nutrients: y >= GROUND_LEVEL ? 0.2 + Math.random() * 0.4 : 0, // Nutrients in soil
                light: y < GROUND_LEVEL ? 1.0 : 0.1,  // Light above ground
                
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
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * (GROUND_LEVEL - 5), // Spawn above ground
            vx: (Math.random() - 0.5) * 2,  // velocity -1 to 1
            vy: 0, // Start with no vertical velocity
            emotion: Math.random() > 0.5 ? 1 : -1,  // joy or sorrow
            id: i,
            energy: 1.0,
            age: 0,
            grounded: false, // Track if on solid ground
            climbing: false  // Track if climbing
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

// Update agent movement with platformer physics
function updateAgents(deltaTime) {
    const speed = 0.003; // pixels per millisecond
    const gravity = 0.0015; // downward acceleration
    const jumpForce = -2.5; // upward jump velocity
    const walkSpeed = 0.02; // horizontal movement
    
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Check what tile agent is on
        const tileX = Math.floor(agent.x);
        const tileY = Math.floor(agent.y);
        const tileBelowY = Math.floor(agent.y + 0.5);
        
        // Get tiles around agent
        let onSolid = false;
        let onClimbable = false;
        let inClimbable = false;
        
        // Check current tile (for climbing detection)
        if (tileY >= 0 && tileY < WORLD_HEIGHT && tileX >= 0 && tileX < WORLD_WIDTH) {
            const currentTile = tiles[tileY * WORLD_WIDTH + tileX];
            inClimbable = currentTile.climbable;
        }
        
        // Check tile below (for ground detection)
        if (tileBelowY < WORLD_HEIGHT && tileX >= 0 && tileX < WORLD_WIDTH) {
            const tileBelow = tiles[tileBelowY * WORLD_WIDTH + tileX];
            onSolid = tileBelow.solid;
            onClimbable = tileBelow.climbable;
        }
        
        agent.grounded = onSolid && agent.vy >= 0 && !onClimbable && !inClimbable;
        agent.climbing = onClimbable || inClimbable;
        
        // Horizontal movement (random walk)
        if (agent.grounded || agent.climbing) {
            agent.vx += (Math.random() - 0.5) * walkSpeed;
        } else {
            // Less control in air
            agent.vx += (Math.random() - 0.5) * walkSpeed * 0.3;
        }
        
        // Apply gravity (unless climbing)
        if (!agent.climbing) {
            agent.vy += gravity * deltaTime;
        } else {
            // When stuck in a tree trunk, jump upward strongly
            agent.vy = -1.5; // Strong upward boost
            // Also allow horizontal movement while climbing
            agent.vx += (Math.random() - 0.5) * walkSpeed * 0.5;
        }
        
        // Jump behavior
        if (agent.grounded && Math.random() < 0.02) {
            agent.vy = jumpForce;
            agent.grounded = false;
        }
        
        // Climbing agents can also jump off
        if (agent.climbing && Math.random() < 0.01) {
            agent.vy = jumpForce * 0.7; // Smaller jump from climbing
            agent.vx += (Math.random() - 0.5) * 1.0; // Random horizontal push
            agent.climbing = false;
        }
        
        // Apply friction
        agent.vx *= agent.grounded ? 0.85 : 0.98;
        if (!agent.climbing) {
            agent.vy *= 0.99;
        }
        
        // Clamp velocity
        const maxSpeedX = 1.5;
        const maxSpeedY = 3.0;
        agent.vx = Math.max(-maxSpeedX, Math.min(maxSpeedX, agent.vx));
        agent.vy = Math.max(-maxSpeedY, Math.min(maxSpeedY, agent.vy));
        
        // Move with collision detection
        const newX = agent.x + agent.vx * speed * deltaTime;
        const newY = agent.y + agent.vy * speed * deltaTime;
        
        // Check horizontal collision
        if (newX >= 0 && newX < WORLD_WIDTH) {
            const checkY = Math.floor(agent.y);
            if (checkY >= 0 && checkY < WORLD_HEIGHT) {
                const newTileIndex = checkY * WORLD_WIDTH + Math.floor(newX);
                const newTile = tiles[newTileIndex];
                if (!newTile.solid || (newTile.solid && newTile.climbable)) {
                    agent.x = newX;
                } else {
                    agent.vx = 0;
                }
            }
        } else {
            // Wall bounce
            agent.vx *= -0.5;
            agent.x = Math.max(0, Math.min(WORLD_WIDTH - 0.1, agent.x));
        }
        
        // Check vertical collision
        if (newY >= 0 && newY < WORLD_HEIGHT) {
            const checkX = Math.floor(agent.x);
            if (checkX >= 0 && checkX < WORLD_WIDTH) {
                const newTileIndex = Math.floor(newY) * WORLD_WIDTH + checkX;
                const newTile = tiles[newTileIndex];
                if (!newTile.solid || (newTile.solid && newTile.climbable)) {
                    agent.y = newY;
                } else {
                    // Hit solid tile
                    if (agent.vy > 0) {
                        // Landing
                        agent.y = Math.floor(newY);
                        agent.grounded = true;
                    }
                    agent.vy = 0;
                }
            }
        } else {
            // Ceiling/floor collision
            agent.vy = 0;
            agent.y = Math.max(0, Math.min(WORLD_HEIGHT - 0.1, agent.y));
        }
        
        // Age the agent
        agent.age += deltaTime;
        
        // Occasionally change emotion
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
                if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
                    const tileIndex = y * WORLD_WIDTH + x;
                    const tile = tiles[tileIndex];
                    
                    // Manhattan distance
                    const distance = Math.abs(x - agentX) + Math.abs(y - agentY);
                    
                    if (distance <= influenceRadius) {
                        const influence = agent.emotion * (1 - distance / influenceRadius) * 0.5;
                        tile.currentInfluence += influence;
                        tile.visits++;
                        
                        // Joyful agents can drop seeds on soil
                        if (agent.emotion > 0 && distance === 0) {
                            const currentTile = tiles[tileIndex];
                            // Plant seeds on soil or when on branches
                            if ((currentTile.tileType === 'soil' || currentTile.tileType === 'branch') && 
                                currentTile.growth < 0.1 && Math.random() < 0.05) {
                                if (currentTile.tileType === 'soil') {
                                    // Direct planting
                                    currentTile.growth = 0.1;
                                    console.log(`🌱 Seed planted at (${x}, ${y})`);
                                } else {
                                    // Drop from branch
                                    for (let checkY = y + 1; checkY < WORLD_HEIGHT; checkY++) {
                                        const groundIndex = checkY * WORLD_WIDTH + x;
                                        const groundTile = tiles[groundIndex];
                                        if (groundTile.tileType === 'soil' && groundTile.growth === 0) {
                                            groundTile.growth = 0.1;
                                            console.log(`🌱 Seed dropped to (${x}, ${checkY})`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
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
    const growthInterval = 100; // milliseconds between growth updates (faster for visible growth)
    
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        
        // Only update if enough time has passed
        if (currentTime - tile.lastUpdate > growthInterval) {
            tile.lastUpdate = currentTime;
            
            // Resource-driven growth conditions (Phase 2.4)
            const hasWater = tile.water > 0.2;
            const hasNutrients = tile.nutrients > 0.1;
            const hasLight = tile.light > 0.1;
            const hasMood = tile.mood > 0.05;
            
            if (hasWater && hasNutrients && hasLight && hasMood && tile.visits > 0) {
                // Calculate growth rate based on resources
                const resourceFactor = Math.min(tile.water, tile.nutrients, tile.light);
                const growthRate = 0.1 * resourceFactor; // Much faster growth
                
                // Update type and height
                const oldGrowth = tile.growth;
                tile.growth = Math.min(tile.growth + growthRate, 2);
                
                // Update height as plant grows
                if (tile.growth > oldGrowth) {
                    // Seeds in soil grow roots down and shoots up
                    if (tile.tileType === 'soil' && tile.growth > 0.1 && tile.y >= GROUND_LEVEL && tile.y < GROUND_LEVEL + 2) {
                        // This is a seed at surface level - sprout upward
                        const aboveIndex = (tile.y - 1) * WORLD_WIDTH + tile.x;
                        if (tile.y > 0 && tiles[aboveIndex].tileType === 'air') {
                            tiles[aboveIndex].tileType = 'trunk';
                            tiles[aboveIndex].solid = true;
                            tiles[aboveIndex].climbable = true;
                            tiles[aboveIndex].growth = 0.1;
                            tiles[aboveIndex].mood = tile.mood * 0.8;
                            tiles[aboveIndex].water = tile.water * 0.9;
                            tiles[aboveIndex].nutrients = tile.nutrients * 0.9;
                            tiles[aboveIndex].light = tile.light * 0.95;
                            tiles[aboveIndex].visits = tile.visits; // Inherit parent's visits
                            
                            // Mark this soil as having a plant
                            tile.tileType = 'root';
                        }
                        
                        // Also grow roots downward
                        const belowIndex = (tile.y + 1) * WORLD_WIDTH + tile.x;
                        if (tile.y < WORLD_HEIGHT - 1 && tiles[belowIndex].tileType === 'soil') {
                            tiles[belowIndex].tileType = 'root';
                            tiles[belowIndex].growth = 0.1;
                            tiles[belowIndex].water = Math.min(1, tiles[belowIndex].water + 0.1);
                        }
                    } else if (tile.tileType === 'trunk' && tile.growth > 0.3) {
                        // Trunk growing upward
                        const aboveIndex = (tile.y - 1) * WORLD_WIDTH + tile.x;
                        if (tile.y > 0 && tiles[aboveIndex].tileType === 'air') {
                            // Growth-based height with resource modifiers
                            const resourceQuality = (tile.water + tile.nutrients + tile.light) / 3;
                            const heightAboveGround = GROUND_LEVEL - tile.y;
                            const maxHeight = 5 + Math.floor(resourceQuality * 10); // 5-15 tiles based on resources
                            
                            if (heightAboveGround < maxHeight && tile.growth > 0.5) {
                                // Continue trunk growth
                                tiles[aboveIndex].tileType = 'trunk';
                                tiles[aboveIndex].solid = true;
                                tiles[aboveIndex].climbable = true;
                                tiles[aboveIndex].growth = 0.1;
                                tiles[aboveIndex].mood = tile.mood * 0.9;
                                tiles[aboveIndex].water = tile.water * 0.85;
                                tiles[aboveIndex].nutrients = tile.nutrients * 0.85;
                                tiles[aboveIndex].light = tile.light * 0.95;
                                tiles[aboveIndex].visits = Math.max(1, tile.visits);
                            } else if (tile.growth > 1.0 || heightAboveGround >= maxHeight) {
                                // Top of tree - add leaves
                                tiles[aboveIndex].tileType = 'leaf';
                                tiles[aboveIndex].growth = 0.3;
                                tiles[aboveIndex].water = tile.water * 0.8;
                                tiles[aboveIndex].nutrients = tile.nutrients * 0.8;
                                tiles[aboveIndex].light = 1.0; // Leaves get full light at top
                                tiles[aboveIndex].mood = tile.mood * 0.9;
                                tiles[aboveIndex].visits = tile.visits;
                                
                                // Also add side leaves
                                const leftIndex = tile.y * WORLD_WIDTH + (tile.x - 1);
                                const rightIndex = tile.y * WORLD_WIDTH + (tile.x + 1);
                                if (tile.x > 0 && tiles[leftIndex].tileType === 'air') {
                                    tiles[leftIndex].tileType = 'leaf';
                                    tiles[leftIndex].growth = 0.2;
                                    tiles[leftIndex].water = tile.water * 0.7;
                                    tiles[leftIndex].nutrients = tile.nutrients * 0.7;
                                    tiles[leftIndex].light = 0.9;
                                    tiles[leftIndex].mood = tile.mood * 0.8;
                                    tiles[leftIndex].visits = tile.visits;
                                }
                                if (tile.x < WORLD_WIDTH - 1 && tiles[rightIndex].tileType === 'air') {
                                    tiles[rightIndex].tileType = 'leaf';
                                    tiles[rightIndex].growth = 0.2;
                                    tiles[rightIndex].water = tile.water * 0.7;
                                    tiles[rightIndex].nutrients = tile.nutrients * 0.7;
                                    tiles[rightIndex].light = 0.9;
                                    tiles[rightIndex].mood = tile.mood * 0.8;
                                    tiles[rightIndex].visits = tile.visits;
                                }
                            } else {
                                // Continue trunk growth
                                tiles[aboveIndex].tileType = 'trunk';
                                tiles[aboveIndex].solid = true;
                                tiles[aboveIndex].climbable = true;
                                tiles[aboveIndex].growth = 0.1;
                                tiles[aboveIndex].mood = tile.mood * 0.9;
                                tiles[aboveIndex].water = tile.water * 0.85;
                                tiles[aboveIndex].nutrients = tile.nutrients * 0.85;
                                tiles[aboveIndex].light = tile.light * 0.95;
                                tiles[aboveIndex].visits = tile.visits; // Inherit parent's visits
                            }
                        }
                        
                        // Branch probability increases with height
                        const heightAboveGround = GROUND_LEVEL - tile.y;
                        const branchChance = 0.05 + Math.min(heightAboveGround / 20, 0.15) * 0.15;
                        
                        if (tile.y < GROUND_LEVEL - 2 && Math.random() < branchChance) {
                            const branchSide = Math.random() < 0.5 ? -1 : 1;
                            const branchIndex = tile.y * WORLD_WIDTH + (tile.x + branchSide);
                            if ((branchSide === -1 && tile.x > 0) || (branchSide === 1 && tile.x < WORLD_WIDTH - 1)) {
                                if (tiles[branchIndex].tileType === 'air') {
                                    tiles[branchIndex].tileType = 'branch';
                                    tiles[branchIndex].solid = true;
                                    tiles[branchIndex].climbable = true;
                                    tiles[branchIndex].growth = 0.3;
                                    tiles[branchIndex].water = tile.water * 0.7;
                                    tiles[branchIndex].nutrients = tile.nutrients * 0.7;
                                    tiles[branchIndex].light = tile.light * 0.9;
                                    tiles[branchIndex].mood = tile.mood * 0.8;
                                    tiles[branchIndex].visits = tile.visits;
                                }
                            }
                        }
                    } else if (tile.tileType === 'root' && tile.growth > 0.5 && Math.random() < 0.2) {
                        // Roots growing deeper
                        const belowIndex = (tile.y + 1) * WORLD_WIDTH + tile.x;
                        if (tile.y < WORLD_HEIGHT - 1 && tiles[belowIndex].tileType === 'soil') {
                            tiles[belowIndex].tileType = 'root';
                            tiles[belowIndex].growth = 0.1;
                            tiles[belowIndex].water = Math.min(1, tiles[belowIndex].water + 0.05);
                            tiles[belowIndex].nutrients = Math.min(1, tiles[belowIndex].nutrients + 0.02);
                        }
                    }
                }
                
                // Consume resources
                tile.water -= 0.005;
                tile.nutrients -= 0.003;
                
                // Spread influence to neighbors
                if (tile.growth > 0.5 && (tile.tileType === 'trunk' || tile.tileType === 'leaf')) {
                    spreadToNeighbors(tile);
                }
            }
            
            // Update light based on nearby canopy
            updateTileLight(tile, i);
            
            // Slow decay if no recent influence
            if (tile.currentInfluence === 0) {
                tile.mood *= 0.9995; // very slow decay
                tile.growth *= 0.9998; // even slower growth decay
            }
        }
    }
}

// Spread influence to neighboring tiles with height-based bias
function spreadToNeighbors(sourceTile) {
    const spreadRadius = 1; // Reduced for performance on larger grid
    const spreadAmount = 0.02; // Increased to compensate for smaller radius
    
    // Height-based growth bias for canopy spreading
    const isCanopy = sourceTile.tileType === 'leaf' || sourceTile.tileType === 'branch';
    const horizontalBias = isCanopy ? 0.3 : 0;
    
    for (let dy = -spreadRadius; dy <= spreadRadius; dy++) {
        for (let dx = -spreadRadius; dx <= spreadRadius; dx++) {
            const nx = sourceTile.x + dx;
            const ny = sourceTile.y + dy;
            
            if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
                const neighborIndex = ny * WORLD_WIDTH + nx;
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
                    if (sourceTile.growth > 1.5 && sourceTile.tileType === 'leaf') {
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
            
            if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
                const neighborIndex = ny * WORLD_WIDTH + nx;
                const neighbor = tiles[neighborIndex];
                
                // Mature plants cast shade from above
                if (neighbor.growth > 1 && neighbor.y < tile.y && 
                    (neighbor.tileType === 'leaf' || neighbor.tileType === 'branch')) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const shadeFactor = (1 - distance / checkRadius) * neighbor.growth;
                    tile.light -= shadeFactor * 0.3;
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
        if (tile.mood < -0.7 && tile.growth > 1) {
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
    tile.growth = 0;
    tile.tileType = 'soil';
    tile.solid = true; // Back to solid soil
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
        if (neighbor.growth > 1 && (neighbor.tileType === 'trunk' || neighbor.tileType === 'leaf') && Math.random() < 0.3) {
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
            if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
                indices.push(ny * WORLD_WIDTH + nx);
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
        if (tile.growth > 1.5) matureCount++;
    }
    
    stats.avgMood = totalMood / TILE_COUNT;
    stats.matureTiles = matureCount;
    stats.totalVisits = totalVisits;
}

// Render the world
function render() {
    const SCALE_X = 8; // 512 / 64 = 8 pixels per tile width
    const SCALE_Y = 16; // 512 / 32 = 16 pixels per tile height
    
    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue at top
    gradient.addColorStop(0.7, '#E0F6FF'); // Lighter blue
    gradient.addColorStop(1, '#FFF4E6'); // Warm horizon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    renderTiles(SCALE_X, SCALE_Y);
    renderAgents(SCALE_X, SCALE_Y);
    
    if (debugMode) {
        renderDebugInfo(SCALE_X, SCALE_Y);
    }
}

// Render all tiles
function renderTiles(scaleX, scaleY) {
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const color = getTileColor(tile);
        
        ctx.fillStyle = color;
        ctx.fillRect(tile.x * scaleX, tile.y * scaleY, scaleX, scaleY);
        
        // Draw grid lines in debug mode
        if (debugMode) {
            ctx.strokeStyle = '#333';
            ctx.strokeRect(tile.x * scaleX, tile.y * scaleY, scaleX, scaleY);
        }
    }
}

// Get color for a tile based on its state
function getTileColor(tile) {
    // Color based on tile type
    switch(tile.tileType) {
        case 'air':
            return 'transparent'; // Sky shows through
            
        case 'soil':
            // Soil color varies by depth and nutrients
            const depth = (tile.y - GROUND_LEVEL) / (WORLD_HEIGHT - GROUND_LEVEL);
            const soilBase = 40 + tile.nutrients * 40 - depth * 20;
            return `rgb(${soilBase}, ${soilBase * 0.7}, ${soilBase * 0.5})`;
            
        case 'root':
            // Roots are darker brown
            return `rgb(${60 + tile.mood * 20}, ${40 + tile.mood * 10}, 20)`;
            
        case 'trunk':
            // Tree trunk browns
            const trunkBase = 80 + tile.growth * 40;
            return `rgb(${trunkBase}, ${trunkBase * 0.6}, ${trunkBase * 0.3})`;
            
        case 'branch':
            // Branches slightly lighter than trunk
            const branchBase = 100 + tile.growth * 30;
            return `rgb(${branchBase}, ${branchBase * 0.7}, ${branchBase * 0.4})`;
            
        case 'leaf':
            // Leaves are green, affected by mood and resources
            const resourceHealth = Math.min(tile.water, tile.nutrients, tile.light);
            const greenIntensity = Math.min(255, 100 + tile.mood * 80 + resourceHealth * 75);
            const redComponent = Math.max(0, 30 - tile.growth * 20);
            return `rgb(${redComponent}, ${greenIntensity}, 20)`;
            
        default:
            return '#FF00FF'; // Magenta for errors
    }
}

// Render all agents
function renderAgents(scaleX, scaleY) {
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Agent position in pixels
        const x = agent.x * scaleX;
        const y = agent.y * scaleY;
        
        // Agent color based on emotion
        ctx.fillStyle = agent.emotion > 0 ? '#ffff00' : '#ff00ff'; // yellow joy, magenta sorrow
        
        // Draw agent as a circle
        ctx.beginPath();
        ctx.arc(x, y, scaleX * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw velocity vector in debug mode
        if (debugMode) {
            ctx.strokeStyle = agent.emotion > 0 ? '#ffff00' : '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + agent.vx * scaleX * 10, y + agent.vy * scaleY * 10);
            ctx.stroke();
            
            // Draw influence radius
            ctx.strokeStyle = agent.emotion > 0 ? '#ffff0033' : '#ff00ff33';
            ctx.strokeRect(
                (agent.x - 2) * scaleX, 
                (agent.y - 2) * scaleY, 
                4 * scaleX, 
                4 * scaleY
            );
        }
    }
}

// Render debug information
function renderDebugInfo(scaleX, scaleY) {
    // Draw coordinate labels
    ctx.font = '10px monospace';
    ctx.fillStyle = '#666';
    
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            ctx.fillText(`${x},${y}`, x * scaleX + 2, y * scaleY + 10);
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
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * (GROUND_LEVEL - 1),
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