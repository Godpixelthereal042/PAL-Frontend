import os
from PIL import Image

dir_path = "/Users/user/Documents/PAL"
files = sorted([f for f in os.listdir(dir_path) if f.startswith("Onboading") or "logo" in f.lower() or "swipe" in f.lower()])

for f in files:
    p = os.path.join(dir_path, f)
    if os.path.isfile(p):
        try:
            with Image.open(p) as img:
                print(f"{f}: {img.size} {img.format}")
        except Exception as e:
            print(f"{f}: {e}")
