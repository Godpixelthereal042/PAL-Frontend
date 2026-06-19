import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's search inside the folder area of Card 1: y = 981 to 1456, x = 100 to 600
# We want to find rows with high brightness (representing white/light text)
text_rows = []
for y in range(981, 1456):
    # Scan horizontally
    row_pixels = [img.getpixel((x, y)) for x in range(100, 600)]
    # Look for white-ish or light blue-ish text
    has_text = any(r > 200 and g > 200 and b > 200 for r, g, b, *a in row_pixels)
    if has_text:
        text_rows.append(y)

# Group text rows
text_groups = []
if text_rows:
    start = text_rows[0]
    prev = start
    for y in text_rows[1:]:
        if y > prev + 4:
            text_groups.append((start, prev))
            start = y
        prev = y
    text_groups.append((start, prev))

print("Text lines inside Card 1 (y = 981 to 1456):")
for idx, (start, end) in enumerate(text_groups):
    rel_start = start - 981
    rel_end = end - 981
    print(f"  Line {idx}: y = {start} to {end} (vp = {start/2:.1f} to {end/2:.1f}), Relative to Card Top: {rel_start} to {rel_end} (vp = {rel_start/2:.1f} to {rel_end/2:.1f})")
