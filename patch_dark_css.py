import re

with open("index.css", "r") as f:
    content = f.read()

# Remove [data-theme="dark"] selector blocks
# This regex matches [data-theme="dark"] { ... } or blocks starting with it
# Wait, it's safer to just do it manually if I view the file.
