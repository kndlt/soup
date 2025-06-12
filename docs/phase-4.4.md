# Phase 4.4

Bunch of test cases

**Legands**:
- So: Soil
- Wa: Water
- Li: Light

## Case 1: Isolated tile

Isolated tile should not not change its property.

## Case 2: Soil Gravity
```
|  |So|  |    <-- stable since supported by at least 2.
|So|  |So|
```
```
|  |So|  | -> |  |  |  |
|  |  |So|    |So|  |So|
```
```
|  |So|  | -> |  |So|  |
|  |So|  |    |  |So|  |
```
```
|  |So|  | -> |  |  |  |
|  |  |  |    |  |So|  |
```
```
|  |So|So| -> |  |  |  |
|  |  |  |    |So|  |So|
```
```
|  |  |  |    |  |  |  |
|So|So|So| -> |So|So|So|
|So|So|So|    |So|So|So|
```
Compacted ones stay as is (for now)...

## Case 3: Water Gravity

Water cannot be compacted.

```
|  |Wa|  |    <-- stable since supported by at least 2.
|Wa|  |Wa|
```
```
|  |Wa|  | -> |  |  |  |
|  |  |  |    |  |Wa|  |
```
```
|  |  |  |    |  |Wa|  |
|Wa|Wa|Wa| -> |Wa|  |Wa|
|Wa|Wa|Wa|    |Wa|Wa|Wa|
```
Simulate in a checker board mask. Don't simulate all at once.

Simulations are done at 4x4 sub-tiles of a tile.

Now, what do we do here? We can't go back, and we don't have internet, so we just have to proceed with what we have so far.

## Air Physics

We will not think about air physics. We will only have Water and Soil. And assume air to be abundant.

## Light Physics

Light will be tracked as separate layer. They will be constantly created at the top, and will disappear when it hits stuff. When it hits stuff, they will be translated to heat which is going to be yet another layer.

```
|  |  |  |    |  |  |  |
|  |Li|  | -> |  |  |  |
|  |  |  |    |  |Li|  |
```
Ideally, we will need directional light. However, we first consider light to always be coming downward direction, as if they were just like any other substance.
```
|  |Li|  | -> |  |  |  |
|  |So|  |    |  |So|  |
```
They get absolved, then we update the heat map.

Now, we have water, light, and soil.

Finally, we can go ahead and build our plants.

## Seed Physics
Seed drops similar fashion to grain
```
|  |Se|  | -> |  |  |  |
|  |  |  |    |  |Se|  |
```
```
|  |Se|  | -> |  |  |  |
|So|  |So|    |So|Se|So|
```
```
|So|Se|So| -> |So|  |So|
|So|  |So|    |So|Se|So|
```
```
|So|Se|So| -> |So|  |So|
|  |So|  |    |  |So|Se|    <--- falls through (embedding)
```
```
|So|Se|So| -> |So|Se|So|    <--- water moves in (seeping)
|Wa|So|Wa|    |  |So|  |
```
How does seed know when is the right time to hatch?

It will use the heat map to see if the temperature is **favorable**. Then hatch. If it is too hot, it will slowly wiggle way into the soil downwards (or wherever there is less heat).

It needs to start at cool location with enough water resource.

Once it hatches, it will create a shoot, a root, a heart wood, and pair of Barks.

```
|Wa|So|Wa|    |Wa|Sh|Wa|
|So|Se|So| -> |Ba|Hw|Ba|
|Wa|So|Wa|    |Wa|Ro|Wa|
```
They will all share an `id` a randomly assigned integer that identifies itself as one entity.

## Shoot Physics

Shoot grows upward by moving itself upwards and creating heart wood and barks.
```
|So|  |So|    |So|  |So|    |So|Sh|So|
|  |So|  | -> |  |Sh|  | -> |Ba|Hw|Ba|
|Ba|Se|Ba|    |Ba|Se|Ba|    |Ba|Hw|Ba|
```

And, when it meets light, it will create leaves.
```
|  |  |  |    |Le|  |Le|
|  |Sh|  | -> |  |Sh|  |
|Ba|Hw|Ba|    |Ba|Hw|Ba|
```

When shoot moves, it needs to be able to carry all the leaves with it.

Leaves will also move alongside it's adjacent shoot.

```
|  |  |  |    |Le|  |Le|
|Le|Sh|Le| -> |  |Sh|  |
|Ba|Hw|Ba|    |Ba|Hw|Ba|
```

## Root Physics

Root grows down. It leaves behind Outer Root and Heart Root.
```
|Ba|Hw|Ba|    |Ba|Hw|Ba|
|So|Ro|So| -> |Or|Hr|Or|
|Wa|So|Wa|    |Wa|Ro|Wa|
```
It also leaves root branching points in some random interval.
```
|Or|Hr|Or|    |Or|Hr|Or|
|So|Ro|So| -> |Or|Hr|Rb|
|Wa|So|Wa|    |Wa|Ro|Wa|
```
These Root branchign points are not activated immediately.
Roots will spread the suppressor (separate layer) making sure they don't.

Root branching points will however activate when suppressor becomes smaller.

```
|Hr|Or|So|    |Hr|Or|So|
|Hr|Rb|Wa| -> |Hr|Hr|Ro|
|Hr|Or|So|    |Hr|Or|So|
```
It will be then a new root.

