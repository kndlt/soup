import torch
import torchvision
from pathlib import Path


def generate_noise(size=128, filename="noise.png"):
    """Generate a random noise image and save it.
    
    Args:
        size: Size of the square image (default: 128)
        filename: Output filename (default: noise.png)
    """
    # Create random noise tensor (values between 0 and 1)
    noise_tensor = torch.rand(3, size, size)
    
    # Ensure output directory exists
    output_path = Path(filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save as image
    torchvision.utils.save_image(noise_tensor, filename)
    print(f"Saved {size}x{size} noise image to {filename}")