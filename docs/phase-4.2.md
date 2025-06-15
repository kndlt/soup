# Phase 4.2

In previous phase, we re-bootstrapped the repo from JS repo into pytorch repo.

Now, I want to implement `setup_world` function in `main.py`.

We are going to be basically building voxelized version of a [Terrarium](https://en.wikipedia.org/wiki/Terrarium).

Terrarium is a glass container containing soil and plants in an environment different from the surroundings. It is usually a sealable container that can be opened for maintenance or to access the plants inside; however, terraria can also be open to the atmosphere. Terraria are often kept as ornamental items.

A closed terrarium's transparent walls allow heat and light to enter, creating a very favorable environment for plant growth. Heat entering the sealed container allows the creation of small water cycle due to evaporating moisture from the soil and plants. The water vapor then condenses onto the walls of the container, eventually falling back onto the plants and soil below. Light passing through the transparent walls allows photosynthesis.

First task is to create voxel world with DxHxW dimensions.

For the first round, we will make a terrarium of 4x32x64.

```
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

## How is each voxel represented?


```
       ───
     ╱   ╱│
     ───  
    │   │╱
     ─── 
```

We have some options. 

**Option 1**: Atomic numbers

We could represent using atomic numbers.
```
Hydrogen - 1
Helium - 2
Li - 3
```
and so on. Then representing water would be 2 Hs and 1 Os. In the engine, we can interpret this and produce the right tile rendering.

**Option 2**: Tile Type

We could just represent them as distinct tile enums.
```
0 - Empty
1 - Air
2 - Water
3 - Steam
4 - Soil
```
**Option 3**: Probabilities
```
p(type=0) = p(Empty)
p(type=1) = p(Air)
p(type=3) = p(Water)
```
We will have as many channels as the number of tile types.

---

Wouldn't it be super cool, if the world mimic'd the behavior of the real world? That is, even the chemical reactions happens using the rules of the physical world, rather than just predefined sets.

On the contrary, we are scope creeping, and probably best to stay grounded.

Let's use one-hot encoding of Tile Types for simplicity.

## What are some tile types

Here are the most basic elements that are needed in a terrarium. Imagine you have to get started with a terrarium on a limited budget. This is what you would feel it with.
```
0 - Air
1 - Water
2 - Soil
```

## How do we represent grass.

Grass and moss will just show up on top of soil without taking up the whole tile space.

## How do we represent small trees and plants.

Same as grass.

## How do we represent giant trees.

SOUP's main selling point is giant trees that's truly alive and simulated.

So, we will have trees be cellular automata using the tile system.

The tiles are going to be too big to give enough fidelity, so we when rendering, we probably will use some sort of AI super sampling mechanism. But that's for later.

## Giant Tree Tiles

I think tree cell would be a tile type on its own.

```
3 - Tree Cell
```

**Why not add different tree cell types?** 

For example, we have have "shoot" and "root" as separate types. 

While I like the idea, perhaps we don't need to be that specific. If tree cell is surrounded by dirts, we can just say it is root.

If tree cell is completely alone, we can consider it as seedling. 

Leaves however are different beast. They are green and they behave quite differently from the rest of the tree.

So, we will present leaves as separate entity.

```
4 - Leaf Cluster
```

**How to make sure trees don't grow on top of each other?**

We will use a channel to encode a tree id (increasing number). We will cycle through 0/255 through 255/255.

## How should we setup the world?

Let's initialize a tensor of CxDxHxW where C stands for number of channels. 

```
0 - Air Amount (0-1)
1 - Water Amount (0-1)
2 - Soil Amount (0-1)
3 - Tree Cell Amount (0-1)  - Cell amount
4 - Tree Leave Amount (0-1) - Amount of leaves.
5 - Identifier (0-1)        - Prevents trees merging.
6 - Minerals (0-1)          - Minerals go upwards from roots.
7 - Sugar (0-1)             - After photosynthesis sugars are formed.
```

Thought is that this should be enough to represent the terrarium world.

So, we will have 8x4x32x64 tensor (65k floats).

For initialization, we will do:

- Randomly assign numbers in each block [0-2].
- [3-4] is zeros.
- [5,6] is initialized to be random number between [0-1].
- [7] is initialized to be zero.

Once the tiles are initialized. We will have them settle towards bottom the bottom.

If there is a tile stacked with 0.5 water each, then after one iteration bottom one would likely have 1.0 water and top one will have none and just have air.

---

**Next Steps**: Have to go pickup my kid. Next step is to figure out how to apply forces to make the tiles settle using pytorch without doing those for loops. I'm thinking we can use convolutions for this.