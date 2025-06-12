import torch
from soup.chamber import Chamber
from soup.types import N_CHANNELS, SOIL

def test_soil_dropping():
    tiles = torch.zeros(N_CHANNELS, 2, 1)
    tiles[SOIL] = torch.tensor([[1.0],[0.0]])
    chamber = Chamber(tiles=tiles)
    chamber.step()
    expected = torch.tensor([[0.0],[1.0]])
    assert torch.equal(chamber.tiles[SOIL], expected)

if __name__ == "__main__":
    test_soil_dropping()
    print("Chamber tests passed! ✨")