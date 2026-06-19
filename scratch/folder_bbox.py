import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's inspect the blue color region around y = 944 to 1456
# Let's find all pixels in this range where b > 120 and r < 100, and print the min/max x and y coordinates
blue_pixels = []
for y in range(940, 1460):
    for x in range(w):
        r, g, b, *a = img.getpixel((x, y))
        if b > 120 and r < 100:
            blue_pixels.append((x, y))

if blue_pixels:
    xs = [p[0] for p in blue_pixels]
    ys = [p[1] for p in blue_pixels]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    print(f"Blue folder bounding box: x = {min_x} to {max_x} (width = {max_x - min_x}), y = {min_y} to {max_y} (height = {max_y - min_y})")
    print(f"In viewport pixels (div 2): width = {(max_x - min_x)/2}, height = {(max_y - min_y)/2}")
else:
    print("No blue pixels found in range.")
