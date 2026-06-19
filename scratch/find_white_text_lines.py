import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's inspect the entire folder stack vertical range: y = 600 to 1500
# For each row, find if there are white pixels (representing text, e.g. r, g, b > 210)
text_rows = []
for y in range(600, 1500):
    row_pixels = [img.getpixel((x, y)) for x in range(80, w - 80)]
    has_text = any(r > 210 and g > 210 and b > 210 for r, g, b, *a in row_pixels)
    if has_text:
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

print("Only White Text Lines detected in stack (y = 600 to 1500):")
for idx, (start, end) in enumerate(text_groups):
    print(f"  Line {idx:2d}: y = {start} to {end} (vp = {start/2:5.1f} to {end/2:5.1f})")
