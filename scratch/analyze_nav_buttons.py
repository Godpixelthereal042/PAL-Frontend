import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's check the colors of the bottom nav bar region (y = 1480 to 1620)
# We can scan horizontally along several y levels to locate active/colored regions
# For example, let's scan at y = 1530 (middle of the nav bar) from x = 40 to 740
print("Horizontal color scan at y = 1530:")
for x in range(40, 740, 20):
    r, g, b, *a = img.getpixel((x, 1530))
    print(f"x = {x} (vp={x/2:5.1f}): rgb = ({r}, {g}, {b})")
