import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's find vertical regions. We can print the row averages or check for colored areas.
# Let's save a summary of colors or find where horizontal boundaries are.
# In a folder screen:
# Background is black (0, 0, 0, 255) mostly.
# Let's find row ranges that are not completely black/dark.

dark_threshold = 20
non_black_rows = []
for y in range(h):
    row_pixels = [img.getpixel((x, y)) for x in range(w)]
    # Check if any pixel is bright
    is_not_black = any(r > dark_threshold or g > dark_threshold or b > dark_threshold for r, g, b, *a in row_pixels)
    if is_not_black:
        non_black_rows.append(y)

# Let's group continuous non-black rows to see where sections are
groups = []
if non_black_rows:
    start = non_black_rows[0]
    prev = start
    for y in non_black_rows[1:]:
        if y > prev + 5:
            groups.append((start, prev))
            start = y
        prev = y
    groups.append((start, prev))

print("Non-black vertical groups (y-coordinates):")
for idx, (start, end) in enumerate(groups):
    print(f"Group {idx}: y = {start} to {end} (height = {end - start})")

# Let's also search for blue folders. In the mockup, there might be blue folders.
# Let's find rows containing blue pixels (e.g. b > 150 and r < 100)
blue_rows = []
for y in range(h):
    row_pixels = [img.getpixel((x, y)) for x in range(w)]
    has_blue = any(b > 150 and r < 100 for r, g, b, *a in row_pixels)
    if has_blue:
        blue_rows.append(y)

if blue_rows:
    print(f"Blue folder rows: y = {min(blue_rows)} to {max(blue_rows)} (total height = {max(blue_rows) - min(blue_rows)})")
    # Let's find continuous blue folder blocks
    blue_groups = []
    start = blue_rows[0]
    prev = start
    for y in blue_rows[1:]:
        if y > prev + 5:
            blue_groups.append((start, prev))
            start = y
        prev = y
    blue_groups.append((start, prev))
    print("Blue groups:")
    for idx, (start, end) in enumerate(blue_groups):
        print(f"  Blue Group {idx}: y = {start} to {end} (height = {end - start})")
