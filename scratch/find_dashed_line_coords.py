import PIL.Image as Image

img = Image.open('/Users/user/.gemini/antigravity/brain/0aa3cdc2-58c7-45e0-ac47-45a2de502bd4/media__1780599294713.png')
w, h = img.size

# Let's search for rows between 100 and 900 that look like a dashed line.
# A dashed line will have alternating dark and light pixels.
# Let's count light pixels (say r > 180, g > 180, b > 180) in each row.
# A dashed line should have around 20 to 100 light pixels, and they should be spread out.
for y in range(100, 900):
    row_pixels = [img.getpixel((x, y))[:3] for x in range(w)]
    light_indices = [x for x, rgb in enumerate(row_pixels) if sum(rgb) > 550]
    
    # If there are light pixels and they are spread out (e.g. min x < 100, max x > 400)
    if len(light_indices) > 10 and len(light_indices) < 200:
        min_x, max_x = min(light_indices), max(light_indices)
        if min_x < 100 and max_x > 450:
            # Check if they are alternating (e.g. check standard deviation of gaps)
            gaps = [light_indices[i] - light_indices[i-1] for i in range(1, len(light_indices))]
            avg_gap = sum(gaps)/len(gaps) if gaps else 0
            if 3 < avg_gap < 40:
                print(f"Dashed line candidate at y = {y} (vp={y/2}): x = {min_x} to {max_x}, count = {len(light_indices)}, avg gap = {avg_gap:.1f}")
