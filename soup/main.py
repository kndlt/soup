import fire
from .image_gen import generate_noise


def hello():
    """Say hello world."""
    print("Hello, world!")


def main():
    fire.Fire({
        'hello': hello,
        'generate-noise': generate_noise,
    })


if __name__ == "__main__":
    main()