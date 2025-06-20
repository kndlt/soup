from random import random
import random as pyrandom
import torch

from .utils import shift_2d_tensor, sum_2d_below
from .constants import EPSILON, HEAT, LIGHT, ROOT, SEED, SOIL, N_CHANNELS, WATER, MOISTURE

class Chamber:
    def __init__(self, width, height, tiles=None, device=None):
        self.width, self.height = width, height
        if tiles is None:
            self.tiles = torch.zeros(N_CHANNELS, height, width, device=device)
        else:
            assert tiles.shape == (N_CHANNELS, height, width)
            self.tiles = tiles
    @torch.no_grad()
    def step(self):
        """
        Perform a single step of the chamber simulation, updating the soil positions.
        """
        self.simulate_soil()        # Soil falls down
        self.simulate_water()       # Water falls down
        self.simulate_absorption()  # Water gets absorbed
        self.simulate_light()       # Light comes down and heats things up
        self.simulate_heat()        # Heat disperses
        self.simulate_seed()        # Seed physics
        self.simulate_root()        # Tree growth
    def simulate_soil(self):
        """Soil falls"""
        soil = self.tiles[SOIL]
        is_empty = soil == 0.0
        has_empty_space_below = shift_2d_tensor(is_empty.float(), dy=-1)
        can_fall = (soil.bool()) & (has_empty_space_below.bool())
        old_soil_locations = can_fall.float()
        new_soil_locations = shift_2d_tensor(can_fall.float(), dy=+1)
        soil = soil - old_soil_locations + new_soil_locations
        self.tiles[SOIL] = soil
    def simulate_water(self):
        """Water falls seeps into soil"""
        soil = self.tiles[SOIL]
        water = self.tiles[WATER]
        cavity = 1.0 - (0.875 * soil) - water          # 1/8 penetrates soil.
        cavity_below = shift_2d_tensor(cavity, dy=-1)
        d_water = -torch.min(cavity_below, water)
        d_water_below = shift_2d_tensor(-d_water, dy=+1)
        water = water + d_water + d_water_below
        self.tiles[WATER] = water
    def simulate_absorption(self):
        """Soil absorbs water"""
        soil = self.tiles[SOIL]
        water = self.tiles[WATER]
        moisture = self.tiles[MOISTURE]
        can_absorb_water = (soil * 0.125) - moisture
        will_absorb_water = torch.min(water, can_absorb_water)
        water -= will_absorb_water
        moisture += will_absorb_water
        self.tiles[WATER] = water
        self.tiles[MOISTURE] = moisture
    def simulate_light(self):
        soil = self.tiles[SOIL]
        light = self.tiles[LIGHT]
        heat = self.tiles[HEAT]
        light = shift_2d_tensor(light, dy=+1)   # photons goes down
        light[0, :] = 1.0                       # new photons get generated at the top.
        hit = light * soil
        light -= hit
        heat += hit
        self.tiles[LIGHT] = light
        self.tiles[HEAT] = heat
    def simulate_heat(self):
        heat = self.tiles[HEAT]
        heat *= 0.5
        self.tiles[HEAT] = heat
    def simulate_seed(self):
        # Seed falls until it is fully surrounded by soil.
        # Use convolution to check if seed is surrounded by soil.
        # Kernel [[1/9 1/9 1/9] [1/9 1/9 1/9] [1/9 1/9 1/9]] > 1.0 - EPSILON
        seed = self.tiles[SEED]
        soil = self.tiles[SOIL]
        root = self.tiles[ROOT]
        kernel = torch.ones((1, 1, 3, 3), device=seed.device) / 9.0
        surrounded = torch.nn.functional.conv2d(soil.unsqueeze(0).unsqueeze(0), kernel, padding=1).squeeze() > 1.0 - EPSILON
        can_fall = (seed > 0.0) & (~surrounded.bool())
        old_seed_locations = can_fall.float() * seed
        new_seed_locations = shift_2d_tensor(old_seed_locations, dy=+1)
        seed = seed - old_seed_locations + new_seed_locations
        seed_can_hatch = surrounded * seed # more conditions needed (like seeping moisture)
        seed_to_remove = seed_can_hatch
        seed = seed - seed_to_remove.float()
        root = root + seed_to_remove.float()
        self.tiles[SEED] = seed
        self.tiles[ROOT] = root
    def simulate_root(self):
        NEIGHBOUR_DELTAS = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        root_layer = self.tiles[ROOT]
        soil_layer = self.tiles[SOIL]
        tips = (root_layer > 0).nonzero(as_tuple=False)
        for y, x in tips.tolist():
            dirs = [(1, 0), (0, -1), (0, 1), (-1, 0)]  # growth options
            pyrandom.shuffle(dirs)
            grew = False
            for dy, dx in dirs:
                ny, nx = y + dy, x + dx
                if not (0 <= ny < self.height and 0 <= nx < self.width):
                    continue
                # 1️⃣ must be soil and empty
                if not (soil_layer[ny, nx] > 0 and root_layer[ny, nx].abs() < 1e-6):
                    continue
                # 2️⃣ no neighbouring roots other than the parent tip itself
                clash = False
                for ndy, ndx in NEIGHBOUR_DELTAS:
                    ay, ax = ny + ndy, nx + ndx
                    if (ay, ax) == (y, x):        # parent tip is OK
                        continue
                    if 0 <= ay < self.height and 0 <= ax < self.width:
                        if root_layer[ay, ax].abs() >= 1e-6:  # any root here?
                            clash = True
                            break
                if clash:
                    continue
                root_layer[ny, nx] = 1.0
                grew = True
                break
            if grew and random() < 0.9:
                root_layer[y, x] = -1.0