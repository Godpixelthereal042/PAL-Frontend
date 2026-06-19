import PIL.Image as Image

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size

# Let's map y from 800 to 1020, and x from 40 to 740, with a step of 10
# For each step, if average pixel value is non-black, print '#', else '.'
print("ASCII Map of Folder Tabs (y = 800 to 1020, x = 40 to 740):")
for y in range(800, 1020, 5):
    line = []
    for x in range(40, 740, 10):
        r, g, b, *a = img.getpixel((x, y))
        if r > 15 or g > 15 or b > 15:
            line.append("#")
        else:
            line.append(".")
    print(f"y={y:3d} (vp={y/2:5.1f}): " + "".join(line))
