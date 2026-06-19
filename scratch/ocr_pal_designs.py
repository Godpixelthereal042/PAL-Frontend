import os
import subprocess

ocr_path = "/Users/user/Documents/pal-frontend/scratch/ocr"
swift_ocr_path = "/Users/user/Documents/pal-frontend/scratch/ocr.swift"
dir_path = "/Users/user/Documents/PAL"
output_file = "/Users/user/Documents/pal-frontend/scratch/ocr_pal_designs.txt"

files = [
    "Chat Pal 1.png",
    "Chat Pal 2.png",
    "Chat Pal 13.png",
    "Home screen.png",
    "Home.png",
    "Project screen.png",
    "Swipe.png",
    "logo screen.png"
]

with open(output_file, "w") as out:
    for f in files:
        p = os.path.join(dir_path, f)
        if os.path.exists(p):
            out.write(f"=== {f} ===\n")
            res = subprocess.run(["swift", swift_ocr_path, p], capture_output=True, text=True)
            out.write(res.stdout)
            out.write("\n\n")

print("OCR complete. Results written to:", output_file)
