import torch
from soup.chamber import Chamber
from soup.constants import N_CHANNELS, SOIL

def test_soil_dropping():
    tiles = torch.zeros(N_CHANNELS, 2, 1)
    tiles[SOIL] = torch.tensor([[1.0],[0.0]])
    chamber = Chamber(width=1, height=2, tiles=tiles)
    chamber.step()
    expected = torch.tensor([[0.0],[1.0]])
    assert torch.equal(chamber.tiles[SOIL], expected)

def test_soil_should_not_drop_past_container():
    tiles = torch.zeros(N_CHANNELS, 1, 1)
    tiles[SOIL] = torch.tensor([[1.0]])
    chamber = Chamber(width=1, height=1, tiles=tiles)
    chamber.step()
    expected = torch.tensor([[1.0]])
    assert torch.equal(chamber.tiles[SOIL], expected)

if __name__ == "__main__":
    test_soil_dropping()
    test_soil_should_not_drop_past_container()
    print("Chamber tests passed! ✨")