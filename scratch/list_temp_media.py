import os
import time

dir_path = "/Users/user/.gemini/antigravity/brain/da6b21d9-6e3d-4ff3-9bd9-c849c33f6907/.tempmediaStorage"
files = [os.path.join(dir_path, f) for f in os.listdir(dir_path)]
files.sort(key=os.path.getmtime)

for f in files:
    print(f"{os.path.basename(f)} - {time.ctime(os.path.getmtime(f))} - {os.path.getsize(f)} bytes")
