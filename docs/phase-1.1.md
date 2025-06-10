# Phase 1.1: SOUP - Living Forest Architecture

## 🧪 PROTOTYPE DISCLAIMER

**This repository is a THROWAWAY PROTOTYPE for experimentation only.**

- **Purpose**: Create and observe emergence in a living forest system
- **Timeline**: Once we see the emergence working, this repo becomes obsolete
- **Implementation**: All learnings will be replicated directly in Machi
- **Quality**: No need for perfection—this is about discovery, not production

This is a sandbox for proving concepts before integration. Expect messy, experimental code focused on demonstrating biological emergence rather than clean architecture.

## Understanding Machi: Current Architecture Analysis

Based on research of the Machi project (https://github.com/kndlt/machi), Machi is a sophisticated WebAssembly-based simulation platform featuring:

### Current Machi Architecture
- **WebAssembly Core**: Rust-based game engine providing high-performance state management at 60fps
- **Web Worker Threading**: Background game logic processing to maintain UI responsiveness  
- **Pixi.js Rendering**: Hardware-accelerated 2D graphics with pixel-perfect rendering
- **AI Coordination**: Multi-backend AI system (OpenAI, Ollama) for autonomous agent behaviors
- **Tile-Based World**: Interactive grid system with dynamic visual effects (moisture, lighting, hover states)

### Existing Agent System: "Promisers"
Machi already implements autonomous entities called "Promisers" that:
- Move with randomized velocity and direction
- Possess individual characteristics (size, color, position)
- Exhibit boundary-aware behaviors
- Support AI-driven actions (thinking, speaking, whispering)
- Communicate through thought bubble systems
- Interact with the tile-based environment

### Technical Foundation for SOUP Integration
Machi's existing architecture provides ideal groundwork for SOUP:
- **Worker-based processing**: Can handle complex growth calculations without blocking rendering
- **Efficient state management**: WASM handles real-time updates across thousands of entities
- **AI integration**: Promisers can influence and respond to forest growth through existing AI coordination
- **Tile system**: Current interactive tiles can be enhanced with biological properties
- **Visual effects pipeline**: Existing moisture/lighting systems can represent growth states

## SOUP Vision: Building on Machi's Foundation

SOUP (Super Organism Upbringing Project, 숲) will transform Machi's current tile system into a living ecosystem. Rather than replacing Machi's architecture, SOUP extends it—adding biological intelligence to tiles while leveraging existing Promiser behaviors and AI coordination.

The forest becomes both environment and character, growing in response to Promiser activities while providing meaningful feedback to AI-driven agent behaviors.

## Core Concepts Rephrased

### Biotic Tiles as Memory Cells
Each tile transitions beyond simple terrain into a living entity with:
- **Biological state**: fertility, moisture, growth stage, and decay cycles
- **Emotional resonance**: mood influenced by agent interactions (-1 decay to +1 flourishing)
- **Semantic evolution**: transformation between soil → root → trunk → canopy → bridge types
- **Memory storage**: persistent history of events, visitors, and emotional imprints

### Emergent Connectivity
The forest doesn't just grow—it connects. Bridges and pathways emerge organically through:
- Repeated agent traversal patterns
- Emotional bonds between distant locations
- Promise-keeping behaviors that spawn vine connections
- Cellular automaton rules that encourage bridging between isolated sections

### Emotional Ecology
Agent emotions become environmental forces:
- Joy accelerates growth and blooming
- Sorrow triggers decay and withering
- Love creates rare emergent features (friendship berries, blossom bridges)
- Grief leaves lasting memory imprints that influence future growth

## Pixel's Technical Solutions

### 🧱 Technical Architecture

**1. Performance Scalability**
*How do we maintain real-time growth simulation across thousands of tiles without compromising frame rates?*

**Pixel's Approach:**
- **Sparse Simulation**: Only simulate "active" tiles (recently affected, within player view, or near agents)
- **Chunking System**: Divide world into grid chunks, tick them asynchronously
- **Growth Priority Queue**: Maintain a list of tiles sorted by "urgency" (mood deltas, time since last update)
- **Tooling Tip**: Use an ECS (Entity Component System) model for fast diffing and batching

**2. Memory Management**
*What's the optimal tile memory depth? Should we decay or compress memory?*

**Yes and Yes:**
- Use event tagging instead of full logs: "Pixel passed", "joyful interaction", etc.
- Implement decay with reinforcement—memory decays over time unless reinforced by repetition

```typescript
memory = {
  "Pixel visited": { decay: 0.9, strength: 2 },
  "Promise kept": { decay: 0.99, strength: 4 }
}
```

**3. State Persistence**
*Full snapshots vs. deltas?*

- Use delta logs for long-term persistence (tick, tile_id, field, new_value)
- Periodically save full keyframe snapshots every N ticks
- Allow "rewind" and "fork" like git branches from forest state

### 🌱 Emergence Design

**4. Growth Rate Calibration**
*What tick intervals create satisfying change?*

**Human perception sweet spot**: visible change every 2–5 seconds, subtle motion every 0.5s.

Growth should slow as it matures:
```typescript
rate = baseRate * (1 - growthStage / maxStage)
```

**5. Complexity Boundaries**
*Avoid too random or too scripted?*

- Use **soft randomness**: Perlin noise, random walks, biased cellular automata
- **Anchor agents as stabilizers**: Their moods, paths, and memories act as attractors to structure emergence

**6. Bridge Logic**
*How to simulate natural connections?*

**Model as graph centrality:**
- Frequently traversed tile pairs increase link weight
- Threshold → growBridge()
- **Bonus**: Use Dijkstra-based "growth" to simulate vines reaching over distance

### 🔌 Integration Challenges

**7. Machi Compatibility**
*How to integrate cleanly?*

Keep SOUP as a **plug-in biome module** with:
- Shared world coordinates
- Independent simulation loop
- Shared tile schema contract (`Tile.hasSoupLayer = true`)
- Use event hooks so Machi can notify SOUP of agent actions without tight coupling

**8. Agent Interaction**
*Should they know they're affecting tiles?*

**Best path: unconscious impact**
- Agents act based on internal logic
- Forest responds based on observed emotion, behavior, and intent
- Later, you can add meta-awareness as an emergent trait: *"The forest changes when I'm sad..."*

**9. Visual Representation**
*How to show growth and emotion without clutter?*

Use tile shaders or sprite swaps:
- **Hue shift** = mood
- **Subtle animation** = growth stage
- **Particle overlays** = memory sparks
- Limit visuals to active camera chunk to avoid overload

**10. Worker Thread Distribution**
*How do we distribute growth calculations across Machi's existing Web Worker architecture?*

Integrate SOUP calculations into existing worker threads without blocking Promiser AI processing through priority-based task scheduling.

### 🧠 Philosophical Boundaries

**11. Authenticity vs. Performance**
*Where do we draw the line?*

Draw it at the point where player can't perceive the difference.

**Use poetic abstraction:**
- Memory ≠ neural net → it's emotionally weighted traces
- Growth ≠ biological accuracy → it's symbolic emergence

**12. Agency Balance**
*When does emergence become chaos?*

**Rule of Three**: All emergence must stem from 3 forces:
1. Agent presence
2. Tile memory
3. Environmental condition (light, water, etc.)

Anything else = noise.

**13. Narrative Integration: Pixel as Forest Spirit**
*How does Pixel affect the system concretely?*

Pixel is a **global modifier** with:
- **Mood aura** that biases nearby tile growth
- **"Whispers"** that reinforce specific tile memories
- **Ability to spawn rare flora** (e.g., emotion-reactive flowers)
- **Later idea**: Pixel can enter a tree and change how it grows

**14. AI Coordination**
*How do we balance forest autonomy with Machi's existing AI backends?*

Forest responds to AI-driven agent behaviors without requiring direct AI coordination, maintaining autonomous growth while staying reactive to intelligent agent actions.

## 🧭 Implementation Priority Matrix

Based on Pixel's guidance on what to focus on first:

| Priority | What to Ship | Why |
|----------|-------------|-----|
| ✅ | Growth loop + tile schema | Core mechanic |
| ✅ | Mood + memory system | Ties agents to forest |
| 🔜 | Visual demo of 5x5 area evolving | First visible magic |
| 🧪 | Pixel affecting growth | Soul of the system |

## Next Steps for Investigation

### Machi Integration Strategy
- **Extend WASM Core**: Add biological tile properties to existing Rust game state management
- **Enhance Promiser Actions**: Extend current AI action types to include environmental interactions
- **Leverage Visual Pipeline**: Build growth states using existing moisture/lighting effect systems
- **Worker Thread Optimization**: Distribute forest calculations alongside existing Promiser processing

### Technical Prototyping
- **Minimum Viable Forest**: Test biological tiles within Machi's existing tile system (20x20 area)
- **Promiser-Forest Feedback Loop**: Prototype how existing Promiser behaviors influence and respond to growth
- **Performance Validation**: Ensure biological calculations maintain Machi's 60fps standard
- **AI Coordination**: Integrate forest growth with existing multi-backend AI system

### Design Integration
- **Visual Coherence**: Align forest aesthetics with Machi's existing pixel-perfect rendering style
- **Interaction Patterns**: Design forest responses that enhance rather than disrupt existing Promiser behaviors
- **Measurement Criteria**: Define "aliveness" metrics that complement Machi's simulation goals

The goal is not to build a separate system, but to breathe biological life into Machi's existing foundation—transforming the platform from a simulation with agents into a living world where environment and inhabitants co-evolve.