# Phase 5.0

In Phase 4.x, we literally planted a seed.

```
#########
####@####
#########
```

We have moisture, light and heat layers to support.

The seed drops and embeds itself into the soil.

We now need to activate it.

We basically want the world to be full of giant trees.
For the tree though, do we perhaps need a more fidelity?

Let's start from the very basic and just have the tree cell be 1-unit tile.

When the moisture and heat is good, seed will hatch, and make the first tree cell.

We use seed's x%64 to be the tree's identifier.

First Tree Cell

```
is_shoot = true
is_root = true
is_node = false
```

When conditions are favorable, root will grow downward.
When conditions are favorable, shoot will grow upward.
We would alternate between two.

Root will grow towards favorable moisture & heat conditions.
Root will die if favorable heat conditions and moisture are not met.
Root will not grow over hard soils like rocks.

Shoot will grow upward until it gets direct sunlight. 

Leaves are meta tiles that doesn't have a tile alloted to them.
Leaf node cell will describe whether it has leaf or not.

```   
       @@
        |     @@
   @----\    /
    @    \  /__@@
          \/
           \
            |
```

To simulate the 3D lushness, we will create some more layers.

```
       /__________BG_NODES________/
      /___________NODES__________/
     /________FG_NODES__________/
```
FG and BG nodes can be instantiated and they are less likely 
to grow as the space is limited.

**How to simulate internode elongation:**

Internodes elongate. To simulate this, we send a signal to all downstream tiles to move up. 

that kinda serves as a force field that will move all of the downstream tiles up.

We will move up only when enough signals are received.

```
 ^  ^^  ^    ^       ^                        |
                                              stop waiting
```
Then the elongation happens.

Nodes that are more mature won't have this elongation.

**Shoot** also grows. 

## What does all this mean for the current Phase 5.0.

I think the first MVP is to have the seed become a shoot and root that just grows upwards and downwards each iteration.