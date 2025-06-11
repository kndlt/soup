import torch
from colorama import Back, Style

def chamber_to_ascii(chamber):
    total_density = torch.sum(chamber.tiles, dim=0)
    dominant = torch.argmax(chamber.tiles, dim=0)
    threshold = 0.5
    below_threshold = total_density < threshold
    scaleX = 2
    chars = [' ', ' ', ' ']  # AIR, WATER, SOIL
    bg_colors = [
        Back.LIGHTCYAN_EX, 
        Back.LIGHTBLUE_EX, 
        Back.LIGHTYELLOW_EX
    ]
    result_lines = []
    for row in range(chamber.height):
        line = ""
        for col in range(chamber.width):
            if below_threshold[row, col]:
                line += ' ' * scaleX
            else:
                tile_type = dominant[row, col].item()
                char = chars[tile_type]
                bg_color = bg_colors[tile_type]
                line += f"{bg_color}{char * scaleX}{Style.RESET_ALL}"
        result_lines.append(line)
    return '\n'.join(result_lines)