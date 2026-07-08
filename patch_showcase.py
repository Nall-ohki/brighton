import re

with open('index.css', 'r') as f:
    css = f.read()

root_vars = """
  /* --- Card Typography Colors --- */
  --card-title-color: #5e4d9b;
  --card-author-color: #e67e22;
  --card-origin-color: #4b5563;
"""

dark_vars = """
  --card-title-color: #a78bfa; /* lighter purple */
  --card-author-color: #fb923c; /* lighter orange */
  --card-origin-color: #9ca3af; /* lighter grey */
"""

# Insert into :root
css = re.sub(r'(:root\s*\{)', r'\1\n' + root_vars, css, count=1)

# Insert into [data-theme="dark"]
css = re.sub(r'(\[data-theme="dark"\]\s*\{)', r'\1\n' + dark_vars, css, count=1)

with open('index.css', 'w') as f:
    f.write(css)

with open('showcase.tsx', 'r') as f:
    tsx = f.read()

# Replace inline styles with CSS variable usage
tsx = tsx.replace("color: '#5e4d9b'", "color: 'var(--card-title-color)'")
tsx = tsx.replace("color: '#e67e22'", "color: 'var(--card-author-color)'")
tsx = tsx.replace("color: '#4b5563'", "color: 'var(--card-origin-color)'")

with open('showcase.tsx', 'w') as f:
    f.write(tsx)

