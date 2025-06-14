import torch
import colorama
from colorama import Back, Style
from .constants import SOIL, WATER

colorama.init()

def ai_generated(func):
    """Decorator to mark functions as AI-generated."""
    func._ai_generated = True
    return func

@ai_generated
def chamber_to_ascii(chamber):
    tiles = chamber.tiles # shape CxHxW
    rows = []
    for y in range(chamber.height):
        row = ""
        for x in range(chamber.width):
            tile = tiles[:, y, x]
            row += tile_to_ascii(tile)
        rows.append(row)
    return "\n".join(row for row in rows)

def tile_to_ascii(tile):
    bg = ""
    if tile[SOIL] > 0.1:
        bg = Back.YELLOW
    elif tile[WATER] > 0.1:
        bg = Back.BLUE
    return bg + "  " + Style.RESET_ALL

@ai_generated
def shift_2d_tensor(tensor, dy=0, dx=0):
    """
    Return tensor shifted by (dy,dx) with zero padding using convolution.
    """
    if dy == 0 and dx == 0:
        return tensor.clone()
    kernel_size = 2 * max(abs(dy), abs(dx)) + 1
    kernel = torch.zeros(kernel_size, kernel_size, dtype=tensor.dtype, device=tensor.device)
    center = kernel_size // 2
    kernel[center - dy, center - dx] = 1.0
    tensor_4d = tensor.unsqueeze(0).unsqueeze(0)  # [1, 1, H, W]
    kernel_4d = kernel.unsqueeze(0).unsqueeze(0)  # [1, 1, K, K]
    padding = kernel_size // 2
    result = torch.nn.functional.conv2d(tensor_4d, kernel_4d, padding=padding)
    return result.squeeze(0).squeeze(0)  # Back to [H, W]

@ai_generated
def sum_2d_below(tensor):
    """
    Return sum of the tensor elements below the current element.
    ex1: [[1.0, 1.0, 1.0],     [[2.0, 3.0, 2.0],
          [1.0, 1.0, 1.0]] ->   [0.0, 0.0, 0.0]]
    ex2: [[1.0, 1.0, 1.0],     [[1.0, 2.0, 1.0],
          [1.0, 0.0, 1.0]] ->   [0.0, 0.0, 0.0]]
    Implemented using convolution
    """
    # Create kernel for summing down-left, down, down-right
    kernel = torch.tensor([[0.0, 0.0, 0.0],
                          [0.0, 0.0, 0.0], 
                          [1.0, 1.0, 1.0]], dtype=tensor.dtype, device=tensor.device)
    
    # Convert to 4D for conv2d
    tensor_4d = tensor.unsqueeze(0).unsqueeze(0)  # [1, 1, H, W]
    kernel_4d = kernel.unsqueeze(0).unsqueeze(0)  # [1, 1, 3, 3]
    
    # Apply convolution with padding=1 to maintain size
    result = torch.nn.functional.conv2d(tensor_4d, kernel_4d, padding=1)
    return result.squeeze(0).squeeze(0)  # Back to [H, W]