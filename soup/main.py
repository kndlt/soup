import fire
import colorama
from .chamber import Chamber

colorama.init()

def main():
    fire.Fire(Chamber)
