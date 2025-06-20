# Phase 5.1

In Phase 5.0, we tried to move the needle by creating MVP of 
tree cells that simply have two components.

- Root that goes straight down.
- Shoot that goes straight up.

But, I want to go back to drawing board and breakdown the problem into sub problems first.

Root and Shoot behave differently. Roots spread wide, and shoots are more depth first.

So, we will create two layers.

## `ROOT` and `SHOOT` layers.

These layers will contain Root cells and shoot cells. 

Our initial plan was to bit pack them into one layer 
but I want to expedite the development by simplification.

## Root system
```
#########
####R####
#########
```
Root's job is to resource/regulate water supply.
When there is excess water on the tree, it secret water.
When there is shortage of water, it seeps water.

Let's build an ideal image of our root system
```
                                     
               RR   
      RRRRRRRRRRRRRRRRRRRRR
    RR     RR  RR  RR      RR            
  RR     RR    RR  RR        RR
       RR      RR    RR      RR
     RR        RR      RR      RR
               RR
               RR
```

**"Ground Rules"**

First, roots spread out. It almost appears that it has sense of direction to branch outward. 

- [ ] We should find ways to simulate this behavior.

Option 1: Having tree-seed position and growing outwards.
Option 2: Root create gradient that prevents collision.

By default roots like to dig deep, but when there is a gradient on the ground, this changes. So the root grow side ways to make more space.

To simulate this, we will probably need another layer called "Root gradient"

**How to simulate wiggly behavior of roots**

Roots are crooked intentionally to maximize the surface area.

```
#######  ########
#####    ########
#####  ##########
#####      ######
#########  ######
```
To simulate this we can use a "soil noise gradient."

**How to simulate branching**

Any root cell can branch. 
Active roots will release supressor so they don't branch out.
However when that weakens new branch is activated at a low chance.

---

The complexity we are building up is non-trivial.

Is there any solution that will allow me to use simple 0-1 float
that follows simple rules that will behave "like" a tree.

It doesn't have to be exactly like tree.

At scale, root just want to utilize the ground as effectively as possible.

So, we could simplify the problem to a root-gradient that basically covers some area below the trunk.

Instead of simulating branching-level logic, we simulate the overall volume.

Then, high fidelity drawings of the volume can be done in a determinsitic way.

Just like for water, we don't individually model the waves.

Let's dwell on it, and come back to it.

## Shoot System

We first need to draw out an ideal shoot system.

```
[  ][  ][  ][  ][  ][  ][  ][  ][  ][  ][  ][  ]
[  ][  ][  ][  ][  ][01][  ][  ][  ][  ][  ][  ]
[  ][  ][  ][01][02][02][02][  ][  ][  ][  ][  ]
[  ][  ][02][02][02][03][03][02][03][  ][  ][  ]
[  ][01][01][02][03][03][03][03][03][03][  ][  ]
[  ][  ][  ][  ][  ][  ][01][  ][  ][  ][  ][  ]
[  ][  ][  ][  ][  ][  ][01][  ][  ][  ][  ][  ]
[  ][  ][  ][  ][  ][01][01][  ][  ][  ][  ][  ]
[  ][  ][  ][  ][  ][01][  ][  ][  ][  ][  ][  ]
[  ][  ][  ][  ][  ][01][  ][  ][  ][  ][  ][  ]
[  ][  ][  ][  ][01][01][  ][  ][  ][  ][  ][  ]
```

This is one example, but I want something that's bigger.

```
   ####    #############
     ####  #############        ##  ####
       #################        ######
         ###############        ##           ######
           #############      #################
           #############    ####       ##
           ###################           ##
           #################               
           #############
           #############
```

```
   ####    #####################      @@  @@      @@
     ####  #####################        ##    ====
       #########################        ======    @@             @@
         ###########    ########        ##                   ======@@
           #########    ########[]    =========================
           #########    ########[]  ====       ##
           ===========================           ##@@
           #########################           @@    
           #####################
           #####################
           #####################   ('')
           #####################  /(  )\
```

One thing that surfaces here is "walkability"

Tree world needs to be walkable, and the agents need to be able to dig it to make a home.

We also need platforms, those platforms can be installed later, but since branches are walkable as well. We would need some way to make it so that branch platforms are generated automatically.

The trunk is always behind the user's walkable layer.

Branches become platforms.

So far, here is the layer system that can be thought of.

```
  /________________BG___________________/
      /________SHRUB______________/
       /________BACK_WALL_____/
      /_INTERIOR_FURNISHING__/
     /_____INTERIOR_WALK____/        <- interior platforms
    /_____FRONT_WALL_______/         <- tree trunks
/_______USER_WALKABLE_________/      <- platforms
```

Basically, characters have ways to walk into a building (ft. doors).

We need some visuals to go with it though.

---

We've got some concept arts started with Midjourney.

What I understand so far is that Midjourney can produce some stunning
well composed 2D platform scenes. 

There is yet a solution for providing semantic tiles as input but 
that should be possible. So, the plan still is to create semantic tiles.

Growing of the trees probably not necessary because trees doesn't appear to grow from the perspective of mere mortal.

We do need semantic tiles such that agents can dig a nest inside the tree.

Trees themselves by default are not platforms that cna be walked on.

They are more or less "buildings" that are nature built instead of agent built.
```
   ####    #####################      @@  @@      @@
     ####  #####################        ##    ====
       #########################        ======    @@             @@
         ###########    ########        ##                   ======@@
           #########    ########[]    =========================
           #########    ########[]  ====       ##
           ===========================           ##@@
           #########################           @@    
           #####################
           #####################
           #####################   ('')
           #####################  /(  )\
```
These tree surfaces however does provide anchoring point.

Agents can place platforms (`=`) on anchoring tiles.

---

**Now, back to how do we build these tree tiles?**

**1. Sense of direction**

First of all, tree tiles have this sense of direction.
It mostly goes upwards but usually for best composition 
trees have arching shape. We want to have some level of 
control on this sense of direction and the arc.

Normally, trees spiralling gives different vibe than
just straight ones which has a style of its own.

**2. Parallax**

Normally, there are multitude of layers to describe the 
lushness of a forest. Each layer has less saturation, but
it makes all the differences.

**3. Large Trees & Small Vegetation**

On top of large trees, most of the concept arts have 
vegetation growing on top of the tree trunks.

Either these vegetation should be part of semantics or 
just visual decors.

**4. Trunks that touch the ground is always larger**

We really need the trunk to be larger towards the bottom.

**5. Drooping**

There is always some drooping on tree branches.

