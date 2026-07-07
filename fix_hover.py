import re

with open('index.css', 'r') as f:
    content = f.read()

# Replace `.category-filter[data-category="..."]:hover, ` with nothing
content = re.sub(r'\.category-filter\[data-category="[^"]+"\]:hover,\s*', '', content)

# Also fix the general one:
# .category-filter[data-category]:hover,
# .category-filter[data-category].active {
content = content.replace('.category-filter[data-category]:hover,\n.category-filter[data-category].active {', '.category-filter[data-category].active {')
content = content.replace('.category-filter[data-category]:hover, .category-filter[data-category].active', '.category-filter[data-category].active')

with open('index.css', 'w') as f:
    f.write(content)

print("Fixed hover states.")
