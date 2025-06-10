# Phase 4

I don't have understanding of the code base. I need to understand. Let's get started.

There are some constants at top.
- WORLD_WIDTH
- WORLD_HEIGHT
- INITIAL_AGENT_COUNT
- GROUND_LEVEL
- WATER_CONSUMPTION_RATE
- NUTRIENT_CONSUMPTION_RATE
- MIN_WATER_FOR_GROWTH
- MIN_NUTRIANTS_FOR_GROWTH

Then there are `tiles` and `agents`.

Then there are some variables.

- lastTime
- frameCount
- lastFpsUpdate
- currentFps
- paused
- debugMode
- stats with avgMood, matureTiles, totalVisits

There is logging function that logs things.

Thoughts:
- [ ] logging function seems unnecessary. 
- [ ] Agents don't seem needed at this point.
- [ ] We can just drop one seed from the top.

## Code Study

### `init`

This initializes tiles, agents then start the animation loop.

### `setupEventListeners`

Handles clicks.

Thoughts:
- [ ] There probably is some issues with clicks. It doesn't transform the mouse pos to world position.

### `createTiles`

Now, it initializes tiles. If y is larger than or equal to the GROUND_LEVEL it creates soil tiles.

Tile is defined as:
- x
- y
- tileType
- solid
- climbable
- mood
- visits
- growth
- lastUpdate
- currentInfluence
- treeId
- trunkX
- water
- nutrients
- light
- fire_risk
- recovery_time

Thoughts:
- [ ] I think we should work with images.
- [ ] And use shaders to perform the simulation.
- [ ] We should craft a human-driven design document.
- [ ] solid vs not seems inferrable.
- [ ] mood not necessary.
- [ ] visits why?
- [ ] growth why?
- [ ] lastUpdate why?
- [ ] currentInfluence why?
- [ ] recovery_time why?

### `createAgents`

It creates agents with emotions.
- x, y, vx, vy
- emotion
- id
- energy
- age
- grounded
- climbing

### `gameLoop`
calls `update()` and `render()`

Thoughts:
- [ ] We should separate out rendering logic into separate file.

### `update`

#### `updateAgents`

It jumps like ticks. 

Thoughts:
- [ ] Not really sure, but doesn't seem necessary

#### `updateTileInfluence`

Tiles within radius of the agent will be impacted by the agents's happiness.

It also drops seeds to soil. 

There is also logic in here to drop things from branch.

Thoughts:
- [ ] Seems unnecessary at this point. This should be added later.
- [ ] Dropping seed from branch seems interesting but it should probably drop from fruits instead.
- [ ] Thinking we should do much higher resolution.

#### `updateTileGrowth`

If enough time has passed since `lastUpdate`, we check that we have good set of resource. 

When seedling dies, it turns to soil. 
- It has logic to sprout upward.
- And have the roots to go downward.
- Trunk grow upward.
- It also adds leaves at the top and side leaves.
- Branch probability increases with height.
- Roots mostly go downward. But it sometimes go side ways and diagonals.
- Once we grow, the water and nutrients decrease.
- There is `spreadToNeighbors` function call.
- There is also "death" where bunch of tree cells die when there aren't any resources.

Thoughts: 
- [ ] The `visits` seem unnecessary.
- [ ] When seedling dies, it turns to soil seems little too much of jump. Perhaps it should just be marked as dead.
- [ ] How do we make it so that leaves on the branch is visible. Leaves would occlude the branch. How do we represent that. Should leaves be on its own layer?
- [ ] How do we represent situations where two roots overlap, but may be in different plane. Should we really be doing this in 3 dimensions? Like have maybe 10 cell depth? That way branches can also be occluded by the leaves.
- [ ] Can we do this efficiently in a shader or pytorch such that this becomes much more efficient?
- [ ] There is also "death" where bunch of tree cells die when there aren't any resources. For trees, it shouldn't be death. It should be like a skin cell where it is dead but gets replenished on and on.

### `spreadToNeighbors`

This starts by sourceTile.

If it is a leaf or a branch, it has a horizontal bias.

it looks at 4 neighbors (8 neighbors with larger radius though). Then updates its mood.

Also, if the source tile has `growth` number larger than 1.5 and the source type is `leaf`, we give neighboring tile minor amount of nutrients.

Thoughts:
- [ ] It doesn't look like nutrients are getting delivered from root to leaf.

### `updateLightLevels`

This function effectively puts a light at the top of the map.
Then, it does single pass top to bottom to get vertical light contribution.
It then gives some level of ambient light.

Thoughts:
- [ ] Leaf blocks 80% light (why?) vs branch blocks 40% vs trunk blocks only 15%. 
- [ ] What is the deal here? Shouldn't truck block fully?

### `updateTileLight`

This seems like it isn't used anymore.

Thoughts:
- [ ] Let's remove this.

### `updateResourceDiffusion`

It creates a Float32Arrays of TILE_COUNT for water and nutrients.

Then for each root and soil, we calculate the resource flow by checking the water and nutrient gradients between itself and neighboring tiles. 

When applying changes, we do some funky magic that doesn't seem all that correct.

Thoughts: 
- [ ] We need mass/energy preserving transfers.

### `updateFireRisk`

Fire risk increases with negative mood and mature vegetation.

If fire_risk is high, it clears the tile.

