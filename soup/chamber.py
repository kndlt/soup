import torch

from .utils import shift_2d_tensor
from .types import SOIL, N_CHANNELS

class Chamber:
    def __init__(self, width=3, height=3, tiles=None, device=None):
        self.width, self.height = width, height
        if tiles is None:
            self.tiles = torch.zeros(N_CHANNELS, height, width, device=device)
            self.tiles[SOIL, 0, width // 2] = 1.0  # drop of a soil
        else:
            self.tiles = tiles
    @torch.no_grad()
    def step(self):
        soil = self.tiles[SOIL]
        is_empty = soil == 0.0
        has_empty_space_below = shift_2d_tensor(is_empty.float(), dy=-1)
        old_soil_locations = soil * has_empty_space_below
        new_soil_locations = shift_2d_tensor(has_empty_space_below.float() * soil, dy=+1)
        soil = soil - old_soil_locations + new_soil_locations
        self.tiles[SOIL] = soil
