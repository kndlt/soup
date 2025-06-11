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
    We are looking at a 2D slice of a 3D world.
    Channels encodes various aspect of the tile.
    - 0: Air amount
    - 1: Water amount
    - 2: Soil amount
    """
    def __init__(self, width=8, height=4):
        self.width = width
        self.height = height
        self.tick = 0
        self.tiles = torch.rand(len(TileType), height, width)
    def __call__(self):
        while True:
            if self.tick != 0:
                self.forward()
            print(self)
            input()
            self.tick += 1
    def to_ascii(self):
        return chamber_to_ascii(self)
    def __str__(self):
        return f"Chamber t={self.tick}\n{self.to_ascii()}"
    def forward(self):
        with torch.no_grad():  
            # TODO: Implement...
            tiles = self.tiles.clone()
            self.tick += 1
    
        