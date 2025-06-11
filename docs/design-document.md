After re-bootstrapping [SOUP codebase](https://github.com/kndlt/soup) from JavaScript into PyTorch in the last phase, it's time to get our hands dirty—literally. We're building a **voxelized terrarium**: a tiny world of air, soil, and water that lives and breathes in tensors.

## Goal

Implement `setup_world()` in [`main.py`](http://main.py).

We’re simulating a **sealed terrarium**—a glass ecosystem where light enters, water cycles, and life thrives. These environments are famous for sustaining themselves with minimal input, thanks to the closed loop of evaporation, condensation, and photosynthesis.

We want to replicate this behavior inside a voxel grid.

## First Step: Create the World

We're going with a `DxHxW` grid, where:

* D = Depth (4)
    
* H = Height (32)
    
* W = Width (64)
    

```plaintext
        ──────────────────── 
      ╱                    ╱│
     ╱                    ╱ │ 32
     ────────────────────   │
    │                    │  │
    │                    │   
    │                    │ ╱ 
    │                    │╱  4
     ────────────────────    
             64
```

## Voxel Representation Options

We debated a few approaches:

* **Atomic Numbers** — pure science, but overkill
    
* **Tile Type Enums** — classic and simple
    
* **Probabilistic Channels** — elegant, scalable, maybe overengineered for now
    

We're going with **Option 2: Tile Type One-Hot Channels**, keeping things simple and PyTorch-friendly.

### Basic Tile Types:

```plaintext
0 - Air
1 - Water
2 - Soil
```

## Life in a Tile

Grass, moss, and small plants will decorate **the top of soil tiles**, without owning the whole voxel.

Big trees? That’s the soul of SOUP (Super Organism Upbringing Project).

### Tree-Specific Tiles:

```plaintext
3 - Tree Cell
4 - Leaf Cluster
```

We *could* differentiate between shoots, roots, and saplings, but early on we’ll keep it unified. Environmental context will define their behavior:

* Surrounded by dirt? It’s root.
    
* Alone? Seedling.
    
* Green on top? That’s leaves, baby.
    

To prevent tree-merging chaos, we’ll use an ID channel to encode a unique **tree identifier** (cycled from 0 to 255).

## Tensor Structure

We'll represent the entire world as a **8x4x32x64** tensor:

| Channel | Meaning | Range |
| --- | --- | --- |
| 0 | Air amount | 0–1 |
| 1 | Water amount | 0–1 |
| 2 | Soil amount | 0–1 |
| 3 | Tree cell presence | 0–1 |
| 4 | Leaf cluster presence | 0–1 |
| 5 | Tree ID / Identifier | 0–1 |
| 6 | Mineral concentration | 0–1 |
| 7 | Sugar (post-photosynthesis) | 0–1 |

Just **65k floats**—small enough to be snappy, rich enough to grow a whole biome.

## Initialization Plan

* Channels \[0–2\] — randomly filled (to simulate initial air/water/soil distribution)
    
* Channels \[3–4\] — zeroed (no trees yet)
    
* Channels \[5–6\] — random values in \[0, 1\] (unique identifiers + minerals)
    
* Channel \[7\] — zero (no sugar until the sun hits)
    

### What Happens Next?

Gravity! Not with for-loops—we're going **convolutional**.

For example, if two stacked tiles each contain 0.5 water, in one pass the lower one should accumulate all 1.0, and the top one turns into air. That’s the behavior we want: emergent, not hardcoded.

---

## Next Steps

I gotta go pick up my kid (real-world priority &gt; voxel trees).  
But when I’m back, the mission is clear:

> **Figure out how to apply settling forces in PyTorch using convolutions—no for-loops allowed.**

Stay tuned. The forest is just beginning to wake up.

— @[Sprited Dev](@sprited) 🌿  


---



Yesterday, we started a [design document](https://blog.sprited.app/dev-log-soup-building-a-voxel-terrarium-with-pytorch) for SOUP’s pytorch implementation.

Before we start implementing any of this, I want to understand the feasibility of simulating the terrarium environment using GPU—particularly using convolutions.

## Setup Recap

We will have following terrarium represented using tensor of **CxDxHxW** tensor.

```plaintext
        ──────────────────── 
      ╱                    ╱│
     ╱                    ╱ │ 32
     ────────────────────   │
    │                    │  │
    │                    │   
    │                    │ ╱ 
    │                    │╱  4
     ────────────────────    
             64
```

Channels will encode different informations

| **Channel** | **Meaning** | **Range** |
| --- | --- | --- |
| 0 | Air amount | 0–1 |
| 1 | Water amount | 0–1 |
| 2 | Soil amount | 0–1 |
| 3 | Tree cell presence | 0–1 |
| 4 | Leaf cluster presence | 0–1 |
| 5 | Tree ID / Identifier | 0–1 |
| 6 | Mineral concentration | 0–1 |
| 7 | Sugar (post-photosynthesis) | 0–1 |

We plan to use convolutions to (1) simulate gravity, (2) water dynamics and (3) plant growth.

## Simplification 3D → 2D

To keep things simple (and sane), we're starting in 2D. We'll **skip the Depth (D) axis** for now and treat our world as a vertical slice of the terrarium.

That means our tensor shape will be **C x H x W**—where `C` is the number of channels (air, water, soil, etc.), and `H x W` is the height and width of our 2D world.

This lets us iterate faster, visualize easily, and nail down the simulation mechanics before scaling into full 3D.

## Gravity Proposal

**Scenario**: A chunk of soil floats mid-air. We want it to "fall" to the bottom of the terrarium if there's empty space below.

```plaintext
┌────────────┐
│     ░░     │  <- voxel w/ soil (channel 2 = 1)
│            │
│            │
└────────────┘
```

To simulate this, we don’t really have to use convolutions for the time being, although using convolutions would give us more flexibility and control.

```plaintext
soil = tensor[:, 2:3, :, :]  # shape: 1 x H x W
air = tensor[:, 0:1, :, :]
can_fall = air[:, :, 1:, :] > 0.9  # check if tile *below* is air
soil_shifted = F.pad(soil[:, :, :-1, :], pad=(0, 0, 1, 0))  # move soil down
delta = (soil - soil_shifted) * can_fall.float()
tensor[:, 2, :, :] -= delta[:, 0]
tensor[:, 2, 1:, :] += delta[:, 0, :-1, :]
```

## Water Dynamics

Now that we’ve got basic gravity working, it’s time to give water its proper fluidity. Water falls just like soil—but unlike soil, it also spreads sideways when blocked from falling. This gives it the juicy, flowing behavior we expect in a living terrarium.

Water wants to:

* **Fall downward** if air if possible
    
* **Spread sideways** into air if stuck
    
* **Conserve mass**—what flows out must go somewhere
    

We’ll implement this in two phases:

* A gravity pass (same logic as soil)
    
* A horizontal spread pass (unique to water)
    

Once gravity has pulled everything down, we simulate sideways movement:

```plaintext
dev apply_lateral_flow(tensor, channel_idx, air_channel=0):
    water = ...
    air = ...
    water_left = ...
    water_right = ...
    delta_lr = 0.5 * (water_left + water_right - 2 * water)
    air_left = ...
    air_right = ...
    flow_left = ...
    flow_right = ...
    tensor[:, channel_idx, :, :-1] += flow_left[:, 0]
    tensor[:, channel_idx, :, 1:] += flow_right[:, 0]
    tensor[:, channel_idx, :, :] -= (flow_left[:, 0] + flow_right[:, 0])
```

## Plant Growth

With soil falling and water flowing, it’s time to grow something. In our simulation, plants will grow as cellular automata, using simple local rules applied over a 2d grid.

For now, we’ll keep it minimal: trees, consisting of tree cells and leaf clusters, with logic driven by neighboring tiles and environmental conditions.

Each tree cell will check its surroundings and decide what to do based on:

* What’s nearby (soil, air, other tree cells)
    
* Whether it has access to water and minerals
    
* Whether it’s exposed to light (air above)
    
* Its internal state (e.g. is it a seedling?)
    

### Tile Types Involved

| Channel | Tile Type | Description |
| --- | --- | --- |
| 3 | Tree Cell | Trunk, branches, and roots |
| 4 | Leaf Cluster | Photosynthetic structures |
| 6 | Mineral Content | Drawn up from the soil |
| 7 | Sugar | Produced by leaves and stored in tree |

We'll start with **seed expansion** and **basic shoot/root behavior**, then build toward full nutrient cycling and intelligent trees.

```python
def grow_tree(tensor):
    tree_cells = tensor[:, 3:4, :, :]
    soil       = tensor[:, 2:3, :, :]
    air        = tensor[:, 0:1, :, :]
    water      = tensor[:, 1:2, :, :]
    minerals   = tensor[:, 6:7, :, :]
    sugar      = tensor[:, 7:8, :, :]

    # Detect where there is already a tree cell
    presence_kernel = torch.ones((1, 1, 3, 3), device=tensor.device)
    presence_kernel[0, 0, 1, 1] = 0  # exclude center

    # Count neighboring tree cells
    neighbors = F.conv2d(tree_cells, presence_kernel, padding=1)

    # Growth targets: air or soil, near existing tree cells
    grow_target = ((air + soil) > 0.9) & (neighbors > 0)

    # Optional: only grow if there's water or mineral nearby
    hydrated = F.max_pool2d(water, 3, stride=1, padding=1) > 0.1
    mineralized = F.max_pool2d(minerals, 3, stride=1, padding=1) > 0.1

    growth_mask = grow_target & (hydrated | mineralized)

    # Add tree cells where growth happens
    tensor[:, 3:4, :, :] = torch.where(growth_mask, 1.0, tensor[:, 3:4, :, :])
```

### GPU Parallel Processing

Every update step in our simulation — whether it’s soil settling, water flowing, or trees growing — is implemented as a **batched tensor operation**. This means it’s inherently parallelizable and runs efficiently on the **GPU**, without requiring any explicit loops.

#### Why this matters:

* No CPU bottlenecks
    
* No nested `for` loops crawling over your world
    
* Every update step applies to the entire world *at once*
    
* You can simulate large, complex ecosystems in real time
    

### Generalization to 3D

While we’re prototyping in 2D for sanity, everything is designed to scale to **3D**. The underlying logic doesn’t change—just the dimensionality of the tensors and kernels.

* The world becomes: `C x D x H x W` (Channels × Depth × Height × Width)
    
* We swap `F.conv2d` with `F.conv3d`, `F.max_pool2d` with `F.max_pool3d`
    
* Kernels go from 2D shapes like `(3, 3)` to 3D shapes like `(3, 3, 3)`
    
* Padding is updated from 2D to 3D:
    
    ```python
    # 2D: pad=(left, right, top, bottom)
    # 3D: pad=(left, right, top, bottom, front, back)
    ```
    

All material behaviors—gravity, lateral spread, plant growth—extend naturally into 3D. It’s just a bigger, chunkier grid.

#### Example:

```python
# 2D
neighbors = F.conv2d(tree_cells, kernel_2d, padding=1)

# 3D
neighbors = F.conv3d(tree_cells, kernel_3d, padding=1)
```

Once the rules are tested and tuned in 2D, we’ll transition to 3D with minimal changes. That’s when this simulation starts to feel like a **living voxel world**.