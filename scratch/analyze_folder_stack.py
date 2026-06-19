import PIL.Image as Image
import math

img = Image.open('/Users/user/Downloads/Pal zip/Project screen.png')
w, h = img.size
print(f"Mockup Size: {w}x{h}")

colors = []
for y in range(500, 1500):
    r, g, b, *a = img.getpixel((390, y))
    colors.append((y, (r, g, b)))

def rgb_dist(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

current_group = []
for y, rgb in colors:
    if not current_group:
        current_group = [(y, rgb)]
    else:
        prev_y, prev_rgb = current_group[-1]
        dist = rgb_dist(rgb, prev_rgb)
        if dist < 15:
            current_group.append((y, rgb))
        else:
            avg_r = sum(c[1][0] for c in current_group) // len(current_group)
            avg_g = sum(c[1][1] for c in current_group) // len(current_group)
            avg_b = sum(c[1][2] for c in current_group) // len(current_group)
            print(f"y = {current_group[0][0]} to {current_group[-1][0]} (height={current_group[-1][0]-current_group[0][0]+1}): Avg RGB = ({avg_r}, {avg_g}, {avg_b})")
            current_group = [(y, rgb)]

if current_group:
    avg_r = sum(c[1][0] for c in current_group) // len(current_group)
    avg_g = sum(c[1][1] for c in current_group) // len(current_group)
    avg_b = sum(c[1][2] for c in current_group) // len(current_group)
    print(f"y = {current_group[0][0]} to {current_group[-1][0]} (height={current_group[-1][0]-current_group[0][0]+1}): Avg RGB = ({avg_r}, {avg_g}, {avg_b})")
