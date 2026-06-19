import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's inspect vertical slices to see where elements are.
# Specifically, let's check for:
# 1. Plus button (+): In the mockup, is it a white plus inside a dark circle? Let's search for its color and position.
# 2. Bottom nav bar: Let's search for the bottom nav bar's outline or height.
# 3. Stacked folders: How many folders are visible, what are their top/bottom coordinates?

# Let's check the bottom nav bar at the very bottom (e.g. y = 1500 to 1688)
# Is there a rounded bar?
# Let's scan from bottom to top to find the first non-black, bordered horizontal shape.
nav_bg_detected = None
for y in range(h - 1, 1200, -1):
    row_pixels = [img.getpixel((x, y)) for x in range(w)]
    # Look for grey border color or blue active color (bg is black)
    # The bottom nav bar has buttons. One is Projects (blue bg) or Chat (blue bg).
    # Let's see if we find any row with active colors
    has_nav = any(b > 100 or g > 100 or r > 100 for r, g, b, *a in row_pixels)
    if has_nav:
        nav_bg_detected = y
        break

print(f"Bottom-most elements detected at y = {nav_bg_detected}")

# Let's analyze the y-coordinates of the stack:
# We know blue folder rows are y = 940 to 1459.
# Let's check what's above y = 940:
# Are there other folder tabs?
# Let's print the colors at x = 390 (middle) for y = 500 to 1000 in steps of 5.
print("Colors in the middle column (x = 390) for y = 500 to 1000:")
for y in range(500, 1000, 10):
    r, g, b, *a = img.getpixel((390, y))
    print(f"y = {y}: rgb = ({r}, {g}, {b})")
