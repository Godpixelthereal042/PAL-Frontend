import os
import subprocess

ocr_path = "/Users/user/Documents/pal-frontend/scratch/ocr"
dir_path = "/Users/user/Documents/PAL"
output_file = "/Users/user/Documents/pal-frontend/scratch/ocr_results.txt"

files = [f"Onboading {i}.png" for i in range(1, 14)] + ["logo screen.png", "Swipe.png"]

with open(output_file, "w") as out:
    for f in files:
        p = os.path.join(dir_path, f)
        if os.path.exists(p):
            out.write(f"=== {f} ===\n")
            res = subprocess.run([ocr_path, p], capture_output=True, text=True)
            out.write(res.stdout)
            out.write("\n\n")

print("OCR complete. Results written to:", output_file)
