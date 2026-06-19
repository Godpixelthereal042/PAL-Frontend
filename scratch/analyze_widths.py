import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's inspect the bright blue background card (Card 3) at y = 800
# Find the min and max x-coordinates where color is bright blue (b > 150 and r < 100)
blue_pixels_800 = []
for x in range(w):
    r, g, b, *a = img.getpixel((x, 800))
    if b > 150 and r < 100:
        blue_pixels_800.append(x)

# Let's inspect the bright blue front card (Card 1) at y = 1200
# Find the min and max x-coordinates where color is bright blue
blue_pixels_1200 = []
for x in range(w):
    r, g, b, *a = img.getpixel((x, 1200))
    if b > 150 and r < 100:
        blue_pixels_1200.append(x)

print(f"Card 3 (y=800) x-range: {min(blue_pixels_800)} to {max(blue_pixels_800)} (width = {max(blue_pixels_800) - min(blue_pixels_800)})")
print(f"Card 1 (y=1200) x-range: {min(blue_pixels_1200)} to {max(blue_pixels_1200)} (width = {max(blue_pixels_1200) - min(blue_pixels_1200)})")
