import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's scan y from 500 to 1650 at x = 390 and record color transitions
transitions = []
prev_color = img.getpixel((390, 500))[:3]
for y in range(501, 1650):
    color = img.getpixel((390, y))[:3]
    # Check if there is a significant color difference
    diff = sum(abs(c1 - c2) for c1, c2 in zip(color, prev_color))
    if diff > 30:
        transitions.append((y, prev_color, color))
    prev_color = color

print("Color transitions in the center column:")
for y, c1, c2 in transitions:
    print(f"y = {y}: {c1} -> {c2}")
