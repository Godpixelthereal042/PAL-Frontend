import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's inspect the bottom nav bar region: y = 1460 to 1660
# Let's print rows where non-black elements exist, and their bounding box
nav_pixels = []
for y in range(1460, 1660):
    for x in range(w):
        r, g, b, *a = img.getpixel((x, y))
        # If not black
        if r > 10 or g > 10 or b > 10:
            nav_pixels.append((x, y))

if nav_pixels:
    xs = [p[0] for p in nav_pixels]
    ys = [p[1] for p in nav_pixels]
    print(f"Nav bar region: x = {min(xs)} to {max(xs)} (width = {max(xs) - min(xs)}), y = {min(ys)} to {max(ys)} (height = {max(ys) - min(ys)})")
    print(f"Viewport (div 2): width = {(max(xs) - min(xs))/2}, height = {(max(ys) - min(ys))/2}")
else:
    print("No nav bar pixels found.")
