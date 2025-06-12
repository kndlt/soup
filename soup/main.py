from .utils import chamber_to_ascii
from .chamber import Chamber

def main():
    tick = 0
    chamber = Chamber()
    while True:
        print(f"Tick {tick}-------------")
        print(chamber_to_ascii(chamber))
        input("-------------------")
        chamber.step()
        tick += 1
