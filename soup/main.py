from soup.constants import SEED, SOIL, TREE, WATER
from .utils import chamber_to_ascii
from .chamber import Chamber

def main():
    tick = 0
    chamber = Chamber(width=9, height=9)
    chamber.tiles[SOIL, -3:, :] = 1.0                   # 2 layer of soil
    chamber.tiles[SEED, 0, chamber.width // 2] = 1.0    # drop seed
    while True:
        # # Sprinkle Soil
        # if tick < chamber.width * 2:
        #     chamber.tiles[SOIL][0][tick % chamber.width] = 1.0
        # elif tick < chamber.width * 4:
        #     chamber.tiles[WATER][0][tick % chamber.width] = 0.125
        print(f"Tick {tick}------------")
        print(chamber_to_ascii(chamber))
        input("-------------------")
        chamber.step()
        tick += 1
