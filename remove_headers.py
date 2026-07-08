import re
import os

files = [
    'advice.tsx',
    'showcase.tsx',
    'brighton.tsx',
    'libraries.tsx',
    'prompt_builder.tsx'
]

for filename in files:
    with open(filename, 'r') as f:
        content = f.read()
    
    # Replace the `<header> ... </header>` block. 
    # Use re.sub with DOTALL to match across newlines
    new_content = re.sub(r'\s*<header>\s*<h1>.*?</h1>\s*<p>.*?</p>\s*</header>\s*', '\n', content, flags=re.DOTALL)
    
    with open(filename, 'w') as f:
        f.write(new_content)

print("Headers removed from 5 files.")
