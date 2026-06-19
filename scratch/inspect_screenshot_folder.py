import PIL.Image as Image
import math

img = Image.open('/Users/user/.gemini/antigravity/brain/0aa3cdc2-58c7-45e0-ac47-45a2de502bd4/media__1780600065221.png')
w, h = img.size
print(f"Screenshot size: {w}x{h}")

# Let's inspect column in the middle of the folder to detect the blue card bounds.
# The blue color is roughly rgb(59, 130, 246) or similar.
# Let's search for blue pixels in the middle column (x = w // 2)
middle_x = w // 2
blue_pixels = []
for y in range(h):
    r, g, b, *a = img.getpixel((middle_x, y))
    # Blue folder has strong blue component
    if b > 200 and r < 120 and g > 120:
        blue_pixels.append((y, (r, g, b)))

if blue_pixels:
    ys = [p[0] for p in blue_pixels]
    print(f"Blue pixels range: y = {min(ys)} to {max(ys)} (height = {max(ys) - min(ys) + 1})")
else:
    print("No blue folder pixels found.")
