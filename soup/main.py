import fire


def hello():
    """Say hello world."""
    print("Hello, world!")


def main():
    fire.Fire(hello)


if __name__ == "__main__":
    main()