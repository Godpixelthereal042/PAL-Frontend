import filecmp

assets = [
    ("/Users/user/Documents/PAL/pal typography logo.png", "/Users/user/Documents/pal-frontend/public/assets/pal-logo.png"),
    ("/Users/user/Documents/PAL/logo screen.png", "/Users/user/Documents/pal-frontend/public/assets/pal-mascot.png"),
]

for src, dest in assets:
    print(f"Comparing {src} with {dest}: {filecmp.cmp(src, dest)}")
