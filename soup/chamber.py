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
        # Soil Dropping Logic
        soil = self.tiles[SOIL]
        is_empty = soil == 0.0
        has_empty_space_below = shift_2d_tensor(is_empty.float(), dy=-1)
        can_fall = (soil.bool()) & (has_empty_space_below.bool())
        old_soil_locations = can_fall.float()
        new_soil_locations = shift_2d_tensor(can_fall.float(), dy=+1)
        soil = soil - old_soil_locations + new_soil_locations
        self.tiles[SOIL] = soil
        