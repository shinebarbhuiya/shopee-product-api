from PIL import Image
import os

# Create icons directory if it doesn't exist
if not os.path.exists('icons'):
    os.makedirs('icons')

# Define icon sizes
icon_sizes = [16, 48, 128]

# Create a white image for each size
for size in icon_sizes:
    # Create a new white image
    img = Image.new('RGBA', (size, size), color=(255, 255, 255, 255))
    
    # Save the image
    img.save(f'icons/icon{size}.png')
    
    print(f"Created {size}x{size} icon: icons/icon{size}.png")

print("All icons created successfully!") 