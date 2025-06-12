import torch
from soup.utils import shift_2d_tensor

def test_shift_down():
    """Test shifting down (positive dy)"""
    tensor = torch.tensor([
        [1.0, 0.0],
        [0.0, 0.0]
    ])
    result = shift_2d_tensor(tensor, dy=1)
    expected = torch.tensor([
        [0.0, 0.0],
        [1.0, 0.0]
    ])
    assert torch.equal(result, expected), f"Expected {expected}, got {result}"

def test_shift_up():
    """Test shifting up (negative dy)"""
    tensor = torch.tensor([
        [0.0, 0.0],
        [1.0, 0.0]
    ])
    result = shift_2d_tensor(tensor, dy=-1)
    expected = torch.tensor([
        [1.0, 0.0],
        [0.0, 0.0]
    ])
    assert torch.equal(result, expected), f"Expected {expected}, got {result}"

def test_shift_right():
    """Test shifting right (positive dx)"""
    tensor = torch.tensor([
        [1.0, 0.0],
        [0.0, 0.0]
    ])
    result = shift_2d_tensor(tensor, dx=1)
    expected = torch.tensor([
        [0.0, 1.0],
        [0.0, 0.0]
    ])
    assert torch.equal(result, expected), f"Expected {expected}, got {result}"

def test_shift_left():
    """Test shifting left (negative dx)"""
    tensor = torch.tensor([
        [0.0, 1.0],
        [0.0, 0.0]
    ])
    result = shift_2d_tensor(tensor, dx=-1)
    expected = torch.tensor([
        [1.0, 0.0],
        [0.0, 0.0]
    ])
    assert torch.equal(result, expected), f"Expected {expected}, got {result}"

def test_no_shift():
    """Test no shift returns same tensor"""
    tensor = torch.tensor([
        [1.0, 0.0],
        [0.0, 1.0]
    ])
    result = shift_2d_tensor(tensor, dy=0, dx=0)
    assert torch.equal(result, tensor), f"Expected {tensor}, got {result}"

def test_shift_off_edge():
    """Test shifting completely off edge returns zeros"""
    tensor = torch.tensor([
        [1.0, 1.0],
        [1.0, 1.0]
    ])
    result = shift_2d_tensor(tensor, dy=-3)  # shift way up
    expected = torch.zeros_like(tensor)
    assert torch.equal(result, expected), f"Expected {expected}, got {result}"

if __name__ == "__main__":
    test_shift_down()
    test_shift_up()
    test_shift_right()
    test_shift_left()
    test_no_shift()
    test_shift_off_edge()
    print("All tests passed! 🎉")