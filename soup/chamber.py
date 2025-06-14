import torch

from .utils import shift_2d_tensor, sum_2d_below
from .constants import SOIL, N_CHANNELS, WATER

class Chamber:
    def __init__(self, width, height, tiles=None, device=None):
        self.width, self.height = width, height
        if tiles is None:
            self.tiles = torch.zeros(N_CHANNELS, height, width, device=device)
            # self.tiles[SOIL, 0, width // 2] = 1.0  # drop of a soil
        else:
            assert tiles.shape == (N_CHANNELS, height, width)
            self.tiles = tiles
    @torch.no_grad()
    def step(self):
        """
        Perform a single step of the chamber simulation, updating the soil positions.
        """
        self.simulate_soil()
        self.simulate_water()
    def simulate_soil(self):
        soil = self.tiles[SOIL]
        is_empty = soil == 0.0
        has_empty_space_below = shift_2d_tensor(is_empty.float(), dy=-1)
        can_fall = (soil.bool()) & (has_empty_space_below.bool())
        old_soil_locations = can_fall.float()
        new_soil_locations = shift_2d_tensor(can_fall.float(), dy=+1)
        soil = soil - old_soil_locations + new_soil_locations
        self.tiles[SOIL] = soil
    def simulate_water(self):
        soil = self.tiles[SOIL]
        water = self.tiles[WATER]
        cavity = 1.0 - (0.875 * soil) - water
        cavity_below = shift_2d_tensor(cavity, dy=-1)
        d_water = -torch.min(cavity_below, water)
        d_water_below = shift_2d_tensor(-d_water, dy=+1)
        water = water + d_water + d_water_below
        self.tiles[WATER] = water



        

        
        