Roots only can grow if they get all the conditions met.
- Water
- Soil
- Sugar

## Branching of shoots

Shoots also follow similar pattern to branch. The Branch points will be a lot fewer.

In the case of branch points, there is a potential for it turning into leaves cell as well.

## How to make sure branches don't fall when attached to the tree.

We will have a layer called "support" mask. 
As tree grows, it will mark entries in support mask.
And soils will basically disperse support-lings one tile at a time.
They will eventually reach all of the connected components.

If leave or branch is cut, it will no longer receive the support-lings. 
And they will fall.

## How would it look like at the end?

```

        @ @
         ^
        |x|
        |x|--@
        |xxxx>
        |x|--
--------|X|----------
        |X|
         *

```

## Anatomy of leaves

There can be a large single piece leave like the one you see here.
```


       **********
    ***************
  **               **
**                   *
```

In reality though, looking at it from far away, individual leaves are not visible.
```
  #  #    #
 #B##B####B###
#BBBBTBBBBBBBB#
 ####T####B###
_____T____
     R
   RRRRR
   R R R
```

Also, in 2D simulation world, leaves can overlap with the tree trunks and branches.

So, we propose that leaves have separate layer.

## Leaf Growth

Leaf cells will be able to spread. To prevent it from covering too much, they will drain the water supply. So, leaves will only grow if there is excess water supply and light. 

## Photo Synthesis

Leaves absorb some level of light, and produces sugar.

Sugar is then dispersed in a sugar level layer throughout the tree.

It moves towards the root.

## Sugar Transport

Sugar needs to be transported to root to make more root cells.

Random jacobian movement of sugar won't be enough to give priority access to 
sugar to roots and shoots.

So, we will need a mechanism to make sugar move towards those points of interests.

We can use the Sugar layer to make sugar move towards less saturated area.

I wonder that's going to be enough though. If need be, we need some sort of
"sugar pull gradient map" where the nodes that have high needs of sugar (e.g. shoot and root) will create a gradient of pull map. Then have sugar move towards there.

Similar layers like Water-pull and Mineral-pull will be needed.

## Summarization so far

Let's summarize. We have following layers.

1. Water Layer
2. Soil Layer
3. Light Layer
4. Heat Layer
5. Tree Layer
6. Leaf Layer
7. Support Layer
8. Mineral Layer
9. Sugar Layer
10. Sugar Pull Layer
11. Water Pull Layer
12. Mineral Pull Layer

## Note about porous design

- [ ] I like how soil has pores but not able to justify the need for this design.

## What programming language to use for this simulation?

SOUP is a prototype and not a production grade software.

I want ability to quickly tweak rules and see things in action.

At the same time, I want to know if this simulation can be massively parallelized using GPUs.

Rather, I want to make a simulation system which can be ran efficiently on the server. Whether it uses GPU is secondary to this.

The simulation also does not need to be fast. Picture Minecraft running at 120fps, but its water simulation runs in around 2fps. So, they don't need to be that fast.

In that sense, I don't want to spend too much time on the nitty gritty details.

But, since we switched to PyTorch already, let's try here first.

## Strategies for Programming

I've noticed that coding agents are not great when it comes to doing something that's rarely done.

It is able to immediate and interpolate between things it has had in its training data.

However, I notice that it is not really good at creating new approaches like this one.

One hybrid approach would be that I write set of tests and have coding agent solve it somehow.

But it gets stuck way to much and eventually, I have to look into it to fix it correctly.

So, in this project, I will not use AI coding agents.

We will also not use any references. 

We have already studied enough materials to make this happen, and more data will only drain more time.

Let's isolate myself and work on this.

## Pseudo Code
```
WATER, SOIL          = 0, 1       # Basic elements
LIGHT, HEAT          = 2, 3       # Light and heat map
TREE, LEAF, ID       = 4, 5, 6    # Tree
SUPPORT              = 7          # Support Map
MINERAL, SUGAR       = 8, 9       # Mineral and Sugar
PULL_W_X, PULL_W_Y   = 10, 11     # Water Pull
PULL_M_X, PULL_M_Y   = 12, 13     # Mineral Pull
PULL_S_X, PULL_S_Y   = 13, 14     # Sugar Pull

class Chamber:
    def __init__(self, width=16, height=16, device="cpu"):
        self.width, self.height = width, height
        self.tiles = torch.zeros(15, height, width, device=device)
        self.tiles[SOIL, 0, w // 2] = 1.0 # drop of soil
        self.tick = 0
    @torch.no_grad()
    def step(self):
        is_soil = self.tiles[SOIL]
        is_occupied = is_soil
        has_empty_space_below = !shift(is_occupied, dy=-1)
        old_soil_locations = is_soil and has_empty_space_below
        new_soil_locations = shift(has_empty_space_below, dy=1)
        is_soil = is_soil - old_soil_locations + new_soil_locations
        self.tiles[SOIL] = is_soil
    ...

def shift(tensor, dy=0, dx=0):
    """Return tensor shifted by (dy,dx) with zero padding (no wrap)."""
    pad = (max(dx,0), max(-dx,0), max(dy,0), max(-dy,0))  # L R T B
    tensor = F.pad(tensor, pad)
    H, W = self.height, self.width
    return tensor[max(-dy,0):H+max(-dy,0), max(-dx,0):W+max(-dx,0)]
```
