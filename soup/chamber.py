from .chamber_to_ascii import chamber_to_ascii
import torch
import torchvision
from pathlib import Path
from enum import IntEnum

class TileType(IntEnum):
    AIR = 0
    WATER = 1
    SOIL = 2

class Chamber:
    """
    World is represented as a tile map in CxHxW tensor. 
    Channels encodes various aspect of the tile.
    - 0: Air amount
    - 1: Water amount
    - 2: Soil amount
    """
    def __init__(self, width=32, height=16):
        self.width = width
        self.height = height
        self.tiles = torch.rand(len(TileType), height, width)
    def __call__(self):
        return self.to_ascii()
    def to_ascii(self):
        return chamber_to_ascii(self)