Then reduces the risk over time.

### `clearTile`

This reset the tiles to cleared state (to soil). It also spread clearing. Not sure why. Perhaps it just tries to kill the whole plant since fire spreads.
This also sets recovery_time.

Thoughts:
- [ ] When we clear, I think there may be some issues in getNeighborIndices function that causes the whole area to be cleared. We need to look into that getNeighorIndicies to see if we are doing anything weird.
- [ ] What does recovery_time do?


### `getNeighborIndices`

It just does [-1, 1] on both axis and give use the indices. It will make sure the neighbor's index is within world bound then push the indexes. This seems reasonable.

Thoughts:
- [ ] This function looks fine. Perhaps there is another issue. Perhaps leaves are covering but isn't visible?
- [ ] If not, where are the leaves?

### `updateStatistics`

Just counts stuff. Honestly I could care less.

### `render` 

It scales the map. Then show linear gradient for the sky rendering.

#### `renderTiles`

It just fillsRect with tile color from `getTileColor`.

#### `getTileColor` 

When in debug mode, it gets treeId and uses hash to color things differently. Honestly looks buggy.

For air, we show transparent.
For soil, we should based on depth and nutrients.
For root, we show some based on its "mood."
For trunk, we show more brown when tree matures (`growth`).
For branch, we show some colors. Not really sure if they have much meaning.
For leaf, we use water, nutrients and light to color them green and add redComponent when it matures.

#### `renderAgents`

It does its things. I don't care.

#### `renderDebugInfo`

IT does its thing.

#### `updateUI`

Updates FPS, and other values.

### `togglePause`

What it says.

### `resetWorld`

What it says.

### `addRandomAgent`

Not needed.

### `takeScreenshot`

Doesn't seem necessary.

### `exportState`

Not needed.

### `DOMContentLoaded`

It sets things up.


## Next Steps

We just summarized what is going on in the codebase. 

I realize that we need something more like `Promiser` which barely had any lines of code but was able to produce amazing emergence behaviors.

We need something like that. Now that we have good understanding of how we should model something like this, let's go back to the drawing board and create the ruleset in which these tiles can follow.

## Core Mechanics v1

- Life grows from single cell.
- Life needs water.
- Life needs nutrients.
- Plant need sun light.
- Plant have three components: seed, root, trunk, branch, leaves, fruits.
- Life needs mechanism to be cleared out.

## Core Mechanics v2

- [ ] Initially there is a seed.
- [ ] A seed drops into the soil.
- [ ] If conditions are right, it will crack open.
- [ ] There will be top-end (plumule, shoot system) and bottom-end (radicle, root system).
- [ ] Plumule is embryonic shoot. It includes tiny leaves and shoot apex.
- [ ] As it grows , it becomes the stem and leaves, driven by the apical meristem (a region of active cell division).
- [ ] This shoot system branches over time forming new buds.
- [ ] The top of the tree pointy end is called Shoot Apical Meristem.
- [ ] It is cluster of actively dividing cells at that very tip of growing shoot.
- [ ] This is the tip of the spear for vertical growth.
- [ ] Initially there is one primary SAM.
- [ ] Later lateral/axillary buds can activate and become their own SAMs.
- [ ] These can grow branches, while each have their own SAM at the tip.
- [ ] To activate a branch, "a bud (usually an axillary bud) must activate."
- [ ] Buds are pre-installed on the step at each node.
- [ ] By default: Dormant due to apical dominance (main shoot suppresses them via auxin hormone).
- [ ] New SAMs activate when the top SAM is weakened. Main SAM removed. Matures or Reduced Auxin flowing down.
- [ ] Auxin Gradient isn't binary. Auxin decreases gradually with distance and time.
- [ ] Lower buds tends to activate first, higher ones hesitate.
- [ ] Cytokinins promote bud growth.
- [ ] Strigolactones inhibit bud growth.
- [ ] Newly activated SAM is greedy.
- [ ] It soaks up water, nutrients, light. Starving nearby buds.
- [ ] It creates natural spacing and hierarchy.
- [ ] Once bud activates, it also starts producing auxin.
- [ ] There is such thing as "node".
- [ ] Node is the part of a plant stem where leaves grow, buds are located. Branches emerge. Flowers or fruits can form.
- [ ] Then there is "Internode" which is cable between ports.
- [ ] Tree thickens via "vascular cambium."
- [ ] A layer of actively dividing cell just under the bark.
- [ ] It adds Xylem (wood) inward
- [ ] Phloem (bark) outward.
- [ ] Center of the tree is dead tissue. It just provides structural support.
- [ ] Heartwood doesn't transport water or nutrients anymore. It is dead inside.
- [ ] It's filled with Resins, Tannins and other compounds that prevent it from rotting. Imagine bone.
- [ ] On the contrary, Sapwood (outer Xylem) is alive. Conducts water. Transports minerals, not suger (sugar uses phloem)
- [ ] Light color.
- [ ] Phloem transports sugars (products of photosynthesis).
- [ ] Goes down and up the tree depending on the needs.

## Some additional thoughts from Jin

- [ ] We need directional bias in gradients and transports.
- [ ] We need a way to implement negative pressure in vessles.
- [ ] Transpiration and cohesion + adhesion.
- [ ] Water in trees can be under -1 to -3MPa.

