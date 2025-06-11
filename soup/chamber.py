import torch
import torchvision
from pathlib import Path
from enum import IntEnum
from colorama import Back, Style

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
        return self.toAscii()
    def toAscii(self):
        total_density = torch.mean(self.tiles, dim=0)
        dominant = torch.argmax(self.tiles, dim=0)
        threshold = 0.2
        below_threshold = total_density < threshold
        scaleX = 2
        chars = [' ', ' ', ' ']  # AIR, WATER, SOIL
        bg_colors = [Back.CYAN, Back.BLUE, Back.YELLOW]
        result_lines = []
        for row in range(self.height):
            line = ""
            for col in range(self.width):
                if below_threshold[row, col]:
                    line += ' ' * scaleX
                else:
                    tile_type = dominant[row, col].item()
                    char = chars[tile_type]
                    bg_color = bg_colors[tile_type]
                    line += f"{bg_color}{char * scaleX}{Style.RESET_ALL}"
            result_lines.append(line)
        return '\n'.join(result_lines)
