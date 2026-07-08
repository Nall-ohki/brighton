import re

with open('index.css', 'r') as f:
    css = f.read()

def repl(m):
    bg_color = m.group(2)
    return m.group(1) + f" --tag-color: {bg_color};"

css = re.sub(r'(\.category-tag--[\w-]+\s*\{\s*background-color:\s*(.*?);)', repl, css)

inverse_css = """
.category-tag--inverse {
  background-color: transparent !important;
  color: var(--tag-color, var(--text-primary)) !important;
  border: 1px solid var(--tag-color, var(--border-color)) !important;
}
"""
if ".category-tag--inverse {" not in css:
    css += inverse_css

css = css.replace("min-height: 120px;", "min-height: 240px;")

with open('index.css', 'w') as f:
    f.write(css)
