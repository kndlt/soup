from soup.constants import SOIL
from .utils import chamber_to_ascii
from .chamber import Chamber

def main():
    tick = 0
    chamber = Chamber(width=8, height=8)
    while True:
        # Sprinkle Soil
        if tick < chamber.width * 2:
            chamber.tiles[SOIL][0][tick % chamber.width] = 1.0
        print(f"Tick {tick}------------")
        print(chamber_to_ascii(chamber))
        input("-------------------")
        chamber.step()
        tick += 1
