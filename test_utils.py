import torch
from soup.utils import ai_generated, shift_2d_tensor, sum_2d_below

@ai_generated
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

@ai_generated
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

@ai_generated
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

@ai_generated
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

@ai_generated
def test_no_shift():
    """Test no shift returns same tensor"""
    tensor = torch.tensor([
        [1.0, 0.0],
        [0.0, 1.0]
    ])
    result = shift_2d_tensor(tensor, dy=0, dx=0)
    assert torch.equal(result, tensor), f"Expected {tensor}, got {result}"

@ai_generated
def test_shift_off_edge():
    """Test shifting completely off edge returns zeros"""
    tensor = torch.tensor([
        [1.0, 1.0],
        [1.0, 1.0]
    ])
    result = shift_2d_tensor(tensor, dy=-3)  # shift way up
    expected = torch.zeros_like(tensor)
    assert torch.equal(result, expected), f"Expected {expected}, got {result}"

@ai_generated
def test_sum_2d_below_example1():
    """Test the first example from the docstring."""
    input_tensor = torch.tensor([[1.0, 1.0, 1.0],
                                [1.0, 1.0, 1.0]])
    expected = torch.tensor([[2.0, 3.0, 2.0],
                            [0.0, 0.0, 0.0]])
    result = sum_2d_below(input_tensor)
    assert torch.allclose(result, expected)

@ai_generated
def test_sum_2d_below_example2():
    """Test the second example from the docstring."""
    input_tensor = torch.tensor([[1.0, 1.0, 1.0],
                                [1.0, 0.0, 1.0]])
    expected = torch.tensor([[1.0, 2.0, 1.0],
                            [0.0, 0.0, 0.0]])
    result = sum_2d_below(input_tensor)
    assert torch.allclose(result, expected)

if __name__ == "__main__":
    test_shift_down()
    test_shift_up()
    test_shift_right()
    test_shift_left()
    test_no_shift()
    test_shift_off_edge()
    test_sum_2d_below_example1()
    test_sum_2d_below_example2()
    print("All tests passed! 🎉")