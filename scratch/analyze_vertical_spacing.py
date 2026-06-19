import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size
print(f"Mockup Size: {w}x{h}")

# Let's inspect column 100 for text lines.
# We can find rows with non-black pixels from y = 100 to y = 600.
text_rows = []
for y in range(100, 600):
    row_pixels = [img.getpixel((x, y)) for x in range(50, w - 50)]
    is_text = any(r > 150 and g > 150 and b > 150 for r, g, b, *a in row_pixels)
    if is_text:
        text_rows.append(y)

# Group text rows
text_groups = []
if text_rows:
    start = text_rows[0]
    prev = start
    for y in text_rows[1:]:
        if y > prev + 5:
            text_groups.append((start, prev))
            start = y
        prev = y
    text_groups.append((start, prev))

print("Text lines y-coordinates (mockup):")
for idx, (start, end) in enumerate(text_groups):
    print(f"  Line {idx}: y = {start} to {end} (vp = {start/2:.1f} to {end/2:.1f})")

# Let's check where the bottom nav bar starts
# In the mockup, there's a rounded navigation container at the bottom.
# Let's scan from y = 1400 to 1688 to find the rounded container border.
nav_rows = []
for y in range(1400, 1688):
    row_pixels = [img.getpixel((x, y)) for x in range(50, w - 50)]
    # Look for grey border color (roughly (50, 50, 50)) or blue button
    has_nav = any(r > 40 or g > 40 or b > 40 for r, g, b, *a in row_pixels)
    if has_nav:
        nav_rows.append(y)

if nav_rows:
    print(f"Bottom Nav Container y-range: {min(nav_rows)} to {max(nav_rows)} (vp = {min(nav_rows)/2:.1f} to {max(nav_rows)/2:.1f})")
