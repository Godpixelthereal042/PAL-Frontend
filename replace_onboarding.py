import re

with open('scratch/OnboardingScreen_orig.tsx', 'r') as f:
    orig = f.read()

with open('components/OnboardingScreen.tsx', 'r') as f:
    curr = f.read()

funcs_to_replace = [
    'GrowthIntro',
    'ManageIntro',
    'TogetherIntro',
    'PersonaScreen',
    'IndustryScreen',
    'CountryScreen',
    'LanguageScreen'
]

def extract_func(name, text):
    pattern = r"function " + name + r"\([^{]*\{.*?(?=^function |\Z)"
    match = re.search(pattern, text, re.DOTALL | re.MULTILINE)
    return match.group(0) if match else None

for func in funcs_to_replace:
    orig_func = extract_func(func, orig)
    curr_func = extract_func(func, curr)
    if orig_func and curr_func:
        # replace the function in curr
        curr = curr.replace(curr_func, orig_func)

with open('components/OnboardingScreen.tsx', 'w') as f:
    f.write(curr)
