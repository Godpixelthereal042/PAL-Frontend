import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's inspect along columns to find tab tops
# The tabs start on the left (e.g. x = 100) or center (x = 390)
# Let's scan from y = 500 to 1000 and look at colors at x = 100
# The background is black (0, 0, 0)
# A folder card starts when we hit a non-black pixel
# Let's print the first non-black pixel for several columns on the left:
columns = [50, 100, 150, 200, 250, 300, 350, 390]
for col in columns:
    found_y = None
    for y in range(500, 1200):
        r, g, b, *a = img.getpixel((col, y))
        if r > 15 or g > 15 or b > 15:
            found_y = y
            break
    print(f"Column x = {col}: first non-black pixel at y = {found_y} (viewport: {found_y/2 if found_y else None})")
