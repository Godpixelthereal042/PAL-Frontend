import PIL.Image as Image

img = Image.open('/Users/user/.gemini/antigravity/brain/0aa3cdc2-58c7-45e0-ac47-45a2de502bd4/media__1780599294713.png')
w, h = img.size

# Let's search for selection handle color.
# In selection boxes, handles are blue dots (circles).
# E.g. rgb around (34, 123, 224) or similar bright blue, e.g. b > 200, r < 100, g > 100
# Let's find all pixels matching this color and print their coordinates.
handles = []
for y in range(h):
    for x in range(w):
        r, g, b, *a = img.getpixel((x, y))
        # Look for selection handle blue: b is high, g is medium/high, r is low
        # Let's find bright blue dots. E.g. b > 220 and g > 110 and r < 80
        if b > 220 and g > 110 and r < 80:
            handles.append((x, y))

if handles:
    xs = [p[0] for p in handles]
    ys = [p[1] for p in handles]
    print(f"Selection handle pixels: {len(handles)}")
    print(f"Bounding box of handle pixels: x = {min(xs)} to {max(xs)}, y = {min(ys)} to {max(ys)}")
    # Let's group them to find the centers of the dots
    # We expect 8 handles (corners and midpoints)
    # Let's print unique y values of the handles
    unique_ys = sorted(list(set(ys)))
    # Let's cluster y values that are within 5px of each other
    y_clusters = []
    if unique_ys:
        start = unique_ys[0]
        prev = start
        for y in unique_ys[1:]:
            if y > prev + 10:
                y_clusters.append((start, prev))
                start = y
            prev = y
        y_clusters.append((start, prev))
    print("Y-clusters for handles:")
    for start, end in y_clusters:
        print(f"  y = {start} to {end} (center: {(start+end)/2})")
else:
    print("No blue handles found.")
